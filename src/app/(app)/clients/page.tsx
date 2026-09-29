import {
  ChevronRight,
  CirclePlus,
  Crown,
  Phone,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";

const clients=[
 {name:"Dana Sadykova",phone:"+7 701 245 16 10",visits:12,ltv:"640 000 ₸",last:"18 сен",vip:false},
 {name:"Alina Karimova",phone:"+7 777 818 42 06",visits:8,ltv:"1 120 000 ₸",last:"сегодня",vip:true},
 {name:"Nursultan Akhmet",phone:"+7 702 446 52 31",visits:15,ltv:"775 000 ₸",last:"сегодня",vip:true},
 {name:"Kamila Rakhim",phone:"+7 705 937 03 18",visits:5,ltv:"310 000 ₸",last:"21 сен",vip:false},
 {name:"Arman Tulegenov",phone:"+7 747 401 87 17",visits:9,ltv:"465 000 ₸",last:"24 сен",vip:false},
];

export default function ClientsPage(){
 return (
  <>
    <PageHeading
      eyebrow="CRM · 428 клиентов"
      title="Клиенты"
      description="Кто возвращается, сколько тратит и когда был последний визит."
      action={
        <button className="inline-flex h-11 items-center gap-2 self-start rounded-[14px] bg-[#191a17] px-4 text-[12px] font-extrabold text-white">
          <CirclePlus className="size-4"/>
          Добавить
        </button>
      }
    />

    <div className="panel rounded-[20px] p-3">
      <div className="flex gap-2">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-[14px] border border-black/[.07] bg-white px-3">
          <Search className="size-4 text-black/30"/>
          <input
            aria-label="Поиск клиентов"
            placeholder="Имя или телефон"
            className="min-w-0 flex-1 bg-transparent text-[12px] font-bold outline-none placeholder:text-black/28"
          />
        </label>
        <button aria-label="Фильтры" className="grid size-11 place-items-center rounded-[14px] border border-black/[.07] bg-white text-black/44">
          <SlidersHorizontal className="size-4"/>
        </button>
      </div>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-2.5">
      <div className="rounded-[18px] border border-[#d8bf95]/45 bg-[#f2e7d5] p-3.5">
        <Sparkles className="size-4 text-[#8d6c38]"/>
        <div className="metric mt-3 text-[21px] font-extrabold">68%</div>
        <div className="mt-0.5 text-[9px] font-extrabold text-black/38">возвращаются повторно</div>
      </div>
      <div className="rounded-[18px] border border-black/[.07] bg-[#1b1c18] p-3.5 text-white">
        <Crown className="size-4 text-[#d8bc8c]"/>
        <div className="metric mt-3 text-[21px] font-extrabold">47</div>
        <div className="mt-0.5 text-[9px] font-extrabold text-white/42">VIP-клиентов</div>
      </div>
    </div>

    <section className="mt-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[16px] font-extrabold tracking-[-.025em]">Недавние клиенты</h2>
        <span className="text-[10px] font-bold text-black/30">По последнему визиту</span>
      </div>

      <div className="space-y-2.5">
        {clients.map(c=>(
          <button key={c.name} className="panel-strong flex w-full items-center gap-3 rounded-[19px] p-3 text-left">
            <div className="relative grid size-11 shrink-0 place-items-center rounded-[15px] bg-[#ece5d9] text-[11px] font-extrabold">
              {c.name.split(" ").map(x=>x[0]).join("")}
              {c.vip ? (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#1c1d19] text-[#e1c79a]">
                  <Crown className="size-2.5" />
                </span>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-extrabold">{c.name}</div>
              <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-black/37">
                <Phone className="size-2.5" /> {c.phone}
              </div>
              <div className="mt-2 flex gap-3 text-[9px] font-bold text-black/34">
                <span>{c.visits} визитов</span>
                <span>Последний: {c.last}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="metric whitespace-nowrap text-[11px] font-extrabold">{c.ltv}</div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-[.09em] text-black/27">LTV</div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-black/20"/>
          </button>
        ))}
      </div>
    </section>
  </>
 );
}
