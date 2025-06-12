import { AuthProvider } from "@/providers/auth";
// import { ThemeProvider } from "@/providers/theme";
import { ThemeProvider } from "next-themes";
import { TRPCReactProvider } from "@/trpc/react";
import { PointsProvider } from "./points";
import { NotificationProvider } from "./notification";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TRPCReactProvider>
      <AuthProvider>
        <ThemeProvider>
          <PointsProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </PointsProvider>
        </ThemeProvider>
      </AuthProvider>
    </TRPCReactProvider>
  );
}
