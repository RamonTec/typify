import React from "react";
import { cn } from "../../utils/cn";

interface MainLayoutProps {
    header: React.ReactNode;
    nav: React.ReactNode;
    children: React.ReactNode;
    adSlot?: React.ReactNode;
    className?: string;
}

export const MainLayout = ({
    header,
    nav,
    children,
    adSlot,
    className,
}: MainLayoutProps) => {
    return (
        <div className={cn("flex min-h-screen flex-col", className)}>
            <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm">
                {header}
            </header>
            <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-4 md:flex-row md:p-6 lg:p-8">
                <aside className="md:w-60 md:shrink-0">
                    <div className="md:sticky md:top-24">{nav}</div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">{children}</div>

                {adSlot && (
                    <aside className="hidden w-[300px] xl:block">
                        <div className="sticky top-24 rounded-2xl border border-white/20 bg-white/60 p-4 shadow-xl backdrop-blur-md">
                            {adSlot}
                        </div>
                    </aside>
                )}
            </main>

            {adSlot && (
                <div className="block border-t border-white/10 bg-white/80 p-4 backdrop-blur-lg xl:hidden">
                    <div className="mx-auto max-w-full px-4">
                        {adSlot}
                    </div>
                </div>
            )}
        </div>
    );
};
