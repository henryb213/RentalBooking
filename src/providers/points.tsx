"use client";

import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface PointsContextType {
  points: number | undefined;
  setPoints: (points: number) => void;
  poll: () => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints] = useState<number | undefined>(undefined);

  const { data: session, status } = useSession();

  const { refetch } = api.user.getById.useQuery(
    { id: session?.user?.id ?? "" },
    { enabled: false },
  );

  const poll = async () => {
    if (status !== "authenticated") return;

    const { data } = await refetch();
    if (!data) return;

    setPoints(data.points);
  };

  useEffect(() => {
    poll();
  }, [status]);

  return (
    <PointsContext.Provider value={{ points, setPoints, poll }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error("usePoints must be used within a PointsProvider");
  }
  return context;
};
