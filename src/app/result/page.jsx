'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import WorldTicket from '../../components/WorldTicket';
import { encodeWorldTicket } from '../../lib/world-ticket';

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('multiverseData');
      if (!saved) { router.replace('/'); return; }
      const parsed = JSON.parse(saved);
      if (!parsed.name || !parsed.world || !Array.isArray(parsed.relics)) { router.replace('/'); return; }
      setData(parsed);
      setSaveStatus(sessionStorage.getItem('decisionSaveStatus') || '');
    } catch { router.replace('/'); }
  }, [router]);

  function restart() { sessionStorage.removeItem('multiverseData'); sessionStorage.removeItem('decisionAnswers'); sessionStorage.removeItem('decisionSaveStatus'); router.push('/'); }
  function preparePrint() { router.push('/card?prepare=1'); }

  async function showPhoneCard() {
    if (!data) return;
    setShareOpen(true);
    setQrLoading(true);
    setQrError('');
    setQrData('');
    try {
      const ticket = encodeWorldTicket(data);
      const url = `${window.location.origin}/card?ticket=${encodeURIComponent(ticket)}`;
      const image = await QRCode.toDataURL(url, { errorCorrectionLevel: 'Q', margin: 2, width: 260, color: { dark: '#11162d', light: '#ffffff' } });
      setShareUrl(url);
      setQrData(image);
    } catch (error) {
      setQrError(error instanceof Error ? error.message : 'No pudimos preparar el código QR.');
    } finally {
      setQrLoading(false);
    }
  }

  if (!data) return <main className="result-loading lab-page"><span className="loading-orbit">▥</span><p>Preparando tu ficha…</p></main>;

  return (
    <main className={`result-shell theme-${data.color || 'blue'} lab-page`}>
      <header className="topbar result-topbar"><a className="brand" href="/" aria-label="Data Lab, inicio"><span className="brand-mark">D</span><span>IES·09<small>LABORATORIO DE DATOS</small></span></a><span className="live-pill"><i /> FICHA LISTA</span></header>
      <section className="result-layout">
        <div className="result-message"><span className="eyebrow"><span className="eyebrow-line" /> {data.kind === 'traffic' ? 'SIMULACIÓN COMPLETADA' : data.kind === 'penalty' ? 'PENAL REGISTRADO' : 'ANÁLISIS COMPLETADO'}</span><h1>{data.kind === 'traffic' ? <>Tu experimento<br />en datos<span className="period">.</span></> : data.kind === 'penalty' ? <>Tu tiro<br />en datos<span className="period">.</span></> : data.kind === 'decision' ? <>Tu decisión,<br />con datos<span className="period">.</span></> : <>Buen trabajo,<br />{data.name}<span className="period">.</span></>}</h1><p>{data.kind === 'traffic' ? 'Comparaste dos estrategias usando el mismo flujo de autos y miraste cómo cambian la espera y las colas.' : data.kind === 'penalty' ? 'Registraste un tiro y comparaste el resultado con la probabilidad teórica del simulador.' : data.kind === 'decision' ? 'Contaste, comparaste e interpretaste probabilidades antes de decidir qué hacer con el pronóstico.' : 'Seguiste el proceso: revisaste la calidad de los datos, buscaste un patrón y probaste un modelo para apoyar una decisión.'}</p><button className="button button-quiet" onClick={restart}>↻ <span>Nuevo análisis</span></button><div className="result-note"><span>✦</span><p>{data.kind === 'penalty' ? 'La ficha incluye el resultado del tiro y las probabilidades didácticas por zona.' : data.kind === 'decision' ? 'La ficha incluye lo que aprendiste del registro y la probabilidad estimada.' : 'La ficha incluye la comparación de estrategias y las métricas de esta simulación.'}</p></div>{data.kind === 'decision' && <p className={`decision-save-note ${saveStatus === 'saved' ? 'saved' : ''}`}>{saveStatus === 'saved' ? 'Tu respuesta se sumó a las estadísticas compartidas.' : 'Tu ficha está lista; el registro compartido se activa al conectar la base de datos.'}</p>}</div>
        <WorldTicket data={data} />
      </section>
      <div className="result-actions"><button className="button button-primary" onClick={preparePrint}><span>↗</span> Imprimir / guardar tarjeta</button><button className="button button-outline" onClick={showPhoneCard}>▦ Ver en el teléfono</button><button className="button button-outline" onClick={restart}>Nuevo experimento ↺</button></div>
      <footer className="site-footer"><span>IES N.º 9 <b>·</b> TECNICATURA SUPERIOR EN CIENCIA DE DATOS E IA</span><span>DATOS <b>→</b> DECISIONES</span></footer>
      {shareOpen && <div className="share-backdrop" role="presentation" onClick={() => setShareOpen(false)}><section className="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={(event) => event.stopPropagation()}>
        <div className="share-dialog-top"><span className="eyebrow"><span className="eyebrow-line" /> TARJETA DIGITAL</span><button onClick={() => setShareOpen(false)} aria-label="Cerrar">×</button></div>
        <h2 id="share-title">{data.kind === 'penalty' ? 'Llevate tu tiro' : data.kind === 'decision' ? 'Llevate tu decisión' : 'Llevate la comparación'}</h2><p>Abrí la cámara del teléfono y apuntá al código para guardar tu ficha desde cualquier conexión.</p>
        {qrLoading ? <div className="qr-placeholder">Preparando el QR…</div> : qrData ? <img className="share-qr" src={qrData} alt="Código QR para abrir la tarjeta en un teléfono" width="220" height="220" /> : <div className="qr-error">{qrError}</div>}
        <p className="share-note">Cualquiera que escanee el código podrá ver esta ficha. El QR se genera en el navegador; no usamos un generador externo.</p>
        {shareUrl && <details className="share-link"><summary>Ver enlace de la tarjeta</summary><div>{shareUrl}</div></details>}
      </section></div>}
    </main>
  );
}
