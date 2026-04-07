import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'Café + Tostado · M04 · BREW CHAIN',
};

export default function M04Layout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
