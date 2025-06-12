import ThemeSelector from "./ThemeSelector";

export default function SettingsDisplay() {
  return (
    <main className="px-20 py-14">
      <h2 className="text-3xl font-bold">Settings</h2>
      <div className="mx-auto max-w-2xl space-y-16 px-1 py-6 sm:space-y-20 lg:mx-0 lg:max-w-none">
        <div>
          <h2 className="text-base/7 font-semibold">Appearance</h2>
          <p className="mt-1 text-sm/6">
            Choose the appearance of the application
          </p>

          <div className="w-full max-w-xs">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </main>
  );
}
