import { redirect } from "next/navigation";
import { auth } from "@/auth";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return children;
}
