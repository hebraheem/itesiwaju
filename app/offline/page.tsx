"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-3xl font-bold">You're Offline</h1>
        <p className="text-muted-foreground max-w-md">
          It looks like you've lost your internet connection. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
