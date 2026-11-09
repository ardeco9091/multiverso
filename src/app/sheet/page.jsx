'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import WorldTicket from '../../components/WorldTicket';

function isSavedTicket(ticket) {
  return Boolean(ticket && typeof ticket.name === 'string' && ticket.name && typeof ticket.world === 'string' && ticket.world && Array.isArray(ticket.relics));
}

export default function PrintSheetPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState(null);
  const [position, setPosition] = useState('top');
  const printed = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('multiversePrintJob');
      const parsed = raw ? JSON.parse(raw) : null;
      const list = Array.isArray(parsed) ? parsed : parsed?.tickets;
      const placement = Array.isArray(parsed) ? 'top' : parsed?.position === 'bottom' ? 'bottom' : 'top';
      if (!Array.isArray(list) || list.length < 1 || list.length > 2 || list.some((ticket) => !isSavedTicket(ticket)) || (placement === 'bottom' && list.length !== 1)) { router.replace('/result'); return; }
      setTickets(list);
      setPosition(placement);
    } catch { router.replace('/result'); }
  }, [router]);

  useEffect(() => {
    if (!tickets || printed.current) return;
    printed.current = true;
    const afterPrint = () => {
      const available = Number(sessionStorage.getItem('multiverseFreeHalves') || '0');
      if (tickets.length === 1 && position === 'top') sessionStorage.setItem('multiverseFreeHalves', String(Math.max(0, Math.floor(available)) + 1));
      if (tickets.length === 1 && position === 'bottom') sessionStorage.setItem('multiverseFreeHalves', String(Math.max(0, Math.floor(available)) - 1));
      sessionStorage.removeItem('multiversePrintJob');
      sessionStorage.removeItem('multiversePrintQueue');
      router.replace('/result');
    };
    window.addEventListener('afterprint', afterPrint, { once: true });
    const timer = window.setTimeout(() => window.print(), 550);
    return () => { window.clearTimeout(timer); window.removeEventListener('afterprint', afterPrint); };
  }, [tickets, position, router]);

  if (!tickets) return <main className="result-loading print-loading">Armando la hoja…</main>;

  return <main className="print-sheet" aria-label={`${tickets.length} tarjeta${tickets.length === 1 ? '' : 's'} para imprimir`}>
    {tickets.length === 1 && position === 'bottom' && <div className="print-half-spacer" aria-hidden="true" />}
    {tickets.map((ticket, index) => <WorldTicket key={`${ticket.name}-${index}`} data={ticket} compact />)}
  </main>;
}
