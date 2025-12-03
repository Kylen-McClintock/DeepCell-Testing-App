"use client";

import React from 'react';
import Layout from '@/components/Layout';
import SetupForm from '@/components/setup/SetupForm';
import DailyCheckIn from '@/components/daily/DailyCheckIn';
import Dashboard from '@/components/dashboard/Dashboard';
import ExportPanel from '@/components/export/ExportPanel';
import { useStore } from '@/hooks/useStore';

export default function Home() {
  const { loading } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e1a] text-[var(--muted)]">
        Loading...
      </div>
    );
  }

  return (
    <Layout>
      {(activeTab) => (
        <>
          {activeTab === 'setup' && <SetupForm />}
          {activeTab === 'daily' && <DailyCheckIn />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'export' && <ExportPanel />}
        </>
      )}
    </Layout>
  );
}
