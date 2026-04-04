'use client';
import { useAuthStore } from '@/lib/stores/authStore';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isAuthenticated && <Sidebar />}
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#1A0D05', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
