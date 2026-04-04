import { MOCK_LOTES } from '@/lib/mock/lotes';
import { notFound } from 'next/navigation';
import EUDRLoteClient from './EUDRLoteClient';

export async function generateStaticParams() {
  return MOCK_LOTES.map(l => ({ loteId: l.id }));
}

export default async function EUDRLotePage({ params }: { params: Promise<{ loteId: string }> }) {
  const { loteId } = await params;
  const lote = MOCK_LOTES.find(l => l.id === loteId);
  if (!lote) notFound();
  return <EUDRLoteClient lote={lote} />;
}
