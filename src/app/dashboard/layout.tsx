import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <DashboardSidebar />

            {/* Mobile Header */}
            <div className="sticky top-0 z-50 md:hidden flex items-center p-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <MobileSidebar />
                <span className="ml-4 font-bold text-lg text-primary">StyleSync</span>
            </div>

            <main className="md:pl-64 min-h-screen">
                <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
