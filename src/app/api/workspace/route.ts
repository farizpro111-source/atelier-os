import { NextResponse } from 'next/server';
import { context, requireContext } from '@/lib/auth';
import { clientSchema, serviceSchema, staffSchema, branchSchema } from '@/lib/domain/schemas';
import { z } from 'zod';

export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET() {
 try {
  const ctx=await context(); if(!ctx) return json({error:'Откройте Atelier OS из Telegram для безопасного входа.'},401);
  if(!ctx.member||!ctx.organization) return json({error:'Сначала создайте салон.',onboarding:true},409);
  const {db,member,organization,user}=ctx; const specialist=member.role==='specialist';
  async function all(table:string,fields='*',filter?:[string,string]) { const rows:unknown[]=[]; for(let offset=0;;offset+=500){let q=db.from(table).select(fields).eq('organization_id',member!.organization_id).order(table==='organization_members'?'user_id':'id').range(offset,offset+499); if(filter)q=q.eq(...filter); const {data,error}=await q; if(error)throw error; rows.push(...data); if(data.length<500)return rows;} }
  const staff=await all('staff'); const own=(staff as {id:string;user_id:string}[]).find(s=>s.user_id===user.id);
  const [clients,services,branches,appointments,payments,schedules,assignments,members]=await Promise.all([
   specialist?Promise.resolve([] as unknown[]):all('clients'),all('services'),all('branches'),specialist?(own?all('appointments','*',['staff_id',own.id]):[]):all('appointments'),specialist?Promise.resolve([] as unknown[]):all('payments'),all('staff_schedules'),all('staff_services'),specialist?Promise.resolve([] as unknown[]):all('organization_members')
  ]);
  // Specialists receive client names only for their own appointments, never the CRM/contact database.
  if(specialist){const ids=[...new Set((appointments as {client_id:string}[]).map(a=>a.client_id))];for(let i=0;i<ids.length;i+=100){const {data,error}=await db.from('clients').select('id,full_name').eq('organization_id',member.organization_id).in('id',ids.slice(i,i+100));if(error)throw error;clients.push(...data);}}
  return json({organization,user,role:member.role,clients,services,staff:specialist?staff.filter(s=>(s as {id:string}).id===own?.id):staff,branches,appointments,payments,schedules:specialist?schedules.filter(s=>(s as {staff_id:string}).staff_id===own?.id):schedules,assignments,members});
 } catch { return json({error:'Не удалось загрузить данные. Проверьте подключение и настройки сервера; повторите попытку.'},503); }
}
const envelope=z.object({table:z.enum(['clients','services','staff','branches']),id:z.uuid().optional(),operation:z.enum(['save','archive']).default('save'),values:z.unknown()});
export async function POST(request:Request){
 try{
  if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Недопустимый источник запроса.'},403);
  const ctx=await requireContext(); const parsed=envelope.safeParse(await request.json());if(!parsed.success)return json({error:'Недопустимый запрос.'},400);
  const {table,id,operation,values}=parsed.data;
  if(table==='branches'&&ctx.member.role!=='owner')return json({error:'Требуется роль owner.'},403);
  const schemas={clients:clientSchema,services:serviceSchema,staff:staffSchema,branches:branchSchema};
  let payload:Record<string,unknown>;
  if(operation==='archive'){if(!id)return json({error:'Не указан объект.'},400);payload={archived_at:new Date().toISOString()};}
  else{const result=schemas[table].safeParse(values);if(!result.success)return json({error:'Проверьте поля формы.',fields:result.error.flatten().fieldErrors},400);payload=result.data;}
  if(table==='staff'&&operation==='save'&&ctx.member.role!=='owner'){
   // Linking an account affects authorization; only owner may do so.
   if(id){const {data,error}=await ctx.db.from('staff').select('user_id').eq('organization_id',ctx.organization.id).eq('id',id).single();if(error)throw error;if(data.user_id!==payload.user_id)return json({error:'Только owner связывает аккаунты сотрудников.'},403);}
   else if(payload.user_id)return json({error:'Только owner связывает аккаунты сотрудников.'},403);
  }
  const query=id?ctx.db.from(table).update(payload).eq('id',id).eq('organization_id',ctx.organization.id):ctx.db.from(table).insert({...payload,organization_id:ctx.organization.id});
  const {data,error}=await query.select().single();if(error)return json({error:error.code==='23503'?'Связанный объект недоступен в этом салоне.':'Не удалось сохранить. Обновите данные и повторите попытку.'},409);
  return json({record:data});
 }catch{return json({error:'Недостаточно прав или сессия истекла. Откройте приложение заново.'},403);}
}
