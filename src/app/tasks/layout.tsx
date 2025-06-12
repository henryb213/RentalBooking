export const dynamic = "force-dynamic";

import { TaskProvider } from "@/providers/task";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <TaskProvider>{children}</TaskProvider>;
}
