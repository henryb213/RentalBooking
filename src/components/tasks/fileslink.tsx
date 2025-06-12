import Button from "@/components/ui/button";

export default function FilesLink() {
  return (
    <div className="mb-6 border-2 border-solid border-primary/60 bg-background shadow sm:rounded-xl">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold text-accent-foreground">
          Your Files
        </h3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-secondary-foreground">
            <p>
              Organise and access your task boards efficiently with ease using
              our file system, where you can view and modify any of your boards.
            </p>
          </div>
          <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
            <Button
              href="/tasks/files"
              className="px-3.5 py-2.5 text-sm font-bold"
              variant="primary"
            >
              Go To Files
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
