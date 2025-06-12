import { XCircleIcon } from "@heroicons/react/20/solid";

export default function ErrorMessage({
  error,
  setError,
}: {
  error: string | null;
  setError: (error: string | null) => void;
}) {
  return (
    error && (
      <div className="w-full rounded-md bg-red-50 p-4">
        <div className="flex">
          <div
            className="shrink-0 cursor-pointer"
            onClick={() => setError(null)}
          >
            <XCircleIcon aria-hidden="true" className="size-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              An error occurred:
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
