"""Simple development server (single-process, hot-reload friendly)."""

if __name__ == "__main__":
    try:
        import uvicorn
    except ModuleNotFoundError as exc:
        raise SystemExit(
            "uvicorn is not installed in this Python environment. "
            "Use the project virtualenv: .venv\\Scripts\\python.exe -m pip install -r services/api-gateway/requirements.txt"
        ) from exc

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
