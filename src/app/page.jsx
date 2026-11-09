'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 'rainyDays', label: 'Contar', title: 'En los días nublados, ¿cuántas veces llovió?', correct: 'five', explanation: 'Llovió 5 de los 7 días nublados. Ese conteo será la base para estimar una probabilidad.', choices: [['five', '5 días'], ['two', '2 días'], ['seven', '7 días']] },
  { id: 'clearChance', label: 'Comparar', title: 'Cuando estuvo despejado, ¿qué chance hubo de lluvia?', correct: '15', explanation: 'Hubo lluvia 2 de 13 días despejados: aproximadamente 15%. Con cielo nublado fue 5 de 7, cerca de 71%.', choices: [['15', 'Cerca del 15%'], ['50', 'Cerca del 50%'], ['85', 'Cerca del 85%']] },
  { id: 'tomorrowChance', label: 'Estimar', title: 'Mañana se esperan muchas nubes. ¿Qué chance de lluvia estima el modelo?', correct: '60', explanation: 'La cuenta es: 80% × 71% de lluvia en días nublados, más 20% × 15% en despejados. Da cerca del 60%. Es una posibilidad, no una certeza.', choices: [['15', 'Cerca del 15%'], ['60', 'Cerca del 60%'], ['71', 'Cerca del 71%']] },
  { id: 'chanceMeaning', label: 'Interpretar', title: '¿Qué quiere decir “60% de probabilidad de lluvia”?', correct: 'chance', explanation: 'Significa que, en situaciones parecidas, llovería en alrededor de 6 de cada 10 casos. No indica cuánto dura la lluvia ni garantiza qué pasará mañana.', choices: [['hours', 'Lloverá el 60% del día'], ['chance', 'En situaciones parecidas, llueve cerca de 6 de cada 10 veces'], ['sure', 'Seguro va a llover']] },
  { id: 'modelReading', label: 'Revisar', title: 'Una regla acertó 16 de 20 días. ¿Qué conclusión tiene sentido?', correct: 'eighty', explanation: 'Acertó el 80% de estos mismos 20 días y falló en 4. Eso no asegura que funcione igual con días nuevos: hay que probarla con más datos.', choices: [['perfect', 'Ya podemos confiar siempre'], ['eighty', 'Acertó el 80%, pero no es perfecto'], ['useless', 'No sirve para nada']] },
  { id: 'umbrellaDecision', label: 'Decidir', title: 'Con una chance de lluvia del 60%, ¿llevarías paraguas?', correct: null, explanation: 'La probabilidad no toma la decisión por vos. Si mojarte sería un problema, quizá lo llevás; si casi no vas a estar afuera, quizá no.', choices: [['yes', 'Sí, lo llevaría'], ['no', 'No lo llevaría'], ['depends', 'Depende de mis planes']] },
  { id: 'moreData', label: 'Mejorar', title: '¿Qué dato ayudaría a mejorar esta estimación?', correct: 'seasons', explanation: 'Más días de distintas estaciones y lugares dan una imagen más completa. El clima cambia y 20 días no alcanzan para representar todos los casos.', choices: [['seasons', 'Más días, de distintas estaciones y lugares'], ['cloudy', 'Solo más días nublados'], ['delete', 'Quitar del registro los días que llovió']] },
];

function RainEvidence() {
  return <section className="weather-evidence" aria-label="Datos simulados de veinte días">
    <div className="evidence-heading"><span>REGISTRO DE 20 DÍAS SIMULADOS</span><span>¿CUÁNDO LLOVIÓ?</span></div>
    <div className="evidence-row"><div className="evidence-condition"><span className="weather-icon">☁</span><span><strong>Nublado</strong><small>7 días</small></span></div><div className="evidence-bar"><i className="evidence-rain" style={{ width: `${5 / 7 * 100}%` }} /><i className="evidence-dry" style={{ width: `${2 / 7 * 100}%` }} /></div><div className="evidence-count"><strong>5</strong><small>lluvia</small><b>2</b><small>no</small></div></div>
    <div className="evidence-row"><div className="evidence-condition"><span className="weather-icon clear-icon">☀</span><span><strong>Despejado</strong><small>13 días</small></span></div><div className="evidence-bar"><i className="evidence-rain" style={{ width: `${2 / 13 * 100}%` }} /><i className="evidence-dry" style={{ width: `${11 / 13 * 100}%` }} /></div><div className="evidence-count"><strong>2</strong><small>lluvia</small><b>11</b><small>no</small></div></div>
    <div className="evidence-legend"><span><i className="legend-rain" /> Llovió</span><span><i className="legend-dry" /> No llovió</span><span>Muestra inventada para aprender</span></div>
  </section>;
}

