"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
          <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
              {error.message || "A critical error occurred."}
            </p>
            <button
              onClick={reset}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#232935", color: "#fff", cursor: "pointer", fontSize: 14 }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
