import Button from "@/components/ui/button";

export default function Points({ points }: { points: number }) {
  return (
    <div className="mt-6 w-full border-t-2 border-secondary-foreground/40 bg-cardBackground">
      <div className="px-4 sm:p-6">
        <h3 className="text-base font-semibold text-secondary-foreground">
          Your Points
        </h3>
        <div className="mt-2 flex-col sm:flex sm:items-start sm:items-center sm:justify-between sm:text-center">
          <div className="max-w-xl p-2 text-sm text-secondary-foreground">
            <p>
              Points are used to trade on the platform. You can earn points by
              completing tasks and trading.
            </p>
            <p>
              You currently have{" "}
              <span className="font-bold text-primary">{points}</span> points.
            </p>
          </div>
          <div className="mt-5 gap-x-2 p-2 sm:mt-0 sm:flex sm:shrink-0 sm:items-center">
            <Button
              variant="primary"
              className="px-3.5 py-2.5 text-sm font-bold"
              href="/marketplace"
            >
              Start Trading
            </Button>
            <Button
              variant="primary"
              className="px-3.5 py-2.5 text-sm font-bold"
              href="/plots/management/my-plots"
            >
              Manage Gardens
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
