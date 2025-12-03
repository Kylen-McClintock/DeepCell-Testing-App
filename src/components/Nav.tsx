import React from 'react';
import clsx from 'clsx';

interface NavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Nav({ activeTab, setActiveTab }: NavProps) {
    const tabs = [
        { id: 'setup', label: '1) Setup' },
        { id: 'daily', label: '2) Daily Check-in' },
        { id: 'dashboard', label: '3) Dashboard' },
        { id: 'export', label: '4) Export' },
    ];

    return (
        <nav className="flex gap-2 flex-wrap mt-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                        "px-3 py-2 rounded-xl border border-[#2b3266] text-[var(--text)] cursor-pointer transition-all text-sm font-medium",
                        activeTab === tab.id
                            ? "bg-gradient-to-r from-[var(--accent2)] to-[var(--accent)] text-white border-transparent font-bold"
                            : "bg-[var(--btn-bg)] hover:bg-[#222955]"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
}