function createTicket(answers) {
  const decision = answers.umbrellaDecision === 'yes' ? 'Sí llevarías paraguas' : answers.umbrellaDecision === 'no' ? 'Decidiste no llevarlo' : 'Tu decisión depende del plan';
  return {
    kind: 'decision', name: 'Visitante', world: 'Del dato a la decisión', subtitle: `Pronóstico de lluvia: cerca del 60% · ${decision}`,
    story: `Analizaste 20 días simulados: llovió 5 de 7 días nublados y 2 de 13 despejados. El modelo estima cerca de 60% para mañana. La probabilidad orienta, pero la decisión también depende de tus planes.`,
    glyph: '☂', color: 'blue', relics: ['Contar y comparar', 'Estimar una probabilidad', 'Revisar errores', 'Decidir con contexto'],
    chart: [{ time: 'Nublado', minutes: 71 }, { time: 'Despejado', minutes: 15 }, { time: 'Mañana', minutes: 60 }], average: 0, prediction: '', confidence: 60,
  };
}

export default function HomePage() {
  const router = useRouter();
  const [alias, setAlias] = useState('');
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState('checking');
  const [finishing, setFinishing] = useState(false);

  useEffect(() => { fetch('/api/decision').then((response) => response.json()).then((data) => setDatabaseStatus(data.connected ? 'connected' : 'pending')).catch(() => setDatabaseStatus('pending')); }, []);

  const question = STEPS[step];
  const isCorrect = question.correct === null ? null : selected === question.correct;

  function start() { setStarted(true); setStep(0); setAnswers({}); setSelected(null); }

  function choose(choice) {
    setSelected(choice);
    setAnswers((previous) => ({ ...previous, [question.id]: choice }));
  }

  async function continueLab() {
    if (step < STEPS.length - 1) { setStep((current) => current + 1); setSelected(null); return; }
    setFinishing(true);
    const response = {
      rainyDaysAnswer: answers.rainyDays,
      clearChanceAnswer: answers.clearChance,
      tomorrowChanceAnswer: answers.tomorrowChance,
      chanceMeaningCorrect: answers.chanceMeaning === 'chance',
      modelReading: answers.modelReading,
      umbrellaDecision: answers.umbrellaDecision,
      dataPlan: answers.moreData,
    };
    const ticket = { ...createTicket(answers), name: alias.trim().slice(0, 28) || 'Visitante' };
    sessionStorage.setItem('multiverseData', JSON.stringify(ticket));
    sessionStorage.setItem('decisionAnswers', JSON.stringify(response));
    let status = 'pending';
    try {
      const result = await fetch('/api/decision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) });
      const saved = await result.json();
      if (saved.saved) status = 'saved';
    } catch { status = 'pending'; }
    sessionStorage.setItem('decisionSaveStatus', status);
    router.push('/result');
  }

  return <main className="lab-shell decision-shell"><div className="lab-grid" />
    <header className="lab-header"><a href="/" className="lab-brand"><span className="lab-brand-mark">D</span><span>IES·09 <small>LABORATORIO DE DATOS</small></span></a><a href="/estadisticas" className="decision-board-link">Resultados de la expo <span>↗</span></a></header>
    {!started ? <section className="lab-hero decision-hero">
      <div className="lab-hero-copy"><span className="lab-eyebrow"><i /> EXPERIENCIA GUIADA · 7 PREGUNTAS</span><h1>Del dato a<br />una <em>decisión.</em></h1><p>¿Llevarías paraguas mañana? Analizá un registro de días, interpretá un pronóstico y decidí qué harías con esa información.</p><div className="lab-name-field"><label htmlFor="analyst-name">NOMBRE PARA TU FICHA <span>(opcional)</span></label><input id="analyst-name" maxLength={28} value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="Podés usar un alias" /></div><button className="lab-button lab-button-primary" onClick={start}>Empezar el análisis <span>→</span></button><p className="lab-footnote">No necesitás saber programar. Los datos del ejercicio son simulados.</p>{databaseStatus !== 'checking' && <p className={`decision-db-hint ${databaseStatus}`}>{databaseStatus === 'connected' ? 'El tablero compartido está activo.' : 'El tablero compartido espera conexión a la base de datos.'}</p>}</div>
      <div className="decision-preview"><div className="decision-preview-top"><span>CASO 01 · PRONÓSTICO</span><span>20 DÍAS</span></div><div className="umbrella-scene"><span className="weather-cloud cloud-a">☁</span><span className="weather-cloud cloud-b">☁</span><span className="umbrella-mark">☂</span><span className="forecast-badge">60%<small>POSIBILIDAD DE LLUVIA</small></span></div><div className="decision-preview-bottom"><span>OBSERVAR LOS DATOS</span><i>→</i><span>ESTIMAR LA CHANCE</span><i>→</i><span>DECIDIR</span></div></div>
    </section> : <section className="decision-workspace">
      <div className="decision-workspace-top"><button className="lab-back" onClick={() => { if (step === 0) setStarted(false); else { setStep((current) => current - 1); setSelected(answers[STEPS[step - 1].id] || null); } }}>← {step === 0 ? 'Inicio' : 'Pregunta anterior'}</button><div className="decision-count"><span>PREGUNTA</span><strong>{step + 1}</strong><span>/ {STEPS.length}</span></div></div>
      <div className="lab-progress"><span style={{ width: `${(step + 1) / STEPS.length * 100}%` }} /></div>
      <div className="decision-content"><div className="decision-question-label"><span className="lab-eyebrow"><i /> PASO {String(step + 1).padStart(2, '0')} · {question.label.toUpperCase()}</span><h1>{question.title}</h1><p>{step === 0 || step === 1 ? 'Usá el registro de abajo para responder. Fijate cuántos días hay en cada grupo.' : step === 2 ? 'La estimación combina lo que pasó en días nublados y despejados.' : step === 3 ? 'Una probabilidad habla de chances: no asegura qué va a pasar en un día particular.' : step === 4 ? 'La regla se probó con los mismos días usados para aprender el patrón.' : step === 5 ? 'No hay una única respuesta: pensá en tus planes y en qué te costaría más.' : 'Ningún pronóstico mejora con pocos datos iguales. Pensá qué otra información sumarías.'}</p></div>
        {(step <= 2 || step === 4) && <RainEvidence />}
        {step === 2 && <div className="forecast-given"><span>PRONÓSTICO DE NUBES PARA MAÑANA</span><strong>80%</strong><small>Se esperan muchas nubes</small></div>}
        {step === 4 && <div className="model-score"><span>PRUEBA DEL MODELO</span><strong>16 <small>aciertos</small> / 20 <small>días</small></strong><span className="model-score-bar"><i /></span><small>4 días fueron estimados incorrectamente</small></div>}
        {step === 5 && <div className="forecast-reminder"><span>☂</span><strong>El pronóstico estima cerca del 60% de probabilidad de lluvia.</strong></div>}
        {step === 6 && <div className="weather-summary-strip"><span>20 días analizados</span><b>·</b><span>2 condiciones del cielo</span><b>·</b><span>1 estimación para mañana</span></div>}
        <div className="decision-answers">{question.choices.map(([value, label], index) => <button key={value} className={`decision-answer${selected === value ? ' selected' : ''}${selected === value && isCorrect === true ? ' correct' : ''}${selected === value && isCorrect === false ? ' incorrect' : ''}`} onClick={() => choose(value)}><span className="decision-answer-index">{String.fromCharCode(65 + index)}</span><strong>{label}</strong><span className="decision-answer-mark">{selected === value ? isCorrect === true ? '✓' : isCorrect === false ? '↺' : '•' : '→'}</span></button>)}</div>
        {selected && <div className={`decision-feedback${isCorrect === true ? ' feedback-correct' : isCorrect === false ? ' feedback-try' : ''}`}><strong>{isCorrect === null ? 'Esa decisión depende de la situación.' : isCorrect ? '¡Bien visto!' : 'Revisemos el dato.'}</strong><span>{question.explanation}</span></div>}
        <div className="decision-controls"><span>{selected ? step === STEPS.length - 1 ? 'Terminaste el recorrido.' : 'Leé la explicación y seguí al próximo paso.' : 'Elegí una opción para continuar.'}</span><button className="lab-button lab-button-primary" disabled={!selected || finishing} onClick={continueLab}>{finishing ? 'Guardando…' : step === STEPS.length - 1 ? 'Ver mi ficha' : 'Continuar'} <span>→</span></button></div>
      </div>
    </section>}
    <footer className="lab-footer"><span>IES N.º 9 · TECNICATURA SUPERIOR EN CIENCIAS DE DATOS E INTELIGENCIA ARTIFICIAL</span><span>DATOS → PROBABILIDAD → DECISIÓN</span></footer>
  </main>;
}
