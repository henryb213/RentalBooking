import PlotForm from "@/components/plots/garden-creator/PlotCreator";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  // redirect to edit page when user unverified
  const session = await auth();
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  return (
    <main>
      <div className="grid-rows-20 grid grid-cols-10 gap-4">
        <div className="col-span-6 col-start-3 row-span-6 row-start-4">
          <PlotForm />
        </div>
      </div>
    </main>
  );
}
