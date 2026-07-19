import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { TRPCProvider } from "@/lib/trpc";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <div className="px-6 pt-4 pb-1">
            <Breadcrumb />
          </div>
          <main className="flex-1 overflow-y-auto px-6 pb-6">{children}</main>
        </div>
      </div>
    </TRPCProvider>
  );
}
