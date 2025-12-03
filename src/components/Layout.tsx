import React, { useState, useEffect } from 'react';
import Header from './Header';
import Nav from './Nav';
import Auth from './Auth';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

interface LayoutProps {
    children: (activeTab: string) => React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [activeTab, setActiveTab] = useState('setup');
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0b0e1a] text-[var(--muted)]">Loading...</div>;
    }

    if (!session) {
        return <Auth />;
    }

    return (
        <div className="min-h-screen pb-10">
            <Header />
            <div className="max-w-[800px] mx-auto px-4">
                <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="py-5">
                    {children(activeTab)}
                </main>
            </div>
        </div>
    );
}
