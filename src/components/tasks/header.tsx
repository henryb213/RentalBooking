import CreateTaskWindow from "./createtask";

export default function TaskHeader() {
  return (
    <div className="bg-background">
      <div className="px-6 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="border-b-solid border-radius-4 mx-auto max-w-2xl border-b-2 border-primary/60 pb-8 text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-accent-foreground sm:text-5xl">
            Your Task Manager
          </h2>
          <p className="text-p mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-secondary-foreground/80">
            Welcome to your Garden Task Manager! Stay organized with tools to
            plan, prioritise, and track every garden task, ensuring your outdoor
            space thrives year-round.
          </p>
          <div className="mt-12">
            <CreateTaskWindow buttonText="Get Started" />
          </div>
        </div>
      </div>
    </div>
  );
}
