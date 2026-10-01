'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PageHeading } from '@/components/page-heading';
import { Empty, Field, Gate, MoreLinks, useWorkspace } from './shared';
import { Metric } from './finance';
import { AppointmentSummary } from './appointments';
import { localDay, money, revenue, shiftDay, utilization } from '@/lib/domain/calculations';

export default function Overview({ analytics = false }: { analytics?: boolean }) {
  const state = useWorkspace(), [from, setFrom] = useState(''), [to, setTo] = useState('');
  return <><PageHeading title={analytics ? 'Аналитика' : 'Рабочий обзор'} eyebrow="Atelier · ваш салон" description={analytics ? 'Прозрачные показатели из записей, смен и платежей.' : 'Реальные результаты и ближайшие гости.'} /><Gate state={state}>{w => {
    const tz = w.organization.timezone, today = localDay(new Date(), tz), start = analytics ? from || shiftDay(today, -29) : today, end = analytics ? to || today : today;
    if (start > end) return <><button className="btn secondary" onClick={() => { setFrom(''); setTo(''); }}>Сбросить период</button><p role="alert">Начало периода должно быть не позже окончания.</p></>;
    const payments = revenue(w.payments, start, shiftDay(end, 1), tz), rows = w.appointments.filter(a => localDay(a.starts_at, tz) >= start && localDay(a.starts_at, tz) <= end);
    const completed = rows.filter(a => a.status === 'completed');
    const clients = new Set(completed.map(a => a.client_id));
    const repeated = [...clients].filter(id => w.appointments.filter(a => a.client_id === id && a.status === 'completed' && localDay(a.starts_at, tz) <= end).length > 1).length;
    const upcoming = rows.filter(a => ['pending', 'confirmed', 'checked_in'].includes(a.status)).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return <><p className="muted">{w.organization.name} · {tz} · {start} — {end}</p>{analytics ? <div className="crm-grid"><Field label="С даты" name="from"><input type="date" value={start} onChange={e => setFrom(e.target.value)} /></Field><Field label="По дату включительно" name="to"><input type="date" value={end} onChange={e => setTo(e.target.value)} /></Field></div> : <div className="actions"><Link className="btn" href="/appointments">Новая запись</Link><Link className="btn secondary" href="/analytics">Аналитика</Link></div>}
      <div className="crm-grid"><Metric label="Чистая выручка" value={money(payments.net, w.organization.currency)} emphasis /><Metric label="Записей / завершено" value={`${rows.length} / ${completed.length}`} /><Metric label="Средний оплаченный чек до возвратов" value={money(payments.average, w.organization.currency)} /><Metric label={analytics ? 'Повторные гости среди завершивших визит' : 'Загрузка смен сегодня'} value={analytics ? clients.size ? `${Math.round(repeated / clients.size * 100)}%` : 'Нет завершённых визитов' : utilization(w, today) === null ? 'Нет смен' : `${utilization(w, today)}%`} /></div>
      {!analytics && <><section className="crm-card"><h2 className="text-xl font-extrabold">Требует внимания</h2><p className="muted">Ожидают подтверждения: {rows.filter(a => a.status === 'pending').length}. Ожидают оплаты: {w.payments.filter(p => p.status === 'pending').length}.</p><Link className="btn secondary" href="/appointments">Открыть расписание</Link></section><h2 className="mt-5 text-xl font-extrabold">Незавершённые записи сегодня</h2><div className="crm-list">{upcoming.slice(0, 6).map(a => <Link href="/appointments" key={a.id} className="crm-card client-card"><AppointmentSummary a={a} w={w} /></Link>)}</div>{!upcoming.length && <Empty title="Все текущие визиты завершены или ещё не созданы" />}</>}
      <h2 className="mt-5 text-xl font-extrabold">Выручка · последние 7 дней периода</h2><div className="crm-list">{Array.from({ length: 7 }, (_, i) => shiftDay(end, i - 6)).filter(d => !analytics || d >= start).map(day => <div className="crm-card client-card" key={day}><span className="grow">{day}</span><strong>{money(revenue(w.payments, day, shiftDay(day, 1), tz).net, w.organization.currency)}</strong></div>)}</div>
      <h2 className="text-xl font-extrabold">Команда</h2><div className="crm-list">{w.staff.filter(s => !s.archived_at).map(s => <div className="crm-card" key={s.id}><strong>{s.display_name}</strong><p className="muted">Завершено за период: {completed.filter(a => a.staff_id === s.id).length} · загрузка сегодня: {utilization(w, today, s.id) === null ? 'нет смены' : `${utilization(w, today, s.id)}%`}</p></div>)}</div><MoreLinks /></>;
  }}</Gate></>;
}
