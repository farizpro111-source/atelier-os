'use client';
import { useState } from 'react';
import { PageHeading } from '@/components/page-heading';
import { Empty, Field, Form, Gate, Sheet, mutate, useWorkspace } from './shared';
import { localDay, money, minor, revenue, shiftDay } from '@/lib/domain/calculations';
import type { Workspace } from '@/lib/domain/types';

const labels = { pending: 'Ожидает оплаты', paid: 'Оплачено', refunded: 'Возвращено', void: 'Аннулировано' };
export function Metric({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className={`crm-card ${emphasis ? 'revenue-card' : ''}`}><p>{label}</p><p className="metric-value">{value}</p></div>;
}
function PaymentForm({ w, saved }: { w: Workspace; saved: () => Promise<void> }) {
  // Retained across retries of this form; a lost response must not create a second payment.
  const [key] = useState(() => crypto.randomUUID());
  return <Form label="Записать оплату" onSubmit={async v => {
    await mutate({ operation: 'payment', values: { ...v, amount_minor: minor(v.amount), idempotency_key: key } }, '/api/operations'); await saved();
  }}><Field label="Запись" name="appointment_id"><select name="appointment_id" required><option value="">Выберите запись</option>{w.appointments.filter(a => !['cancelled', 'no_show'].includes(a.status)).map(a => <option key={a.id} value={a.id}>{localDay(a.starts_at, w.organization.timezone)} · {w.clients.find(c => c.id === a.client_id)?.full_name} · {money(a.price_minor, w.organization.currency)}</option>)}</select></Field>
    <Field label={`Сумма, ${w.organization.currency}`} name="amount"><input name="amount" inputMode="decimal" required /></Field>
    <Field label="Способ" name="method"><select name="method"><option value="cash">Наличные</option><option value="card">Карта</option><option value="transfer">Перевод</option></select></Field>
    <Field label="Статус" name="status"><select name="status"><option value="paid">Оплачено</option><option value="pending">Ожидает оплаты</option></select></Field>
    <p className="muted">Учёт фактически полученных денег. Эта форма не списывает деньги с банковской карты.</p>
  </Form>;
}
export default function Finance() {
  const state = useWorkspace(); const [selected, setSelected] = useState('');
  return <><PageHeading title="Финансы" eyebrow="Платежи · сверка" description="Оплаты, возвраты и чистая выручка по реальным визитам." /><Gate state={state}>{w => {
    const day = selected || localDay(new Date(), w.organization.timezone), totals = revenue(w.payments, day, shiftDay(day, 1), w.organization.timezone);
    return <><Sheet title="Новая оплата" trigger={<button className="btn">Добавить оплату</button>}>{close => <PaymentForm w={w} saved={async () => { close(); await state.refresh(); }} />}</Sheet>
      <div className="toolbar"><Field label="День сверки" name="day"><input type="date" value={day} onChange={e => e.target.value && setSelected(e.target.value)} /></Field></div>
      <div className="crm-grid"><Metric label="Выручка за день за вычетом возвратов" value={money(totals.net, w.organization.currency)} emphasis /><Metric label="Получено" value={money(totals.gross, w.organization.currency)} /><Metric label="Возвращено" value={money(totals.refunds, w.organization.currency)} /></div>
      <h2 className="text-xl font-extrabold">Журнал платежей · все даты</h2><p className="muted">Возврат учитывается в день возврата. Ожидающие и аннулированные платежи не включены в выручку.</p>
      <div className="crm-list">{[...w.payments].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(p => {
        const a = w.appointments.find(a => a.id === p.appointment_id);
        return <Sheet key={p.id} title="Платёж" trigger={<button className="crm-card client-card"><span className="grow"><strong>{w.clients.find(c => c.id === a?.client_id)?.full_name || 'Клиент'}</strong><span className="muted">{localDay(p.created_at, w.organization.timezone)} · {p.method}</span><span className="status">{labels[p.status]}</span></span><span className="money">{money(p.amount_minor, w.organization.currency)}</span></button>}>{close => <><p className="muted">{p.id}</p><p className="metric-value">{money(p.amount_minor, w.organization.currency)}</p><p>{labels[p.status]}</p>{['pending', 'paid'].includes(p.status) && <Form label="Подтвердить изменение" onSubmit={async v => {
          if (v.confirm !== 'on') throw new Error('Подтвердите изменение платежа.');
          await mutate({ operation: 'payment_status', values: { id: p.id, status: v.status } }, '/api/operations'); close(); await state.refresh();
        }}><Field label="Действие" name="status"><select name="status">{p.status === 'pending' ? <><option value="paid">Отметить оплаченным</option><option value="void">Аннулировать</option></> : <option value="refunded">Полный возврат</option>}</select></Field><label className="check"><input type="checkbox" name="confirm" required />Подтверждаю операцию; история сохранится</label></Form>}</>}</Sheet>;
      })}</div>{!w.payments.length && <Empty title="Платежей пока нет" text="Создайте запись и зарегистрируйте первую оплату. Выручка появится после фактической оплаты." />}</>;
  }}</Gate></>;
}
