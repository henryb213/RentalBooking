export const dynamic = "force-dynamic";

import {
  RootSidebar,
  SidebarProvider,
  SidebarWrapper,
} from "@/components/marketplace/sidebar";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="z-2 flex">
        <SidebarWrapper>
          <RootSidebar />
        </SidebarWrapper>
        <div className="flex-1 p-4">{children}</div>
      </div>
    </SidebarProvider>
  );
}
