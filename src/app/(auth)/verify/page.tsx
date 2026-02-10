"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const error = searchParams?.get("error");

  useEffect(() => {
    if (error) {
      setStatus("error");
    } else {
      // The NextAuth magic link will handle redirection automatically
      // This page is shown while verification is in progress
      const timer = setTimeout(() => {
        setStatus("success");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">DailyBrief</h1>
        </div>

        {status === "loading" && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Verifying your email...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your magic link.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              Email verified!
            </h2>
            <p className="text-green-700 mb-4">
              You will be redirected to your dashboard shortly...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Verification failed
            </h2>
            <p className="text-red-700 mb-4">
              {error === "Verification"
                ? "This verification link is invalid or has expired."
                : "An error occurred during verification."}
            </p>
            <a
              href="/sign-in"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">DailyBrief</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
