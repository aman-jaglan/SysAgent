import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Progress</h1>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm hover:bg-[var(--color-accent)] transition-colors"
          >
            New Interview
          </Link>
        </div>

        {/* Empty state */}
        <div className="border border-[var(--color-border)] rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-lg font-medium mb-2">No sessions yet</h2>
          <p className="text-[var(--color-muted-foreground)] mb-6">
            Start your first interview to track your progress across sessions.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)] transition-colors"
          >
            Start Practicing
          </Link>
        </div>

        {/* Placeholder for future progress charts */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] mb-2">
              Sessions Completed
            </h3>
            <div className="text-3xl font-bold">0</div>
          </div>
          <div className="border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] mb-2">
              Average Score
            </h3>
            <div className="text-3xl font-bold">—</div>
          </div>
        </div>
      </div>
    </div>
  );
}
