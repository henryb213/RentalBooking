import Landing from "@/components/tools/landing";
import { ToolService } from "@/server/services/tool.service";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
//import ProductCard from "@/components/tools/tool-card";

export default async function Home() {
  // redirect to edit page when user unverified
  const session = await auth();
  const userId = session?.user?.id;
  const isVerified = session?.user?.verified;
  if (userId && isVerified === false) {
    console.log("Redirecting to profile edit");
    redirect(`/profile/${userId}/edit`);
  }

  const tools = await ToolService.getAllTools();
  return (
    <div>
      <Landing toolList={tools}></Landing>
    </div>
  );
}
