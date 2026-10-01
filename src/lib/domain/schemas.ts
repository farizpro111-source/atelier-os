import { z } from 'zod';
const name=z.string().trim().min(2).max(120);
const optionalText=(max:number)=>z.string().trim().max(max).nullish().transform(v=>v||null);
const phone=z.string().trim().max(30).refine(v=>!v||/^\+?[\d\s()-]{6,30}$/.test(v),'Проверьте телефон').nullish().transform(v=>v||null);
export const clientSchema=z.object({full_name:name,phone,email:z.union([z.email(),z.literal('')]).nullish().transform(v=>v||null),birth_date:z.union([z.iso.date(),z.literal('')]).nullish().transform(v=>v||null).refine(v=>!v||v<=new Date().toISOString().slice(0,10),'Дата рождения не может быть в будущем'),notes:optionalText(4000),vip:z.boolean().default(false)});
export const serviceSchema=z.object({name,category:optionalText(80),duration_minutes:z.coerce.number().int().min(5).max(720),price_minor:z.number().int().min(0).max(999999999999),active:z.boolean()});
export const staffSchema=z.object({display_name:name,title:optionalText(120),phone,branch_id:z.uuid(),user_id:z.union([z.uuid(),z.literal('')]).nullish().transform(v=>v||null),active:z.boolean()});
export const branchSchema=z.object({name,address:optionalText(300),phone,timezone:z.string().max(80).refine(v=>{try{new Intl.DateTimeFormat('en',{timeZone:v});return true;}catch{return false;}},'Неизвестный часовой пояс')});
