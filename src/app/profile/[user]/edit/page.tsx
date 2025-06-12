import { auth } from "@/auth";
import ProfileEditForm from "@/components/profile/profileEditor";
import { redirect } from "next/navigation";
import { UserService } from "@/server/services/user.service";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    user: string;
  };
}

export default async function Home({ params }: PageProps) {
  const session = await auth();
  if (!session?.user.id) {
    redirect("/login");
  }

  const user = await UserService.getUserById(params.user);

  // check that user trying to edit profile is actually the one the profile belongs to
  if (!user || session?.user.id !== params.user) {
    notFound();
  }

  return <ProfileEditForm id={params.user} />;
}
