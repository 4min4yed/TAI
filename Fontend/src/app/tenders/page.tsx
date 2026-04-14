"use client";

import { FormEvent, useMemo, useState } from "react";
import { ExternalLink, FileText, Loader2, Search } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { readAccessToken, readUserProfile } from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base";

type ScrapedTenderPdf = {
  id: string;
  title: string;
  snippet: string;
  source_url: string;
  pdf_url: string;
  domain: string;
  published_hint?: string | null;
};

type ScrapeResponse = {
  query: string;
  generated_google_query: string;
  from_date: string;
  to_date: string;
  total_results: number;
  results: ScrapedTenderPdf[];
};

const SCRAPE_ENABLED_ROLES = new Set(["owner", "admin", "manager", "analyst", "user"]);
const CAN_ADD_ROLES = new Set(["owner", "admin", "manager"]);

export default function TendersPipelinePage() {
  const [query, setQuery] = useState("informatique tunisie");
  const [monthsBack, setMonthsBack] = useState(3);
  const [maxResults, setMaxResults] = useState(20);
  const [language, setLanguage] = useState("fr");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<ScrapeResponse | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const profile = useMemo(() => readUserProfile(), []);
  const role = (profile?.role || "viewer").toLowerCase();
  const canStartScraping = SCRAPE_ENABLED_ROLES.has(role);
  const canAddToPipeline = CAN_ADD_ROLES.has(role);

  const handleScrape = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canStartScraping) {
      setError("Your role cannot start scraping.");
      return;
    }

    const token = readAccessToken();
    if (!token) {
      setError("Missing authentication token.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const apiBase = getApiBaseUrl();
      const payload = {
        query,
        months_back: monthsBack,
        max_results: maxResults,
        language,
      };

      const scrapeResponse = await fetch(`${apiBase}/v1/tenders/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!scrapeResponse.ok) {
        const errorPayload = await scrapeResponse.json().catch(() => ({}));
        throw new Error(errorPayload.detail || "Failed to scrape tender PDFs.");
      }

      const data = (await scrapeResponse.json()) as ScrapeResponse;
      setResponse(data);
      setSavedIds([]);
    } catch (scrapeError) {
      setResponse(null);
      setError(scrapeError instanceof Error ? scrapeError.message : "Unknown scraping error.");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsSaved = (id: string) => {
    if (!savedIds.includes(id)) {
      setSavedIds((prev) => [...prev, id]);
    }
  };

  return (
    <AppLayout title="Appels d'offres">
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scraping des appels d'offres</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Enter a keyword and timeframe, then launch scraping with Google advanced operators to discover tender PDFs on gov.tn domains.
              </p>
            </div>

            <form onSubmit={handleScrape} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="md:col-span-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                placeholder="ex: construction routiere tunisie (scope: site:gov.tn)"
                required
                minLength={2}
              />
              <input
                type="number"
                value={monthsBack}
                onChange={(e) => setMonthsBack(Math.max(1, Math.min(36, Number(e.target.value) || 1)))}
                className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                min={1}
                max={36}
                title="Months back"
              />
              <button
                type="submit"
                disabled={isLoading || !canStartScraping}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-400 text-white px-4 py-2 text-sm font-semibold"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isLoading ? "Scraping..." : "Start scraping"}
              </button>

              <div className="md:col-span-2 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span>Results</span>
                <input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(Math.max(1, Math.min(50, Number(e.target.value) || 20)))}
                  className="w-20 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1"
                  min={1}
                  max={50}
                />
                <span>Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1"
                >
                  <option value="fr">FR</option>
                  <option value="en">EN</option>
                </select>
              </div>
              <div className="md:col-span-2 text-xs text-slate-500 dark:text-slate-400 self-center">
                Role: <strong>{role}</strong> {canAddToPipeline ? "- can add PDFs to pipeline" : "- read-only actions"}
              </div>
            </form>

            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">PDF results</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">{response?.total_results || 0} found</span>
            </div>

            {response?.generated_google_query && (
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                Query used: {response.generated_google_query}
              </p>
            )}

            {!response || response.results.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No PDFs yet. Start scraping to populate this list.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.results.map((pdf) => {
                  const saved = savedIds.includes(pdf.id);
                  return (
                    <article
                      key={pdf.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{pdf.title}</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{pdf.snippet || "No snippet available."}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            {pdf.domain}
                            {pdf.published_hint ? ` - ${pdf.published_hint}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={pdf.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open PDF
                        </a>

                        {canAddToPipeline ? (
                          <button
                            type="button"
                            onClick={() => markAsSaved(pdf.id)}
                            disabled={saved}
                            className="rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-3 py-1.5 text-xs font-semibold"
                          >
                            {saved ? "Added to pipeline" : "Add to pipeline"}
                          </button>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold">
                            View only
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
