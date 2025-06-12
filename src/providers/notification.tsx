"use client";

import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface NotificationContextType {
  count: number | undefined;
  setCount: (count: number) => void;
  poll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [count, setCount] = useState<number | undefined>(undefined);
  const { data: session, status } = useSession();

  const { refetch } = api.user.getNotificationCount.useQuery(
    { id: session?.user?.id ?? "" },
    { enabled: false },
  );

  const poll = async () => {
    if (status !== "authenticated") return;

    const { data } = await refetch();
    if (!data) return;

    setCount(data.notificationCount);
  };

  useEffect(() => {
    poll();
  }, [status]);

  return (
    <NotificationContext.Provider value={{ count, setCount, poll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
