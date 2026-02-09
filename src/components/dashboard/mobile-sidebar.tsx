'use client'

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-primary hover:text-primary/80 hover:bg-primary/10">
                    <Menu className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-background border-r w-72">
                <SheetTitle className="sr-only">Menu de Navegación</SheetTitle>
                <div className="h-full px-0">
                    <DashboardSidebar className="w-full border-none static flex h-full" />
                </div>
            </SheetContent>
        </Sheet>
    );
}
