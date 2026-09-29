import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CirclePlus,
  Scissors,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";

const appointments = [
  { time: "10:00", client: "Dana Sadykova", service: "Стрижка + укладка", specialist: "Aruzhan", status: "Подтверждено", tone: "success" },
  { time: "11:30", client: "Alina Karimova", service: "Окрашивание", specialist: "Madina", status: "В салоне", tone: "accent" },
  { time: "13:00", client: "Nursultan A.", service: "Haircut + beard", specialist: "Timur", status: "Подтверждено", tone: "success" },
  { time: "15:30", client: "Kamila R.", service: "Маникюр", specialist: "Aigerim", status: "Нужно подтвердить", tone: "warning" },
];

const quickLinks = [
  { href: "/appointments", icon: CalendarDays, label: "Календарь" },
  { href: "/clients", icon: UsersRound, label: "Клиенты" },
  { href: "/services", icon: Scissors, label: "Услуги" },
] as const;

const toneClass: Record<string, string> = {
  success: "bg-[#e5f0e8] text-[#3f7159]",
  accent: "bg-[#eee5d5] text-[#866735]",
  warning: "bg-[#f5ead9] text-[#966629]",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeading
        eyebrow="Сегодня · 29 сентября"
        title="Добрый день, Aruzhan"
        description="Коротко о салоне: деньги, загрузка и ближайшие гости."
        action={
          <Link
            href="/appointments"
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-[14px] bg-[#191a17] px-4 text-[12px] font-extrabold text-white shadow-[0_12px_26px_rgba(25,26,23,.16)]"
          >
            <CirclePlus className="size-4" strokeWidth={2.4} />
            Новая запись
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCard label="Выручка сегодня" value="1,24 млн ₸" delta={12.4} note="ко вторнику" emphasis />
        <StatCard label="Записей" value="31" delta={6.9} note="сегодня" />
        <StatCard label="Средний чек" value="40 260 ₸" delta={4.1} note="7 дней" />
        <StatCard label="Свободно" value="7 окон" delta={-18} note="сегодня" inverse />
      </section>

      <section className="mt-4 rounded-[22px] border border-[#d8bf95]/55 bg-[linear-gradient(135deg,#f2e6d3,#fbf7ef)] p-4 shadow-[0_12px_32px_rgba(90,68,36,.06)]">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[#191a17] text-[#ead6b5]">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-extrabold">Требует внимания</div>
            <div className="mt-1 text-[12px] font-semibold leading-5 text-black/51">
              2 записи ещё не подтверждены. Ближайшая — Kamila в 15:30.
            </div>
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-black/30" />
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-extrabold tracking-[-.025em]">Ближайшие записи</h2>
            <p className="mt-0.5 text-[11px] font-semibold text-black/35">Следующие гости сегодня</p>
          </div>
          <Link href="/appointments" className="flex items-center gap-1 text-[11px] font-extrabold text-[#8f7040]">
            Все <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {appointments.map((a) => (
            <div key={a.time} className="panel-strong flex items-center gap-3 rounded-[19px] p-3.5">
              <div className="grid min-w-[55px] place-items-center rounded-[14px] bg-[#f0ebe2] px-2 py-3">
                <div className="metric text-[15px] font-extrabold">{a.time}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-extrabold">{a.client}</div>
                <div className="mt-1 flex items-center gap-1.5 truncate text-[10px] font-semibold text-black/40">
                  <Scissors className="size-3 shrink-0" />
                  <span className="truncate">{a.service}</span>
                  <span>·</span>
                  <span>{a.specialist}</span>
                </div>
              </div>
              <div className={`max-w-[92px] rounded-full px-2 py-1 text-center text-[9px] font-extrabold leading-3 ${toneClass[a.tone]}`}>
                {a.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-[1.2fr_.8fr]">
        <div className="panel rounded-[22px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-extrabold">Выручка · 7 дней</div>
              <div className="mt-0.5 text-[10px] font-semibold text-black/34">Динамика по дням</div>
            </div>
            <WalletCards className="size-4 text-black/28" />
          </div>
          <div className="metric mt-4 text-[26px] font-extrabold">8,42 млн ₸</div>
          <div className="mt-5 flex h-28 items-end gap-2">
            {[42,56,49,70,78,91,66].map((v,i)=>(
              <div key={i} className="flex h-full flex-1 items-end">
                <div className="w-full rounded-t-[7px] bg-[#b29260]" style={{height:`${v}%`, opacity:.42 + i*.07}} />
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 text-center text-[9px] font-bold text-black/27">
            {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d=><span key={d}>{d}</span>)}
          </div>
        </div>

        <div className="panel rounded-[22px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-extrabold">Команда</div>
              <div className="mt-0.5 text-[10px] font-semibold text-black/34">Загрузка сегодня</div>
            </div>
            <UsersRound className="size-4 text-black/28" />
          </div>
          <div className="mt-4 space-y-3.5">
            {[
              ["Aruzhan","Барбер",92],
              ["Madina","Колорист",81],
              ["Timur","Барбер",76],
              ["Aigerim","Nail master",68],
            ].map(([name,role,load])=>(
              <div key={String(name)}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[11px] font-extrabold">{name}</span>
                    <span className="ml-1.5 text-[9px] font-semibold text-black/30">{role}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-black/42">{load}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/[.055]">
                  <div className="h-full rounded-full bg-[#252620]" style={{width:`${load}%`}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-3 gap-2.5">
        {quickLinks.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="panel flex min-h-[82px] flex-col justify-between rounded-[18px] p-3">
            <Icon className="size-[18px] text-[#8d7044]" strokeWidth={2.2} />
            <div className="text-[11px] font-extrabold">{label}</div>
          </Link>
        ))}
      </section>
    </>
  );
}
