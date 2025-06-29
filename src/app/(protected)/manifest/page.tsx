
"use client";

import { useState } from "react";
import { Sparkles, Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Taskbar } from "../taskbar";
import HomeNav from "../homenav";
import ManifestSidebar from "./components/ManifestSidebar";

export default function ManifestPage() {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleHistorySelect = (historyPrompt: string, historyResponse: string) => {
    setPrompt(historyPrompt);
    setResult(historyResponse);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt) return;

    setIsSubmitting(true);
    setResult("");
    setError("");

    try {
      const response = await fetch("/api/manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Gracefully handle non-json errors
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data.text);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <HomeNav />

      <div className="flex min-h-[calc(100vh-10rem)] w-full flex-col items-center justify-center text-white p-4">
        {/* History Button - Fixed position */}
        <Button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 right-4 z-30 bg-yellow-400 hover:bg-yellow-500 text-gray-900"
          size="sm"
        >
          <History className="h-4 w-4 mr-2" />
          History
        </Button>

        <div className="w-full max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Manifest Your Idea
          </h1>              <p className="mt-4 text-lg text-gray-400">
            What&apos;s on your mind? Let&apos;s bring your vision to life.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 grid gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your idea, your dream, your vision..."
              className="w-full min-h-[180px] resize-y rounded-lg border border-gray-700 bg-gray-900 p-4 text-base text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className="inline-flex w-full items-center justify-center rounded-md bg-yellow-400 px-6 py-3 text-lg font-semibold text-gray-900 shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Manifesting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Manifest
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              <p className="font-semibold">Error</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-8 rounded-lg border border-gray-700 bg-gray-900 p-6 text-left">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-4">
                Gemini&apos;s Response
              </h2>
              <div className="prose prose-invert max-w-none text-gray-300 prose-a:text-blue-400 hover:prose-a:text-blue-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="text-sm text-gray-500">Or try a starter prompt:</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => handleSuggestionClick("Does an idea like this exist?")}
                className="rounded-full border border-gray-700 bg-gray-900 px-5 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                &ldquo;Does an idea like this exist?&rdquo;
              </button>
              <button
                type="button"
                onClick={() => handleSuggestionClick("I am working on an idea...")}
                className="rounded-full border border-gray-700 bg-gray-900 px-5 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                &ldquo;I am working on an idea...&rdquo;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manifest History Sidebar */}
      <ManifestSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectHistory={handleHistorySelect}
      />

      <Taskbar />
    </div>
  );
}
