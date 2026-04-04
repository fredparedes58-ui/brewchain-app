'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useChatStore } from '@/lib/stores/chatStore';
import { MENSAJES_ENTRANTES_POOL } from '@/lib/mock/conversaciones';
import { Mensaje } from '@/lib/types/chat';

const ROL_ICON: Record<string, string> = { M02: '🚢', M03: '🔥', M01: '🌱' };

function formatHora(iso: string) {
  const d = new Date(iso);
  const hoy = new Date();
  const esHoy = d.toDateString() === hoy.toDateString();
  if (esHoy) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function MensajesPage() {
  const { conversaciones, conversacionActivaId, setConversacionActiva, enviarMensaje, addMensajeEntrante } = useChatStore();
  const [textoInput, setTextoInput] = useState('');
  const [poolIndex, setPoolIndex] = useState(0);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const convActiva = conversaciones.find(c => c.id === conversacionActivaId) ?? conversaciones[0];

  // Abrir la primera conversación por defecto
  useEffect(() => {
    if (!conversacionActivaId && conversaciones.length > 0) {
      setConversacionActiva(conversaciones[0].id);
    }
  }, [conversacionActivaId, conversaciones, setConversacionActiva]);

  // Scroll al último mensaje cuando cambia la conversación activa
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convActiva?.mensajes.length]);

  // Polling simulado: llega un mensaje nuevo cada ~55 segundos
  useEffect(() => {
    const id = setInterval(() => {
      const entrada = MENSAJES_ENTRANTES_POOL[poolIndex % MENSAJES_ENTRANTES_POOL.length];
      const mensaje: Mensaje = {
        id: `msg-auto-${Date.now()}`,
        autor: 'contraparte',
        texto: entrada.texto,
        timestamp: new Date().toISOString(),
        leido: false,
      };
      addMensajeEntrante(entrada.conversacionId, mensaje);
      setPoolIndex(i => i + 1);
    }, 55_000);
    return () => clearInterval(id);
  }, [poolIndex, addMensajeEntrante]);

  const handleEnviar = () => {
    if (!textoInput.trim() || !convActiva) return;
    enviarMensaje(convActiva.id, textoInput.trim());
    setTextoInput('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#1A0D05', overflow: 'hidden' }}>
      {/* Lista de conversaciones */}
      <div style={{ width: 260, borderRight: '1px solid rgba(196,154,108,0.12)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Header lista */}
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(196,154,108,0.12)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link href="/m01" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.1rem', flexShrink: 0 }}>←</Link>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FBF6EE' }}>Mensajes</div>
            <div style={{ fontSize: '0.65rem', color: '#8B5E3C' }}>{conversaciones.length} conversaciones</div>
          </div>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversaciones.map(conv => {
            const ultimo = conv.mensajes[conv.mensajes.length - 1];
            const isActiva = conv.id === convActiva?.id;
            return (
              <button
                key={conv.id}
                onClick={() => setConversacionActiva(conv.id)}
                style={{ width: '100%', background: isActiva ? 'rgba(139,94,60,0.2)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(196,154,108,0.08)', padding: '0.9rem 1rem', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
              >
                {/* Avatar */}
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: isActiva ? 'rgba(139,94,60,0.4)' : 'rgba(59,31,8,0.8)', border: `1px solid rgba(196,154,108,${isActiva ? '0.4' : '0.15'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                  {ROL_ICON[conv.contraparte.rol] ?? '👤'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: conv.no_leidos > 0 ? 800 : 600, fontSize: '0.85rem', color: '#FBF6EE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>{conv.contraparte.nombre}</span>
                    {conv.no_leidos > 0 && (
                      <span style={{ background: '#8B5E3C', color: '#FBF6EE', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{conv.no_leidos}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#8B5E3C', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.contraparte.empresa}</div>
                  {ultimo && (
                    <div style={{ fontSize: '0.72rem', color: conv.no_leidos > 0 ? '#C49A6C' : '#8B5E3C', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ultimo.autor === 'yo' ? 'Tú: ' : ''}{ultimo.texto}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel de conversación */}
      {convActiva ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header conversación */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(196,154,108,0.12)', background: 'rgba(26,13,5,0.95)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,31,8,0.8)', border: '1px solid rgba(196,154,108,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              {ROL_ICON[convActiva.contraparte.rol] ?? '👤'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FBF6EE' }}>{convActiva.contraparte.nombre}</div>
              <div style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>{convActiva.contraparte.empresa} · {convActiva.contraparte.pais}</div>
            </div>
            {convActiva.lote_variedad && (
              <div style={{ marginLeft: 'auto', background: 'rgba(139,94,60,0.15)', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.72rem', color: '#C49A6C' }}>
                📦 {convActiva.lote_variedad}
              </div>
            )}
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {convActiva.mensajes.map(msg => {
              const esMio = msg.autor === 'yo';
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: esMio ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '75%', background: esMio ? '#8B5E3C' : 'rgba(59,31,8,0.8)', border: esMio ? 'none' : '1px solid rgba(196,154,108,0.15)', borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '0.7rem 0.9rem' }}>
                    <div style={{ fontSize: '0.88rem', color: '#FBF6EE', lineHeight: 1.55 }}>{msg.texto}</div>
                    <div style={{ fontSize: '0.65rem', color: esMio ? 'rgba(251,246,238,0.6)' : '#8B5E3C', marginTop: '0.3rem', textAlign: esMio ? 'right' : 'left' }}>
                      {formatHora(msg.timestamp)}
                      {esMio && <span style={{ marginLeft: '0.3rem' }}>{msg.leido ? '✓✓' : '✓'}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={mensajesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid rgba(196,154,108,0.12)', background: 'rgba(26,13,5,0.95)', display: 'flex', gap: '0.65rem', alignItems: 'flex-end' }}>
            <textarea
              value={textoInput}
              onChange={e => setTextoInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
              placeholder="Escribe un mensaje..."
              rows={2}
              style={{ flex: 1, background: 'rgba(59,31,8,0.7)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 12, padding: '0.65rem 0.9rem', color: '#FBF6EE', fontSize: '0.88rem', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
            <button
              onClick={handleEnviar}
              disabled={!textoInput.trim()}
              style={{ background: textoInput.trim() ? '#8B5E3C' : 'rgba(59,31,8,0.6)', border: 'none', borderRadius: 12, padding: '0.75rem 1rem', color: '#FBF6EE', cursor: textoInput.trim() ? 'pointer' : 'default', fontSize: '1.1rem', flexShrink: 0, transition: 'background 0.15s' }}
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5E3C' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <div>Selecciona una conversación</div>
          </div>
        </div>
      )}
    </div>
  );
}
