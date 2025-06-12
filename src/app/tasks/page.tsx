"use client";

import TaskHeader from "@/components/tasks/header";
import RecentCard from "@/components/tasks/recentTasks";
import FilesLink from "@/components/tasks/fileslink";
import TaskStatSection from "@/components/tasks/stats";
import { useTaskContext } from "@/providers/task";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const TaskHome = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // redirect to edit page when user unverified
  useEffect(() => {
    if (status === "authenticated") {
      const userId = session?.user?.id;
      const isVerified = session?.user?.verified;

      if (userId && isVerified === false) {
        router.push(`/profile/${userId}/edit`);
      }
    }
  }, [session, status, router]);

  const { setPath } = useTaskContext();
  useEffect(() => {
    // React Documentation states state functions are stable and should not be included as dependencies
    setPath("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <main className="p-8">
      <TaskHeader />
      <RecentCard />
      <div className="flex justify-center">
        <FilesLink />
      </div>
      <TaskStatSection />
    </main>
  );
};

export default TaskHome;
