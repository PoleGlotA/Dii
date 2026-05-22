import Link from "next/link";
import { HandHeart, Users, Shield, Zap } from "lucide-react";

export const metadata = {
  title: "Про платформу — Дій",
};

const features = [
  {
    icon: <HandHeart className="text-blue-600" size={22} />,
    title: "Знаходь, де потрібна допомога",
    text: "Стрічка об'єднує події, збори та новини в одному місці. Фільтри допоможуть знайти саме те, що тобі по силах.",
  },
  {
    icon: <Users className="text-blue-600" size={22} />,
    title: "Записуйся одним кліком",
    text: "Кнопка «Хочу допомогти» надсилає твою заявку організатору. Статус заявки видно у профілі.",
  },
  {
    icon: <Shield className="text-blue-600" size={22} />,
    title: "Прозорість зборів",
    text: "Прямі посилання на банку Monobank/Privat24, чіткі суми та фото-звіти у коментарях після закриття збору.",
  },
  {
    icon: <Zap className="text-blue-600" size={22} />,
    title: "Спілкування в дії",
    text: "Гілка обговорень під кожним постом і чат учасників після підтвердження заявки.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <section className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">Що таке Дій</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Платформа, на якій волонтери та організатори знаходять одне одного — швидко,
          без зайвої бюрократії та посередників.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              {f.icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{f.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Як долучитися</h2>
        <ol className="space-y-3 text-sm text-gray-700">
          <li>
            <span className="font-semibold text-gray-900">1.</span> Зареєструйся
            у демо-режимі (3 тестові акаунти доступні на сторінці входу).
          </li>
          <li>
            <span className="font-semibold text-gray-900">2.</span> Обери подію
            або збір у стрічці.
          </li>
          <li>
            <span className="font-semibold text-gray-900">3.</span> Натисни
            «Хочу допомогти» або «Підтримати збір».
          </li>
          <li>
            <span className="font-semibold text-gray-900">4.</span> Слідкуй за
            статусом у профілі та спілкуйся в коментарях.
          </li>
        </ol>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Перейти до стрічки
        </Link>
      </section>

      <section className="text-center text-sm text-gray-500 pb-4">
        Маєш ідею, питання чи хочеш стати організатором?{" "}
        <a href="mailto:hello@diivolunteer.ua" className="text-blue-600 underline">
          Напиши нам
        </a>
        .
      </section>
    </div>
  );
}
