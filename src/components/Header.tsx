import React from 'react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 border-b border-[#222748] bg-[#0b0e1a]/95 backdrop-blur-md">
            <div className="max-w-[800px] mx-auto p-4">
                <div className="hero bg-gradient-to-r from-[rgba(94,155,255,0.15)] to-transparent rounded-[18px] border border-[#242a57] p-4 mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(1200px_280px_at_10%_-10%,rgba(94,155,255,0.15),transparent)] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(900px_260px_at_90%_-20%,rgba(125,95,255,0.15),transparent)] pointer-events-none"></div>
                    <h1 className="text-xl font-bold tracking-wide m-0 relative z-10">
                        LEVL DeepCell Tracker <span className="text-xs px-2 py-1 rounded-lg border border-[#2b3266] bg-[#0e1228] ml-2 font-normal">v4.3</span>
                    </h1>
                    <div className="text-xs text-[var(--muted)] mt-1 relative z-10">
                        Optimized for LIFESPAN+ DeepCell. Focused on sleep depth and recovery.
                    </div>
                </div>
            </div>
        </header>
    );
}
