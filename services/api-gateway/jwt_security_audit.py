"""JWT security audit CLI for the API gateway.

The tool combines black-box endpoint tests and codebase static checks aligned with
OWASP JWT guidance. It can:
- Acquire JWTs automatically using credentials (supports MFA challenge flow).
- Run one or more vulnerability checks or run all checks.
- Emit a readable terminal report and optional JSON output.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable

import httpx
import jwt
from jwt import InvalidTokenError


SEVERITY_ORDER = {"critical": 4, "high": 3, "medium": 2, "low": 1, "info": 0}


@dataclass
class Finding:
    check_id: str
    title: str
    status: str
    severity: str
    details: str
    recommendation: str
    evidence: dict[str, Any]


@dataclass
class AuditContext:
    base_url: str
    token: str | None
    refresh_token: str | None
    endpoint: str
    endpoint_method: str
    timeout_seconds: float
    project_root: Path


def b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def b64url_decode(raw: str) -> bytes:
    pad = "=" * ((4 - len(raw) % 4) % 4)
    return base64.urlsafe_b64decode((raw + pad).encode("ascii"))


def normalize_url(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"


def split_token(token: str) -> tuple[dict[str, Any], dict[str, Any], str]:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("JWT must contain exactly 3 parts")
    header = json.loads(b64url_decode(parts[0]))
    payload = json.loads(b64url_decode(parts[1]))
    return header, payload, parts[2]


def build_none_token(payload: dict[str, Any]) -> str:
    header = {"alg": "none", "typ": "JWT"}
    return f"{b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))}." \
           f"{b64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))}."


def load_wordlist(path: str | None) -> list[str]: 
    defaults = [
        "changeme",
        "secret",
        "jwtsecret",
        "password",
        "123456",
        "defaultsecret",
        "devsecret",
        "mysecretkey",
    ]
    if not path:
        return defaults
    words: list[str] = []
    with open(path, "r", encoding="utf-8", errors="ignore") as fh:
        for line in fh:
            word = line.strip()
            if word:
                words.append(word)
    return words or defaults


def acquire_token(
    *,
    base_url: str,
    timeout_seconds: float,
    username: str | None,
    password: str | None,
    login_path: str,
    mfa_verify_path: str,
    mfa_code: str | None,
) -> tuple[str | None, str | None, dict[str, Any]]:
    if not username or not password:
        return None, None, {"mode": "no-credentials"}

    meta: dict[str, Any] = {"mode": "credentials", "mfa_flow": False}
    with httpx.Client(timeout=timeout_seconds) as client:
        login_resp = client.post(
            normalize_url(base_url, login_path),
            json={"email": username, "password": password},
        )
        meta["login_status"] = login_resp.status_code
        if login_resp.status_code >= 400:
            raise RuntimeError(
                f"Login failed ({login_resp.status_code}): {login_resp.text[:200]}"
            )

        data = login_resp.json()
        if data.get("access_token"):
            return str(data.get("access_token")), data.get("refresh_token"), meta

        if data.get("mfa_required") and data.get("mfa_token"):
            meta["mfa_flow"] = True
            if not mfa_code:
                raise RuntimeError(
                    "MFA is required. Provide --mfa-code or set JWT_AUDIT_MFA_CODE."
                )
            verify_resp = client.post(
                normalize_url(base_url, mfa_verify_path),
                json={"mfa_token": data["mfa_token"], "code": mfa_code},
            )
            meta["mfa_verify_status"] = verify_resp.status_code
            if verify_resp.status_code >= 400:
                raise RuntimeError(
                    f"MFA verify failed ({verify_resp.status_code}): {verify_resp.text[:200]}"
                )
            verify_data = verify_resp.json()
            print(f"Login with MFA successful. Response: {verify_data}")
            return (
                str(verify_data.get("access_token")),
                verify_data.get("refresh_token"),
                meta,
            )

        raise RuntimeError("Login succeeded but access token was not returned.")


def call_probe_endpoint(ctx: AuditContext, token: str) -> tuple[int, str]: #"""Call the protected endpoint using the provided token and return status and body snippet."""
    headers = {"Authorization": f"Bearer {token}"}
    url = normalize_url(ctx.base_url, ctx.endpoint)
    with httpx.Client(timeout=ctx.timeout_seconds) as client:
        method = ctx.endpoint_method.upper()
        if method == "GET":
            resp = client.get(url, headers=headers)
        elif method == "POST":
            resp = client.post(url, headers=headers)
        elif method == "PUT":
            resp = client.put(url, headers=headers)
        elif method == "PATCH":
            resp = client.patch(url, headers=headers)
        elif method == "DELETE":
            resp = client.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported probe method: {ctx.endpoint_method}")
    return resp.status_code, resp.text[:300]


def check_none_alg_acceptance(ctx: AuditContext) -> Finding:
    if not ctx.token:
        return Finding(
            "none-alg-acceptance",
            "None Algorithm Acceptance",
            "SKIP",
            "info",
            "No token available for active test.",
            "Provide --token or credentials to run active checks.",
            {},
        )

    _, payload, _ = split_token(ctx.token)
    payload = dict(payload)
    payload["role"] = "admin"
    payload["sub"] = "attacker"
    payload["iat"] = int(time.time())
    payload["nbf"] = int(time.time())
    payload["exp"] = int(time.time()) + 600
    forged = build_none_token(payload)

    status_code, body = call_probe_endpoint(ctx, forged)
    accepted = status_code not in (401, 403)
    return Finding(
        "none-alg-acceptance",
        "None Algorithm Acceptance",
        "FAIL" if accepted else "PASS",
        "critical" if accepted else "low",
        "Server accepted token with alg=none" if accepted else "Server rejected alg=none token.",
        "Pin accepted algorithms and reject unsigned tokens.",
        {"probe_status": status_code, "response_snippet": body},
    )


def check_tampered_token_rejection(ctx: AuditContext) -> Finding:
    if not ctx.token:
        return Finding(
            "signature-tamper-rejection",
            "Tampered Token Rejection",
            "SKIP",
            "info",
            "No token available for active tamper test.",
            "Provide --token or credentials to run active checks.",
            {},
        )

    parts = ctx.token.split(".")
    if len(parts) != 3:
        return Finding(
            "signature-tamper-rejection",
            "Tampered Token Rejection",
            "ERROR",
            "medium",
            "Token format is invalid and cannot be tampered for this check.",
            "Use a valid JWT.",
            {},
        )

    payload_raw = b64url_decode(parts[1])
    payload_raw = payload_raw[:-1] + (b"0" if payload_raw[-1:] != b"0" else b"1") # Simple byte-level tampering to break signature without changing structure
    tampered = f"{parts[0]}.{b64url_encode(payload_raw)}.{parts[2]}"

    status_code, body = call_probe_endpoint(ctx, tampered)
    accepted = status_code not in (401, 403)
    return Finding(
        "signature-tamper-rejection",
        "Tampered Token Rejection",
        "FAIL" if accepted else "PASS",
        "critical" if accepted else "low",
        "Server accepted payload-tampered token" if accepted else "Server rejected tampered token.",
        "Always verify signature and reject any modified token.",
        {"probe_status": status_code, "response_snippet": body},
    )


def check_weak_secret(ctx: AuditContext, wordlist_path: str | None) -> Finding:
    if not ctx.token:
        return Finding(
            "weak-secret",
            "Weak HMAC Secret",
            "SKIP",
            "info",
            "No token available for weak secret check.",
            "Provide --token or credentials.",
            {},
        )

    header, _, _ = split_token(ctx.token)
    alg = str(header.get("alg", ""))
    if not alg.startswith("HS"):
        return Finding(
            "weak-secret",
            "Weak HMAC Secret",
            "INFO",
            "info",
            f"Token algorithm is {alg}; this offline dictionary check is specific to HS*.",
            "Use asymmetric signing where possible and rotate keys regularly.",
            {"algorithm": alg},
        )

    candidates = load_wordlist(wordlist_path)
    for candidate in candidates:
        try:
            jwt.decode(
                ctx.token,
                candidate,
                algorithms=[alg],
                options={
                    "verify_signature": True,
                    "verify_exp": False,
                    "verify_nbf": False,
                    "verify_iat": False,
                    "verify_aud": False,
                    "verify_iss": False,
                },
            )
            return Finding(
                "weak-secret",
                "Weak HMAC Secret",
                "FAIL",
                "high",
                "Token signature validated with a common dictionary candidate.",
                "Use a strong random secret of at least 64 characters and rotate it.",
                {"cracked_secret": candidate, "tested_candidates": len(candidates)},
            )
        except InvalidTokenError:
            continue

    return Finding(
        "weak-secret",
        "Weak HMAC Secret",
        "PASS",
        "low",
        "Did not crack token using supplied/common weak secret candidates.",
        "Keep using long random secrets and key rotation.",
        {"tested_candidates": len(candidates)},
    )


def check_claim_hardening(ctx: AuditContext, max_access_ttl_seconds: int) -> Finding:
    if not ctx.token:
        return Finding(
            "claim-hardening",
            "Claims Hardening",
            "SKIP",
            "info",
            "No token available for claim hardening checks.",
            "Provide --token or credentials.",
            {},
        )

    _, payload, _ = split_token(ctx.token)
    missing = [c for c in ("exp", "iat", "nbf", "iss", "aud", "jti", "sub") if c not in payload]
    bad_types: list[str] = []
    for claim in ("exp", "iat", "nbf"):
        if claim in payload and not isinstance(payload[claim], (int, float)):
            bad_types.append(claim)

    ttl = None
    if "exp" in payload and "iat" in payload:
        try:
            ttl = int(payload["exp"]) - int(payload["iat"])
        except Exception:
            ttl = None

    issues: list[str] = []
    if missing:
        issues.append(f"Missing required claims: {', '.join(missing)}")
    if bad_types:
        issues.append(f"Non-numeric time claims: {', '.join(bad_types)}")
    if ttl is not None and ttl > max_access_ttl_seconds:
        issues.append(f"TTL {ttl}s exceeds policy threshold {max_access_ttl_seconds}s")

    risky_keys = {
        "password",
        "pass",
        "secret",
        "api_key",
        "private_key",
        "ssn",
        "credit_card",
    }
    payload_keys = {str(k).lower() for k in payload.keys()}
    disclosure_hits = sorted(payload_keys.intersection(risky_keys))
    if disclosure_hits:
        issues.append("Sensitive claim names detected: " + ", ".join(disclosure_hits))

    if "typ" not in split_token(ctx.token)[0]:
        issues.append("JWT header missing typ field")

    has_context_binding = any(k in payload_keys for k in ("cnf", "fingerprint", "userfingerprint", "fp", "jkt"))
    if not has_context_binding:
        issues.append("No token context-binding claim detected (sidejacking hardening)")

    failed = bool(issues)
    return Finding(
        "claim-hardening",
        "Claim and Header Hardening",
        "FAIL" if failed else "PASS",
        "high" if failed else "low",
        "; ".join(issues) if issues else "Claims and header checks look good.",
        "Include required claims, keep short TTL, avoid sensitive payload data, and consider context binding.",
        {"ttl_seconds": ttl, "payload_keys": sorted(payload_keys)},
    )


def check_revocation_flow(ctx: AuditContext) -> Finding:
    if not ctx.token:
        return Finding(
            "revocation-flow",
            "Token Revocation Flow",
            "SKIP",
            "info",
            "No token available for revocation test.",
            "Provide --token or credentials.",
            {},
        )

    if not ctx.refresh_token:
        return Finding(
            "revocation-flow",
            "Token Revocation Flow",
            "SKIP",
            "info",
            "No refresh token available; cannot trigger logout-based revocation.",
            "Use credential-based acquisition so both access and refresh tokens are available.",
            {},
        )

    logout_url = normalize_url(ctx.base_url, "/v1/auth/logout")
    with httpx.Client(timeout=ctx.timeout_seconds) as client:
        logout_resp = client.post(
            logout_url,
            headers={"Authorization": f"Bearer {ctx.token}"},
            json={"refresh_token": ctx.refresh_token},
        )

    if logout_resp.status_code >= 400:
        return Finding(
            "revocation-flow",
            "Token Revocation Flow",
            "WARN",
            "medium",
            f"Logout call failed ({logout_resp.status_code}); revocation could not be validated.",
            "Verify logout endpoint behavior and retry with valid credentials.",
            {"logout_status": logout_resp.status_code, "logout_body": logout_resp.text[:240]},
        )

    probe_status, probe_body = call_probe_endpoint(ctx, ctx.token)
    accepted = probe_status not in (401, 403)
    return Finding(
        "revocation-flow",
        "Token Revocation Flow",
        "FAIL" if accepted else "PASS",
        "high" if accepted else "low",
        "Revoked token still accepted by protected endpoint."
        if accepted
        else "Revoked token was rejected by protected endpoint.",
        "Ensure blacklist/revocation checks are enforced for all protected endpoints.",
        {
            "logout_status": logout_resp.status_code,
            "post_logout_probe_status": probe_status,
            "post_logout_probe_body": probe_body,
        },
    )


def check_insecure_defaults(ctx: AuditContext) -> Finding:
    config_path = ctx.project_root / "app" / "core" / "config.py"
    if not config_path.exists():
        return Finding(
            "insecure-defaults",
            "Insecure JWT Defaults",
            "ERROR",
            "medium",
            "Config file not found for static check.",
            "Validate runtime settings manually.",
            {"path": str(config_path)},
        )

    text = config_path.read_text(encoding="utf-8", errors="ignore")
    issues = []
    if re.search(r"JWT_SECRET\s*:\s*str\s*=\s*\"changeme\"", text):
        issues.append("JWT_SECRET has insecure default 'changeme'.")
    if re.search(r"SECRET_KEY\s*:\s*str\s*=\s*\"changeme\"", text):
        issues.append("SECRET_KEY has insecure default 'changeme'.")

    return Finding(
        "insecure-defaults",
        "Insecure JWT Defaults",
        "FAIL" if issues else "PASS",
        "medium" if issues else "low",
        "; ".join(issues) if issues else "No obvious insecure JWT defaults found.",
        "Use environment-injected secrets in all environments; never keep weak defaults.",
        {"config_path": str(config_path)},
    )


def iter_python_files(root: Path) -> list[Path]:
    return [p for p in root.rglob("*.py") if ".venv" not in p.parts and "__pycache__" not in p.parts]


def check_pyjwt_misuse(ctx: AuditContext) -> Finding:
    patterns = {
        "verify_false": re.compile(r"jwt\.decode\([^\n]*verify\s*=\s*False"),
        "verify_signature_false": re.compile(r"verify_signature\s*[:=]\s*False"),
        "alg_none_literal": re.compile(r"algorithms\s*=\s*\[[^\]]*['\"]none['\"]", re.IGNORECASE),
    }

    hits: list[dict[str, Any]] = []
    for py_file in iter_python_files(ctx.project_root):
        text = py_file.read_text(encoding="utf-8", errors="ignore")
        for key, pattern in patterns.items():
            for m in pattern.finditer(text):
                line = text.count("\n", 0, m.start()) + 1
                hits.append({"pattern": key, "file": str(py_file), "line": line})

    return Finding(
        "pyjwt-misuse",
        "PyJWT Misuse Patterns",
        "FAIL" if hits else "PASS",
        "high" if hits else "low",
        f"Found {len(hits)} suspicious decode/algorithm usage patterns." if hits else "No obvious dangerous PyJWT usage patterns found.",
        "Ensure signature verification is always enabled and algorithms are pinned to approved values.",
        {"matches": hits[:50], "match_count": len(hits)},
    )


def check_client_storage(ctx: AuditContext) -> Finding:
    frontend_root = ctx.project_root.parent.parent / "Fontend" / "src"
    if not frontend_root.exists():
        return Finding(
            "client-token-storage",
            "Client Token Storage Risks",
            "INFO",
            "info",
            "Frontend source not found; storage checks skipped.",
            "Review client token storage manually.",
            {"path": str(frontend_root)},
        )

    hits: list[dict[str, Any]] = []
    patterns = [
        re.compile(r"localStorage\.setItem\([^\n]*access", re.IGNORECASE),
        re.compile(r"sessionStorage\.setItem\([^\n]*access", re.IGNORECASE),
    ]
    for ts_file in frontend_root.rglob("*.ts"):
        text = ts_file.read_text(encoding="utf-8", errors="ignore")
        for pattern in patterns:
            for m in pattern.finditer(text):
                hits.append(
                    {
                        "file": str(ts_file),
                        "line": text.count("\n", 0, m.start()) + 1,
                        "snippet": text[m.start(): m.start() + 120].strip(),
                    }
                )
    for tsx_file in frontend_root.rglob("*.tsx"):
        text = tsx_file.read_text(encoding="utf-8", errors="ignore")
        for pattern in patterns:
            for m in pattern.finditer(text):
                hits.append(
                    {
                        "file": str(tsx_file),
                        "line": text.count("\n", 0, m.start()) + 1,
                        "snippet": text[m.start(): m.start() + 120].strip(),
                    }
                )

    if hits:
        return Finding(
            "client-token-storage",
            "Client Token Storage Risks",
            "WARN",
            "medium",
            "Access token appears to be stored in browser storage, increasing XSS replay risk.",
            "Use short-lived tokens, CSP hardening, and consider hardened cookie + CSRF protections.",
            {"matches": hits[:40], "match_count": len(hits)},
        )

    return Finding(
        "client-token-storage",
        "Client Token Storage Risks",
        "PASS",
        "low",
        "No obvious access token browser storage patterns found.",
        "Continue enforcing secure token storage policy.",
        {"match_count": 0},
    )


CHECKS: dict[str, tuple[str, Callable[..., Finding]]] = {
    "none-alg-acceptance": (
        "Test whether a forged alg=none token is accepted by a protected endpoint.",
        check_none_alg_acceptance,
    ),
    "signature-tamper-rejection": (
        "Test whether payload tampering is rejected (signature integrity enforcement).",
        check_tampered_token_rejection,
    ),
    "weak-secret": (
        "Offline dictionary check for weak HS* signing secret (OWASP Weak Token Secret).",
        check_weak_secret,
    ),
    "claim-hardening": (
        "Check critical claims, TTL, sensitive data exposure, typ header, and context binding.",
        check_claim_hardening,
    ),
    "revocation-flow": (
        "Test logout-based revocation and post-logout token reuse rejection.",
        check_revocation_flow,
    ),
    "insecure-defaults": (
        "Static check for insecure JWT defaults in settings (e.g., changeme).",
        check_insecure_defaults,
    ),
    "pyjwt-misuse": (
        "Static check for dangerous PyJWT usage patterns (verify disabled, none alg, etc.).",
        check_pyjwt_misuse,
    ),
    "client-token-storage": (
        "Static frontend check for token storage in local/session storage (OWASP storage risk).",
        check_client_storage,
    ),
}


def parse_args() -> argparse.Namespace:
    check_help_lines = [
        "Available checks:",
        "  all: Run every check below.",
    ]
    for name, (desc, _) in CHECKS.items():
        check_help_lines.append(f"  {name}: {desc}")

    parser = argparse.ArgumentParser(
        prog="jwt_security_audit",
        description="JWT security audit tool for this codebase (OWASP-aligned).",
        epilog="\n".join(check_help_lines),
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="API base URL.")
    parser.add_argument("--endpoint", default="/v1/auth/2fa/setup", help="Protected endpoint used by active token checks.")
    parser.add_argument(
        "--endpoint-method",
        choices=["GET", "POST", "PUT", "PATCH", "DELETE"],
        default="POST",
        help="HTTP method for --endpoint during active checks.",
    )
    parser.add_argument("--token", help="Access JWT to test. If omitted, credentials can be used.")
    parser.add_argument("--username", help="Login username/email for token retrieval.")
    parser.add_argument("--password", help="Login password for token retrieval.")
    parser.add_argument("--login-path", default="/v1/auth/login", help="Login endpoint path.")
    parser.add_argument(
        "--mfa-verify-path",
        default="/v1/auth/2fa/verify-login",
        help="MFA verify endpoint path used when login returns mfa_required=true.",
    )
    parser.add_argument(
        "--mfa-code",
        default=os.getenv("JWT_AUDIT_MFA_CODE"),
        help="MFA code (or set JWT_AUDIT_MFA_CODE env var).",
    )
    parser.add_argument(
        "--check",
        action="append",
        choices=["all", *CHECKS.keys()],
        default=["all"],
        help="Choose one or more checks. Repeat for multiple checks.",
    )
    parser.add_argument(
        "--wordlist",
        help="Optional wordlist for weak-secret check (one candidate per line).",
    )
    parser.add_argument(
        "--max-access-ttl-seconds",
        type=int,
        default=3600,
        help="Fail claim-hardening check when exp-iat exceeds this threshold.",
    )
    parser.add_argument("--timeout", type=float, default=8.0, help="HTTP timeout in seconds.")
    parser.add_argument("--output", help="Optional path to write JSON report.")
    return parser.parse_args()


def resolve_selected_checks(requested: list[str]) -> list[str]:
    if "all" in requested:
        return list(CHECKS.keys())
    seen: set[str] = set()
    ordered: list[str] = []
    for item in requested:
        if item in CHECKS and item not in seen:
            ordered.append(item)
            seen.add(item)
    return ordered


def render_console_report(findings: list[Finding], token_meta: dict[str, Any]) -> None:
    print("=" * 78)
    print("JWT Security Audit Report")
    print("=" * 78)
    print(f"Token acquisition: {json.dumps(token_meta, separators=(',', ':'))}")
    print("-")

    sorted_findings = sorted(
        findings,
        key=lambda f: (SEVERITY_ORDER.get(f.severity, 0), f.status == "FAIL"),
        reverse=True,
    )

    for finding in sorted_findings:
        print(f"[{finding.status}] {finding.check_id} ({finding.severity})")
        print(f"  {finding.title}")
        print(f"  Details: {finding.details}")
        print(f"  Recommendation: {finding.recommendation}")
        if finding.evidence:
            ev = json.dumps(finding.evidence, ensure_ascii=True)
            print(f"  Evidence: {ev[:320]}{'...' if len(ev) > 320 else ''}")
        print("-")

    counts = {"PASS": 0, "FAIL": 0, "WARN": 0, "SKIP": 0, "INFO": 0, "ERROR": 0}
    for finding in findings:
        counts[finding.status] = counts.get(finding.status, 0) + 1

    print("Summary:")
    print(json.dumps(counts, indent=2))


def main() -> int:
    args = parse_args()
    selected_checks = resolve_selected_checks(args.check)

    project_root = Path(__file__).resolve().parent
    token = args.token
    refresh_token = None
    token_meta = {"mode": "direct-token" if token else "none"}

    if not token:
        token, refresh_token, token_meta = acquire_token(
            base_url=args.base_url,
            timeout_seconds=args.timeout,
            username=args.username,
            password=args.password,
            login_path=args.login_path,
            mfa_verify_path=args.mfa_verify_path,
            mfa_code=args.mfa_code,
        )

    ctx = AuditContext(
        base_url=args.base_url,
        token=token,
        refresh_token=refresh_token,
        endpoint=args.endpoint,
        endpoint_method=args.endpoint_method,
        timeout_seconds=args.timeout,
        project_root=project_root,
    )

    findings: list[Finding] = []
    for check_name in selected_checks:
        _, fn = CHECKS[check_name]
        try:
            if check_name == "weak-secret":
                finding = fn(ctx, args.wordlist)
            elif check_name == "claim-hardening":
                finding = fn(ctx, args.max_access_ttl_seconds)
            else:
                finding = fn(ctx)
        except Exception as exc:
            finding = Finding(
                check_name,
                check_name.replace("-", " ").title(),
                "ERROR",
                "medium",
                f"Check execution failed: {exc}",
                "Review tool configuration and endpoint availability.",
                {},
            )
        findings.append(finding)

    render_console_report(findings, token_meta)

    report = {
        "timestamp_epoch": int(time.time()),
        "base_url": args.base_url,
        "selected_checks": selected_checks,
        "token_acquisition": token_meta,
        "findings": [asdict(item) for item in findings],
    }

    if args.output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"JSON report written to: {out_path}")

    has_fail_or_error = any(f.status in {"FAIL", "ERROR"} for f in findings)
    return 1 if has_fail_or_error else 0


if __name__ == "__main__":
    sys.exit(main())
