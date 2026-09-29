import { Building2, Scissors } from "lucide-react";

export default function OnboardingPage() {
  return (
    <main className="app-safe-top app-safe-bottom flex min-h-[100dvh] items-center justify-center px-4 py-8">
      <section className="panel-strong w-full max-w-[470px] rounded-[26px] p-6">
        <div className="grid size-12 place-items-center rounded-[17px] bg-[#191a17] text-[#ead6b5]">
          <Scissors className="size-5" />
        </div>
        <div className="mt-6 text-[10px] font-extrabold uppercase tracking-[.17em] text-[#987846]">
          Первый запуск
        </div>
        <h1 className="mt-2 text-[30px] font-extrabold leading-[1.02] tracking-[-.052em]">
          Создадим ваш салон
        </h1>
        <p className="mt-3 text-[13px] font-semibold leading-5 text-black/45">
          Настройка владельца и первого филиала.
        </p>
        <div className="mt-6 flex items-center gap-3 rounded-[17px] bg-[#f2ece2] p-4">
          <Building2 className="size-5 text-[#8d7044]" />
          <div className="text-[12px] font-bold text-black/55">
            Форма настройки подключается на следующем шаге.
          </div>
        </div>
      </section>
    </main>
  );
}
