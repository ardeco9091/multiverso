// src/app/result/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState({
    intelligence: 0,
    creativity: 0,
    codingSpeed: 0,
  });

  useEffect(() => {
    const savedData = sessionStorage.getItem('multiverseData');
    if (!savedData) {
      router.push('/');
    } else {
      const parsed = JSON.parse(savedData);
      setData(parsed);
      // Estadísticas ultra altas para motivar y sorprender al usuario
      setStats({
        intelligence: Math.floor(Math.random() * (99 - 90) + 90),
        creativity: Math.floor(Math.random() * (98 - 88) + 88),
        codingSpeed: Math.floor(Math.random() * (100 - 92) + 92),
      });
    }
  }, [router]);

  if (!data) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-cyan-400 flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden">
      
      {/* Fondo con efectos de luz tipo grilla y neón */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f4915_1px,transparent_1px),linear-gradient(to_bottom,#082f4915_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Tarjeta Holográfica Principal */}
      <div className="z-10 max-w-md w-full bg-slate-900/90 border-2 border-cyan-400 rounded-3xl p-6 shadow-[0_0_60px_rgba(6,182,212,0.35)] backdrop-blur-xl relative overflow-hidden">
        
        {/* Sello superior holográfico */}
        <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-600 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
          ⚡ IES N° 9 • IA VERSE
        </div>

        {/* Encabezado del Avatar / Identidad */}
        <div className="text-center mt-4 mb-6">
          <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-3xl">
              {data.role.includes('Data') ? '🧙‍♂️' : data.role.includes('AI') ? '🤖' : '💻'}
            </div>
          </div>
          
          <p className="text-[11px] uppercase tracking-widest text-cyan-300/70">Sujeto Analizado</p>
          <h2 className="text-3xl font-black text-white mt-0.5 tracking-wider uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            {data.name}
          </h2>
          
          <div className="inline-block mt-3 px-4 py-1 bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-xs rounded-full font-bold shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]">
            {data.role}
          </div>
        </div>

        {/* Atributos de Poder / Barras Animadas */}
        <div className="space-y-3.5 bg-slate-950/80 p-4 rounded-2xl border border-cyan-500/30 mb-5 shadow-inner">
          <div className="flex justify-between items-center text-[10px] text-cyan-400 uppercase tracking-widest font-bold border-b border-cyan-500/20 pb-1">
            <span>Parámetros Neurales</span>
            <span className="text-emerald-400 animate-pulse">● LIVE SYNC</span>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1 font-semibold">
              <span className="text-slate-300">Lógica & Datos</span>
              <span className="text-cyan-300">{stats.intelligence}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-500/20">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${stats.intelligence}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-semibold">
              <span className="text-slate-300">Innovación IA</span>
              <span className="text-cyan-300">{stats.creativity}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-500/20">
              <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${stats.creativity}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-semibold">
              <span className="text-slate-300">Prompt Engineering</span>
              <span className="text-cyan-300">{stats.codingSpeed}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-500/20">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${stats.codingSpeed}%` }} />
            </div>
          </div>
        </div>

        {/* Combustible del Dev */}
        <div className="text-center text-xs text-slate-300 mb-6 bg-cyan-950/40 border border-cyan-500/40 p-2.5 rounded-xl flex items-center justify-center gap-2">
          <span>🧉</span>
          <span><strong className="text-cyan-300">Core Power:</strong> {data.fuel}</span>
        </div>

        {/* Botones de acción futuristas */}
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex-1 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl transition shadow-[0_0_25px_rgba(6,182,212,0.6)] uppercase text-xs tracking-wider cursor-pointer active:scale-95"
          >
            📸 Capturar Póster
          </button>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl transition border border-cyan-500/40 uppercase text-xs tracking-wider cursor-pointer active:scale-95"
          >
            🔄 Nuevo
          </button>
        </div>

      </div>
    </main>
  );
}