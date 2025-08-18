
"use client";

import { PageHeader } from '@/components/layout/PageHeader';
import TransportManager from '@/components/transport/TransportManager';
import { Bus } from 'lucide-react';

export default function AdminTransportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transport Management"
        icon={Bus}
        description="Manage school transport, bus routes, and student assignments."
      />
      <TransportManager />
    </div>
  );
}
