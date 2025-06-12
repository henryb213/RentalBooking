import Button from "@/components/ui/button";
import { useTaskContext } from "@/providers/task";
export default function Pagination() {
  const { page, setPage, taskBoards, isLoading, hasNextPage, folders } =
    useTaskContext();
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-secondary-foreground/40 bg-background px-4 py-3 sm:px-6"
    >
      <div className="hidden sm:block">
        <p className="text-sm text-secondary-foreground">
          Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{" "}
          <span className="font-medium">
            {(page - 1) * 10 + taskBoards.length + folders.length}
          </span>{" "}
          results
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <Button
          variant="secondary"
          size="md"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          loading={isLoading}
          className="mr-1 font-bold"
        >
          Previous
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={!hasNextPage}
          onClick={() => setPage(page + 1)}
          loading={isLoading}
          className="ml-1 font-bold"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
