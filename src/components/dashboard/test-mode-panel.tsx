"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TestResult {
  id: string;
  subject: string;
  status: string;
  itemCount?: number;
}

export function TestModePanel() {
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/briefs/generate", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate brief");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAndSend() {
    setSendLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/briefs/test-send", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate and send brief");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSendLoading(false);
    }
  }

  return (
    <div className="border-2 border-dashed border-amber-400 bg-amber-50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex items-center rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800 uppercase tracking-wide">
          Test Mode
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Generate a Brief Now
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Don&apos;t wait for the daily schedule &mdash; trigger a brief instantly
        to preview what your email will look like.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleGenerate}
          disabled={loading || sendLoading}
        >
          {loading ? "Generating..." : "Generate Brief Only"}
        </Button>
        <Button
          onClick={handleGenerateAndSend}
          disabled={loading || sendLoading}
        >
          {sendLoading ? "Generating & Sending..." : "Generate & Send Email"}
        </Button>
      </div>

      {result && (
        <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">
            {result.status === "SENT" ? "Brief sent!" : "Brief generated!"}
          </p>
          <p className="text-sm text-green-700 mt-1">
            <strong>Subject:</strong> {result.subject}
          </p>
          {result.itemCount !== undefined && (
            <p className="text-sm text-green-700">
              <strong>Articles:</strong> {result.itemCount}
            </p>
          )}
          <a
            href={`/dashboard/briefs/${result.id}`}
            className="text-sm text-green-800 underline mt-2 inline-block"
          >
            View brief &rarr;
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}
