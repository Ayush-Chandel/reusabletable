import Link from "next/link";

export default function Home() {
  return (
    <div className=" flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Reusable Server Data Table
        </h1>
        <p className="text-lg text-muted-foreground">
          A generic, URL-driven server data table component with server-side
          pagination, sorting, filtering, and TanStack Query integration.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/users"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            View Users Demo
          </Link>
        </div>

        <div className="pt-8 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">URL-Driven State</h3>
            <p className="text-sm text-muted-foreground">
              All table state (page, limit, search, sort, filters) is
              persisted in URL query parameters.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Server-Side Operations</h3>
            <p className="text-sm text-muted-foreground">
              Pagination, sorting, and filtering are all handled server-side
              for optimal performance.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">TanStack Query</h3>
            <p className="text-sm text-muted-foreground">
              Smart caching, background refetching, and loading states out of
              the box.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Customizable Filters</h3>
            <p className="text-sm text-muted-foreground">
              Pass custom filter components via props without modifying the
              table component.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

