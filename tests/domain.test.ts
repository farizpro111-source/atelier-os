import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { minor, revenue, freeSlots, instant, localDay, clientMetrics } from '../src/lib/domain/calculations';
import { clientSchema, serviceSchema } from '../src/lib/domain/schemas';
import { signSession, verifySession } from '../src/lib/telegram/session-token';
import { validateTelegramInitData } from '../src/lib/telegram/validate-init-data';
import { getVerifiedTelegramUser } from '../src/lib/telegram/server';
import type { Workspace, Appointment, Payment } from '../src/lib/domain/types';

// Synthetic unit-test fixtures only; never imported by application code.
const appointment = { id: 'a', staff_id: 's', client_id: 'c', status: 'confirmed', starts_at: '2026-09-30T05:00:00Z', ends_at: '2026-09-30T06:00:00Z' } as Appointment;
const workspace = { organization: { timezone: 'Asia/Almaty' }, staff: [{ id: 's', active: true }], services: [{ id: 'v', active: true, duration_minutes: 60 }], schedules: [{ staff_id: 's', work_date: '2026-09-30', starts_local: '09:00', ends_local: '12:00' }], assignments: [{ staff_id: 's', service_id: 'v' }], appointments: [appointment], payments: [] } as unknown as Workspace;
test('money is exact in minor units and rejects invalid input', () => {
  assert.equal(minor('123,45'), 12345); assert.equal(minor('0.01'), 1);
  for (const v of ['-1', '1.234', 'NaN', '1e3']) assert.throws(() => minor(v));
});
test('timezone conversion is independent of browser timezone', () => {
  assert.equal(instant('2026-09-30', '10:00', 'Asia/Almaty'), new Date(appointment.starts_at).toISOString());
  assert.equal(localDay('2026-09-29T22:00:00Z', 'Asia/Almaty'), '2026-09-30');
  assert.throws(() => instant('2026-03-08', '02:30', 'America/New_York'));
});
test('slots exclude overlaps but permit adjacent visits', () => {
  assert.deepEqual(freeSlots(workspace, 's', 'v', '2026-09-30'), ['09:00', '11:00']);
  assert.equal(freeSlots({ ...workspace, schedules: [] }, 's', 'v', '2026-09-30').length, 0);
  assert.equal(freeSlots({ ...workspace, assignments: [] }, 's', 'v', '2026-09-30').length, 0);
});
test('cancelled visits release slots; rescheduling excludes itself', () => {
  const cancelled = { ...workspace, appointments: [{ ...appointment, status: 'cancelled' as const }] };
  assert.ok(freeSlots(cancelled, 's', 'v', '2026-09-30').includes('10:00'));
  assert.ok(freeSlots(workspace, 's', 'v', '2026-09-30', 60, 'a').includes('10:00'));
});
test('refund counted on refund day, not paid day; pending excluded', () => {
  const p = { id: 'p', appointment_id: 'a', amount_minor: 15000, status: 'refunded', paid_at: '2026-09-29T06:00:00Z', refunded_at: '2026-09-30T06:00:00Z' } as Payment;
  assert.equal(revenue([p], '2026-09-29', '2026-09-30', 'Asia/Almaty').net, 15000);
  assert.equal(revenue([p], '2026-09-30', '2026-10-01', 'Asia/Almaty').net, -15000);
  assert.equal(revenue([{ ...p, status: 'pending' }], '2026-09-29', '2026-10-01', 'Asia/Almaty').net, 0);
});
test('CRM visits count completions, LTV excludes refunds', () => {
  assert.equal(clientMetrics(workspace, 'c').visits, 0);
  const w = { ...workspace, appointments: [{ ...appointment, status: 'completed' as const }], payments: [{ appointment_id: 'a', status: 'paid', amount_minor: 1000 } as Payment] };
  assert.equal(clientMetrics(w, 'c').ltv, 1000); assert.equal(clientMetrics(w, 'c').visits, 1);
});
test('input validation rejects missing name and negative prices', () => {
  assert.equal(clientSchema.safeParse({ full_name: '' }).success, false);
  assert.equal(clientSchema.safeParse({ full_name: 'Гость', phone: '+7 777 1234567' }).success, true);
  assert.equal(serviceSchema.safeParse({ name: 'Стрижка', price_minor: -1, duration_minutes: 60, active: true }).success, false);
});
test('signed sessions expire and reject tampering and wrong secrets', () => {
  const id = '00000000-0000-4000-8000-000000000001', now = 1800000000000;
  const token = signSession(id, 'unit-test-secret', now);
  assert.equal(verifySession(token, 'unit-test-secret', now), id);
  assert.equal(verifySession(token, 'wrong', now), null);
  assert.equal(verifySession(token, 'unit-test-secret', now + 43200000), null);
  assert.equal(verifySession(token + 'x', 'unit-test-secret', now), null);
});
test('Telegram HMAC accepts authentic input, rejects malformed hash and duplicates', () => {
  const params = new URLSearchParams({ auth_date: '1800000000', user: '{"id":1}', signature: 'test' });
  const data = [...params].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const key = createHmac('sha256', 'WebAppData').update('test-token').digest();
  params.set('hash', createHmac('sha256', key).update(data).digest('hex'));
  assert.equal(validateTelegramInitData(params.toString(), 'test-token'), true);
  assert.equal(validateTelegramInitData(params.toString() + 'zz', 'test-token'), false);
  assert.equal(validateTelegramInitData(params.toString() + '&user=other', 'test-token'), false);
});
test('Telegram server checks identity and auth-date freshness', () => {
  const previous = process.env.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_BOT_TOKEN = 'unit-test-token';
  const signed = (age: number, id = 123) => {
    const p = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000) - age), user: JSON.stringify({ id, first_name: 'Test' }) });
    const key = createHmac('sha256', 'WebAppData').update('unit-test-token').digest();
    p.set('hash', createHmac('sha256', key).update([...p].sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join('\n')).digest('hex'));
    return p.toString();
  };
  try {
    assert.equal(getVerifiedTelegramUser(signed(10))?.id, 123);
    assert.equal(getVerifiedTelegramUser(signed(3601)), null);
    assert.equal(getVerifiedTelegramUser(signed(-120)), null);
    assert.equal(getVerifiedTelegramUser(signed(10, -1)), null);
  } finally { if (previous === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = previous; }
});
