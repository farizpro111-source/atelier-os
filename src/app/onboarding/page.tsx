import { Scissors } from "lucide-react";
import { OnboardingForm } from "@/components/onboarding-form";

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
          Вы автоматически станете владельцем организации. Затем добавим команду, услуги и реальные записи.
        </p>

        <OnboardingForm />
      </section>

      <p className="fixed bottom-4 inset-x-5 text-center text-[9px] font-bold text-black/25">
        Atelier OS · защищённая Telegram-идентификация
      </p>
    </main>
  );
}
