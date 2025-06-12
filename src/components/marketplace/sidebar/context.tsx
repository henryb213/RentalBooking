import { createContext, ReactNode, useContext, useState } from "react";
import type { SidebarProps } from "@/components/marketplace/sidebar/core";

type SidebarContextType = {
  activeSidebar: ReactNode;
  setActiveSidebar: (sidebar: ReactNode) => void;
  hideSidebar: boolean;
  setHideSidebar: (hide: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a Sidebar.Provider");
  }
  return context;
};

const SidebarProvider = ({ children }: SidebarProps) => {
  const [activeSidebar, setActiveSidebar] = useState<ReactNode | null>(null);
  const [hideSidebar, setHideSidebar] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ activeSidebar, setActiveSidebar, hideSidebar, setHideSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export { SidebarProvider, useSidebar };
