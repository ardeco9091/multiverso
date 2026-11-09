'use client';

import { useEffect, useState } from 'react';

export default function DecisionStatisticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function refresh() {
    setLoading(true);
    setError('');
    fetch('/api/decision').then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No pudimos consultar las respuestas.');
      setData(result);
    }).catch((reason) => setError(reason.message || 'No pudimos consultar las respuestas.')).finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);
  const total = Number(data?.total) || 0;
  const pct = (value) => total ? Math.round(Number(value || 0) / total * 100) : 0;

  return <main className="lab-shell decision-shell"><div className="lab-grid" />
    <header className="lab-header"><a href="/" className="lab-brand"><span className="lab-brand-mark">D</span><span>IES·09 <small>LABORATORIO DE DATOS</small></span></a><a href="/" className="lab-header-tag">← Volver al análisis</a></header>
    <section className="decision-stats-page"><span className="lab-eyebrow"><i /> TABLERO DE LA EXPO</span><h1>¿Cómo decidimos con un pronóstico?</h1><p className="decision-stats-intro">Respuestas anónimas del recorrido Del dato a una decisión. Sirven para analizar cómo interpretó el público la probabilidad y qué decisión tomó.</p>
      {loading ? <div className="decision-stats-empty">Cargando respuestas…</div> : error ? <div className="decision-stats-empty">{error} <button onClick={refresh}>Volver a intentar</button></div> : !data?.connected ? <div className="decision-stats-empty"><strong>El tablero compartido todavía no está conectado.</strong><span>Las respuestas se podrán sumar acá cuando se active la base de datos.</span></div> : total === 0 ? <div className="decision-stats-empty"><strong>El tablero está listo para la primera respuesta.</strong><span>Cuando alguien complete el análisis, sus respuestas aparecerán aquí.</span></div> : <>
        <div className="decision-stats-total"><strong>{total}</strong><span>recorridos completados</span></div>
        <div className="decision-stats-grid">
          <section className="decision-stat-card"><span>CONTÓ LA LLUVIA EN DÍAS NUBLADOS</span><strong>{pct(data.rainyDaysCorrect)}%</strong><div className="decision-stat-track"><i style={{ width: `${pct(data.rainyDaysCorrect)}%` }} /></div><small>{data.rainyDaysCorrect} de {total} respuestas</small></section>
          <section className="decision-stat-card"><span>ESTIMÓ LA CHANCE EN DÍAS DESPEJADOS</span><strong>{pct(data.clearChanceCorrect)}%</strong><div className="decision-stat-track"><i style={{ width: `${pct(data.clearChanceCorrect)}%` }} /></div><small>{data.clearChanceCorrect} de {total} respuestas</small></section>
          <section className="decision-stat-card"><span>ESTIMÓ LA CHANCE PARA MAÑANA</span><strong>{pct(data.tomorrowChanceCorrect)}%</strong><div className="decision-stat-track"><i style={{ width: `${pct(data.tomorrowChanceCorrect)}%` }} /></div><small>{data.tomorrowChanceCorrect} de {total} respuestas</small></section>
          <section className="decision-stat-card"><span>INTERPRETÓ BIEN EL 60%</span><strong>{pct(data.correctInterpretation)}%</strong><div className="decision-stat-track"><i style={{ width: `${pct(data.correctInterpretation)}%` }} /></div><small>{data.correctInterpretation} de {total} respuestas</small></section>
          <section className="decision-stat-card"><span>ENTENDIÓ QUE EL MODELO PUEDE FALLAR</span><strong>{pct(data.modelNotPerfect)}%</strong><div className="decision-stat-track"><i style={{ width: `${pct(data.modelNotPerfect)}%` }} /></div><small>{data.modelNotPerfect} de {total} respuestas</small></section>
        </div>
        <section className="decision-poll-card"><div><strong>¿Llevaría paraguas?</strong><small>Decisión ante 60% de probabilidad</small></div>{[['Sí', data.umbrellaYes], ['No', data.umbrellaNo], ['Depende', data.umbrellaDepends]].map(([label, value]) => <div className="decision-poll-row" key={label}><span>{label}</span><div><i style={{ width: `${pct(value)}%` }} /></div><strong>{value} · {pct(value)}%</strong></div>)}</section>
        <section className="decision-poll-card"><div><strong>¿Qué dato sumaría?</strong><small>Qué propone el público para mejorar el modelo</small></div><div className="decision-poll-row"><span>Más estaciones y lugares</span><div><i style={{ width: `${pct(data.dataPlanSeasons)}%` }} /></div><strong>{pct(data.dataPlanSeasons)}%</strong></div></section>
        <p className="decision-data-note">Las respuestas no incluyen nombres ni texto libre. Los porcentajes describen a las personas que participaron en la expo, no a toda la población.</p>
        <a className="decision-download" href="/api/decision?format=csv">Descargar las respuestas en CSV <span>↓</span></a>
      </>}
    </section>
    <footer className="lab-footer"><span>RESPUESTAS ANÓNIMAS · IES N.º 9</span><span>DATOS → PROBABILIDAD → DECISIÓN</span></footer>
  </main>;
}
