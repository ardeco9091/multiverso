import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RAINY_DAYS = ['five', 'two', 'seven'];
const CLEAR_CHANCE = ['15', '50', '85'];
const TOMORROW_CHANCE = ['15', '60', '71'];
const MODEL_ANSWERS = ['eighty', 'perfect', 'useless'];
const UMBRELLA_ANSWERS = ['yes', 'no', 'depends'];
const DATA_PLAN_ANSWERS = ['seasons', 'cloudy', 'delete'];
let tablePromise;

function database() { return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null; }

async function ensureTable(sql) {
  if (!tablePromise) {
    tablePromise = sql`CREATE TABLE IF NOT EXISTS decision_responses (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      rainy_days_answer TEXT NOT NULL CHECK (rainy_days_answer IN ('five', 'two', 'seven')),
      clear_chance_answer TEXT NOT NULL CHECK (clear_chance_answer IN ('15', '50', '85')),
      tomorrow_chance_answer TEXT NOT NULL CHECK (tomorrow_chance_answer IN ('15', '60', '71')),
      chance_meaning_correct BOOLEAN NOT NULL,
      model_reading TEXT NOT NULL CHECK (model_reading IN ('eighty', 'perfect', 'useless')),
      umbrella_decision TEXT NOT NULL CHECK (umbrella_decision IN ('yes', 'no', 'depends')),
      data_plan TEXT NOT NULL CHECK (data_plan IN ('seasons', 'cloudy', 'delete'))
    )`;
  }
  try { await tablePromise; }
  catch (error) { tablePromise = null; throw error; }
}

async function aggregate(sql) {
  await ensureTable(sql);
  const [row] = await sql`SELECT COUNT(*)::INTEGER AS total,
    COUNT(*) FILTER (WHERE rainy_days_answer = 'five')::INTEGER AS "rainyDaysCorrect",
    COUNT(*) FILTER (WHERE clear_chance_answer = '15')::INTEGER AS "clearChanceCorrect",
    COUNT(*) FILTER (WHERE tomorrow_chance_answer = '60')::INTEGER AS "tomorrowChanceCorrect",
    COUNT(*) FILTER (WHERE chance_meaning_correct)::INTEGER AS "correctInterpretation",
    COUNT(*) FILTER (WHERE model_reading = 'eighty')::INTEGER AS "modelNotPerfect",
    COUNT(*) FILTER (WHERE umbrella_decision = 'yes')::INTEGER AS "umbrellaYes",
    COUNT(*) FILTER (WHERE umbrella_decision = 'no')::INTEGER AS "umbrellaNo",
    COUNT(*) FILTER (WHERE umbrella_decision = 'depends')::INTEGER AS "umbrellaDepends",
    COUNT(*) FILTER (WHERE data_plan = 'seasons')::INTEGER AS "dataPlanSeasons"
    FROM decision_responses`;
  return { connected: true, ...row };
}

export async function GET(request) {
  const sql = database();
  if (!sql) return NextResponse.json({ connected: false, total: 0 });
  try {
    await ensureTable(sql);
    if (new URL(request.url).searchParams.get('format') === 'csv') {
      const rows = await sql`SELECT id, created_at, rainy_days_answer, clear_chance_answer, tomorrow_chance_answer, chance_meaning_correct, model_reading, umbrella_decision, data_plan FROM decision_responses ORDER BY created_at ASC`;
      const headers = ['id', 'fecha_utc', 'dias_nublados_con_lluvia_respuesta', 'lluvia_dia_despejado_respuesta', 'pronostico_manana_respuesta', 'interpreto_bien_el_60_por_ciento', 'lectura_del_modelo', 'decision_paraguas', 'dato_que_sumaria'];
      const body = rows.map((row) => [row.id, new Date(row.created_at).toISOString(), row.rainy_days_answer, row.clear_chance_answer, row.tomorrow_chance_answer, row.chance_meaning_correct, row.model_reading, row.umbrella_decision, row.data_plan].join(','));
      return new Response([headers.join(','), ...body].join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="respuestas-del-dato-a-la-decision.csv"', 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json(await aggregate(sql));
  } catch {
    return NextResponse.json({ connected: false, error: 'No se pudieron consultar las respuestas.' }, { status: 503 });
  }
}

export async function POST(request) {
  const sql = database();
  if (!sql) return NextResponse.json({ connected: false, saved: false });
  try {
    const body = await request.json();
    if (!RAINY_DAYS.includes(body.rainyDaysAnswer) || !CLEAR_CHANCE.includes(body.clearChanceAnswer)
      || !TOMORROW_CHANCE.includes(body.tomorrowChanceAnswer) || typeof body.chanceMeaningCorrect !== 'boolean'
      || !MODEL_ANSWERS.includes(body.modelReading) || !UMBRELLA_ANSWERS.includes(body.umbrellaDecision)
      || !DATA_PLAN_ANSWERS.includes(body.dataPlan)) {
      return NextResponse.json({ saved: false, error: 'Las respuestas no tienen el formato esperado.' }, { status: 400 });
    }
    await ensureTable(sql);
    await sql`INSERT INTO decision_responses (rainy_days_answer, clear_chance_answer, tomorrow_chance_answer, chance_meaning_correct, model_reading, umbrella_decision, data_plan)
      VALUES (${body.rainyDaysAnswer}, ${body.clearChanceAnswer}, ${body.tomorrowChanceAnswer}, ${body.chanceMeaningCorrect}, ${body.modelReading}, ${body.umbrellaDecision}, ${body.dataPlan})`;
    return NextResponse.json({ connected: true, saved: true, summary: await aggregate(sql) });
  } catch {
    return NextResponse.json({ connected: false, saved: false, error: 'No se pudieron guardar las respuestas.' }, { status: 503 });
  }
}
