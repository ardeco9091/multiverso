'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WorldTicket from '../../components/WorldTicket';
import { decodeWorldTicket } from '../../lib/world-ticket';

function isSavedTicket(ticket) {
  return Boolean(ticket && typeof ticket.name === 'string' && ticket.name && typeof ticket.world === 'string' && ticket.world && Array.isArray(ticket.relics));
}

export default function CardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(null);
  const [freeHalves, setFreeHalves] = useState(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('ticket');
      if (token) {
        const ticket = decodeWorldTicket(token);
        if (!ticket || !ticket.name || !ticket.world) { router.replace('/'); return; }
        setShared(true);
        setData(ticket);
        return;
      }

      const raw = sessionStorage.getItem('multiverseData');
      if (!raw) { router.replace('/'); return; }
      const saved = JSON.parse(raw);
      if (!isSavedTicket(saved)) { router.replace('/'); return; }
      setData(saved);
      const available = Number(sessionStorage.getItem('multiverseFreeHalves') || '0');
      setFreeHalves(Number.isFinite(available) ? Math.max(0, Math.floor(available)) : 0);
      if (params.get('prepare') === '1') {
        const queued = sessionStorage.getItem('multiversePrintQueue');
        if (queued) {
          const parsed = JSON.parse(queued);
          if (Array.isArray(parsed) && parsed.length && isSavedTicket(parsed[parsed.length - 1])) setPending(parsed[parsed.length - 1]);
        }
      }
    } catch { router.replace('/'); }
  }, [router]);

  function openPrintSheet(tickets, position = 'top') {
    sessionStorage.setItem('multiversePrintJob', JSON.stringify({ tickets, position }));
    router.push('/sheet');
  }

  function addAndContinue() {
    if (!data) return;
    sessionStorage.setItem('multiversePrintQueue', JSON.stringify([data]));
    sessionStorage.removeItem('multiverseData');
    router.push('/');
  }

  function restart() {
    sessionStorage.removeItem('multiverseData');
    router.push('/');
  }

  if (!data) return <main className="result-loading lab-page"><span className="loading-orbit">▥</span><p>Preparando la ficha…</p></main>;

  if (shared) return <main className="shared-ticket-page lab-page"><div className="shared-ticket-heading"><span className="eyebrow"><span className="eyebrow-line" /> FICHA DIGITAL · LABORATORIO DE DATOS</span><p>Guardá esta pantalla como captura para llevarte tu análisis.</p></div><WorldTicket data={data} /><a className="button button-quiet" href="/">Probar el laboratorio ↗</a></main>;

  return <main className="card-page lab-page">
    <section className="card-page-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> PREPARAR IMPRESIÓN</span><h1>Dos fichas por hoja</h1><p>Cada ficha ocupa media hoja A4. Podés combinar dos análisis o completar la mitad libre.</p></div><button className="button button-quiet" onClick={() => router.push('/result')}>Volver al resultado</button></section>
    {pending && <div className="print-hint">Hoja completa: <strong>{pending.name}</strong> + <strong>{data.name}</strong>. Al imprimir, salen en mitades separadas de una hoja.</div>}
    {!pending && freeHalves > 0 && <div className="print-hint">Tenés {freeHalves === 1 ? 'una hoja con la mitad inferior libre' : `${freeHalves} hojas con una mitad libre`}. Reinsertá una de esas hojas y elegí <strong>Completar mitad libre</strong>; la próxima ficha saldrá abajo. Probá primero con una hoja común para verificar la orientación.</div>}
    <WorldTicket data={data} compact />
    <div className="card-page-actions">{pending ? <><button className="button button-primary" onClick={() => openPrintSheet([pending, data])}>Imprimir las dos fichas</button><button className="button button-outline" onClick={() => { sessionStorage.removeItem('multiversePrintQueue'); openPrintSheet([data]); }}>Imprimir solo esta</button></> : <><button className="button button-primary" onClick={addAndContinue}>Guardar y sumar otro visitante</button>{freeHalves > 0 && <button className="button button-outline" onClick={() => openPrintSheet([data], 'bottom')}>Completar mitad libre</button>}<button className="button button-outline" onClick={() => openPrintSheet([data])}>{freeHalves > 0 ? 'Imprimir en hoja nueva' : 'Imprimir esta en media hoja'}</button></>}</div>
    {!pending && <p className="half-note">Si imprimís una ficha sola, queda registrada una mitad libre para el próximo visitante de esta sesión.</p>}
    <button className="text-button card-restart" onClick={restart}>Otro visitante ↺</button>
  </main>;
}
