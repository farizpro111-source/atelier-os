"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Clock3,
  Filter,
  MoreHorizontal,
  Search,
  UserRound,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { cn } from "@/lib/utils";
import { telegramHaptic } from "@/lib/telegram/client";

const staff = ["Все", "Aruzhan", "Madina", "Timur", "Aigerim"];

const bookings = [
  { time:"09:00", end:"10:00", staff:"Timur", client:"Arman Tulegenov", service:"Мужская стрижка", price:"18 000 ₸", status:"Подтверждено", tone:"success" },
  { time:"10:00", end:"11:30", staff:"Aruzhan", client:"Dana Sadykova", service:"Стрижка + укладка", price:"32 000 ₸", status:"Подтверждено", tone:"success" },
  { time:"11:30", end:"14:00", staff:"Madina", client:"Alina Karimova", service:"Окрашивание", price:"95 000 ₸", status:"В салоне", tone:"accent" },
  { time:"13:00", end:"14:30", staff:"Aruzhan", client:"Nursultan A.", service:"Haircut + beard", price:"28 000 ₸", status:"Подтверждено", tone:"success" },
  { time:"15:30", end:"17:00", staff:"Aigerim", client:"Kamila R.", service:"Маникюр", price:"22 000 ₸", status:"Подтвердить", tone:"warning" },
  { time:"17:30", end:"18:30", staff:"Timur", client:"Dias B.", service:"Стрижка", price:"18 000 ₸", status:"Ожидает", tone:"neutral" },
];

const tones:Record<string,string>={
 success:"bg-[#e5f0e8] text-[#3f7159]",
 accent:"bg-[#eee5d5] text-[#866735]",
 warning:"bg-[#f5ead9] text-[#966629]",
 neutral:"bg-black/[.055] text-black/45",
};

export default function AppointmentsPage() {
  const [selected,setSelected]=useState("Все");
  const visible=useMemo(
    ()=>selected==="Все" ? bookings : bookings.filter(b=>b.staff===selected),
    [selected],
  );

  return (
    <>
      <PageHeading
        eyebrow="День · 31 запись"
        title="Записи"
        description="Весь рабочий день одной понятной лентой."
        action={
          <button
            onClick={()=>telegramHaptic("light")}
            className="inline-flex h-11 items-center gap-2 self-start rounded-[14px] bg-[#191a17] px-4 text-[12px] font-extrabold text-white"
          >
            <CirclePlus className="size-4" />
            Добавить
          </button>
        }
      />

      <div className="panel rounded-[20px] p-3.5">
        <div className="flex items-center justify-between">
          <button aria-label="Предыдущий день" className="grid size-10 place-items-center rounded-[13px] bg-black/[.045]">
            <ChevronLeft className="size-4" />
          </button>
          <button className="text-center">
            <div className="text-[13px] font-extrabold">29 сентября</div>
            <div className="mt-0.5 text-[10px] font-bold text-black/35">Вторник · Сегодня</div>
          </button>
          <button aria-label="Следующий день" className="grid size-10 place-items-center rounded-[13px] bg-black/[.045]">
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button className="flex h-10 flex-1 items-center gap-2 rounded-[13px] border border-black/[.07] bg-white px-3 text-left text-[11px] font-bold text-black/42">
            <Search className="size-3.5" /> Найти запись
          </button>
          <button aria-label="Фильтры" className="grid size-10 place-items-center rounded-[13px] border border-black/[.07] bg-white text-black/45">
            <Filter className="size-4" />
          </button>
        </div>
      </div>

      <div className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
        {staff.map(name=>(
          <button
            key={name}
            onClick={()=>{setSelected(name);telegramHaptic("selection")}}
            className={cn(
              "min-h-9 whitespace-nowrap rounded-full px-3.5 text-[10px] font-extrabold transition",
              selected===name
                ? "bg-[#191a17] text-white shadow-[0_7px_18px_rgba(25,26,23,.13)]"
                : "border border-black/[.06] bg-white/70 text-black/43",
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <section className="mt-4">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[12px] font-extrabold text-black/54">{visible.length} записей показано</div>
          <div className="text-[10px] font-bold text-black/30">09:00–19:00</div>
        </div>

        <div className="space-y-2.5">
          {visible.map((b)=>(
            <button
              key={b.time+b.client}
              className="panel-strong flex w-full items-stretch overflow-hidden rounded-[20px] text-left"
              onClick={()=>telegramHaptic("selection")}
            >
              <div className="w-[5px] bg-[#b39462]" />
              <div className="grid min-w-[72px] place-items-center border-r border-black/[.055] px-3 py-4">
                <div>
                  <div className="metric text-[14px] font-extrabold">{b.time}</div>
                  <div className="mt-0.5 text-[9px] font-bold text-black/30">{b.end}</div>
                </div>
              </div>
              <div className="min-w-0 flex-1 px-3.5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-extrabold">{b.client}</div>
                    <div className="mt-1 truncate text-[10px] font-semibold text-black/39">{b.service}</div>
                  </div>
                  <MoreHorizontal className="size-4 shrink-0 text-black/24" />
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-black/35">
                    <UserRound className="size-3" /> {b.staff}
                  </div>
                  <div className="metric text-[10px] font-extrabold">{b.price}</div>
                </div>
              </div>
              <div className="flex w-[88px] items-center justify-center pr-3">
                <span className={cn("rounded-full px-2 py-1.5 text-center text-[8.5px] font-extrabold leading-3",tones[b.tone])}>
                  {b.status}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-black/27">
          <Clock3 className="size-3.5" />
          Свободные окна будут рассчитываться из реального графика
        </div>
      </section>
    </>
  );
}
