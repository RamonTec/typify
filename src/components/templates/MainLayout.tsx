import React from "react";
import { cn } from "../../utils/cn";

interface MainLayoutProps {
    header: React.ReactNode;
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    adSlot?: React.ReactNode;
    className?: string;
}

export const MainLayout = ({
    header,
    leftPanel,
    rightPanel,
    adSlot,
    className,
}: MainLayoutProps) => {
    return (
        <div className={cn("flex min-h-screen flex-col", className)}>
            <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm">
                {header}
            </header>
            <main className="container mx-auto flex flex-1 flex-col gap-6 p-4 md:flex-row md:p-6 lg:p-8">
                <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/60 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl">
                    <div className="flex h-full flex-col">
                        {leftPanel}
                    </div>
                </section>

                <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/60 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl">
                    <div className="flex h-full flex-col">
                        {rightPanel}
                    </div>
                </section>

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
                    <div className="mx-auto max-w-[320px]">
                        {adSlot}
                    </div>
                </div>
            )}
        </div>
    );
};