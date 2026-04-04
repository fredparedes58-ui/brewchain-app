'use client';
import { useChatStore } from '@/lib/stores/chatStore';

export default function ChatBadge() {
  const mensajesNuevosTotal = useChatStore(s => s.mensajesNuevosTotal);
  if (mensajesNuevosTotal === 0) return null;
  return (
    <span style={{
      background: '#DC2626',
      color: '#fff',
      borderRadius: '50%',
      minWidth: 18,
      height: 18,
      fontSize: '0.65rem',
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 3px',
      marginLeft: 'auto',
      lineHeight: 1,
    }}>
      {mensajesNuevosTotal > 9 ? '9+' : mensajesNuevosTotal}
    </span>
  );
}
