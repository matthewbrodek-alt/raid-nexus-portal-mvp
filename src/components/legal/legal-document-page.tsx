"use client";

import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

type LegalDocumentKind = "privacy" | "terms" | "consent" | "cookies";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalDocument = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

const documents: Record<LegalDocumentKind, Record<Language, LegalDocument>> = {
  privacy: {
    ru: {
      eyebrow: "Документы",
      title: "Политика конфиденциальности",
      description: "Как Bumpy Pay собирает, использует и защищает данные пользователей портала.",
      updatedAt: "17 июня 2026",
      sections: [
        {
          title: "1. Кто обрабатывает данные",
          paragraphs: [
            "Настоящая политика описывает обработку персональных данных пользователей портала Bumpy Pay / Raid Portal. До публикации на продакшене владельцу проекта нужно вписать юридическое лицо или ИП, ИНН/ОГРН, адрес и контакт для обращений.",
            "Если проект работает с пользователями из России, владелец сайта выступает оператором персональных данных и должен соблюдать требования 152-ФЗ."
          ]
        },
        {
          title: "2. Какие данные мы можем получать",
          paragraphs: [
            "Аккаунт: email, никнейм, UID аккаунта, выбранные аватары, рамки, статус BP, настройки темы и языка.",
            "Заявки: выбранная услуга, комментарий клиента, прикрепленные изображения, история статусов, переписка с менеджером, суммы начисления или списания Bumpy Coins.",
            "Публичные материалы: отзывы, сообщения в общих чатах, объявления кланов и загруженные пользователем изображения.",
            "Технические данные: IP-адрес, сведения о браузере, cookie/localStorage, события авторизации и технические журналы безопасности."
          ]
        },
        {
          title: "3. Зачем нужны данные",
          paragraphs: [
            "Данные используются для регистрации, входа в личный кабинет, обработки заявок, связи с менеджером, начисления Bumpy Coins, поддержки чатов, отзывов, розыгрышей и защиты сервиса от злоупотреблений.",
            "Мы не просим и не храним платежные данные банковских карт. Если платеж проходит через сторонний сервис, он обрабатывает платежные данные по своим правилам."
          ]
        },
        {
          title: "4. Где могут храниться данные",
          paragraphs: [
            "Техническая инфраструктура проекта может использовать Firebase, Vercel, Cloudinary и другие сервисы. Часть сервисов может находиться за пределами России.",
            "Перед полноценным запуском для граждан РФ нужно отдельно проверить требования локализации персональных данных и трансграничной передачи, а также при необходимости подать уведомление в Роскомнадзор."
          ]
        },
        {
          title: "5. Сроки хранения",
          paragraphs: [
            "Данные аккаунта хранятся, пока аккаунт активен. Заявки, переписка и финансовая история Bumpy Coins могут храниться дольше для учета, поддержки и защиты интересов пользователей.",
            "Пользователь может запросить удаление или уточнение данных через контакт оператора. Некоторые данные могут сохраняться, если это требуется законом или необходимо для разрешения споров."
          ]
        },
        {
          title: "6. Права пользователя",
          paragraphs: [
            "Пользователь может запросить сведения об обработке данных, исправление, блокировку, удаление или отзыв согласия, если это не противоречит закону и обязательствам сервиса.",
            "Для обращения используйте контакт владельца проекта. До публикации нужно указать рабочий email поддержки."
          ]
        }
      ]
    },
    en: {
      eyebrow: "Legal",
      title: "Privacy Policy",
      description: "How Bumpy Pay collects, uses and protects portal user data.",
      updatedAt: "June 17, 2026",
      sections: [
        { title: "1. Data controller", paragraphs: ["This policy describes personal data processing for Bumpy Pay / Raid Portal. Before production launch, add the legal entity or individual entrepreneur details and support contact."] },
        { title: "2. Data we process", paragraphs: ["Account data, requests, manager messages, uploaded images, reviews, chat content, Bumpy Coins operations and technical security data may be processed."] },
        { title: "3. Purposes", paragraphs: ["Data is used for account access, order processing, manager communication, Bumpy Coins, chats, reviews, giveaways and service security."] },
        { title: "4. Infrastructure", paragraphs: ["The project may use Firebase, Vercel, Cloudinary and similar providers. Some processing may occur outside Russia and should be legally reviewed before launch."] },
        { title: "5. Retention", paragraphs: ["Account data is kept while the account exists. Requests, messages and Bumpy Coins history may be retained for support, accounting and dispute resolution."] },
        { title: "6. User rights", paragraphs: ["Users may request access, correction, restriction, deletion or consent withdrawal where applicable by contacting the project owner."] }
      ]
    }
  },
  terms: {
    ru: {
      eyebrow: "Документы",
      title: "Пользовательское соглашение",
      description: "Основные правила использования портала Bumpy Pay.",
      updatedAt: "17 июня 2026",
      sections: [
        { title: "1. Назначение сервиса", paragraphs: ["Bumpy Pay предоставляет информационный портал, личный кабинет, витрину услуг, заявки, чаты, отзывы, розыгрыши и инструменты для пользователей Raid: Shadow Legends.", "Сервис не является официальным продуктом Plarium и не должен вводить пользователя в заблуждение относительно связи с правообладателем игры."] },
        { title: "2. Аккаунт пользователя", paragraphs: ["Пользователь отвечает за актуальность email, никнейма и материалов, которые он загружает на сайт.", "Запрещено публиковать чужие персональные данные, вредоносные ссылки, спам, мошеннические предложения и материалы, нарушающие закон или права третьих лиц."] },
        { title: "3. Заявки и Bumpy Coins", paragraphs: ["Заявка фиксирует обращение к менеджеру. Итоговая сумма, условия выполнения, начисление и списание Bumpy Coins подтверждаются менеджером в панели заявки.", "1 Bumpy Coin может использоваться как 1 рубль скидки, но применение скидки зависит от условий конкретного заказа и доступного лимита."] },
        { title: "4. Контент пользователей", paragraphs: ["Сообщения в общих чатах, отзывы, объявления кланов и публичные материалы могут быть видны другим пользователям.", "Администрация может скрывать, удалять или ограничивать контент, если он нарушает правила сервиса или мешает работе портала."] },
        { title: "5. Ответственность", paragraphs: ["Сервис предоставляется в формате MVP и может меняться. Администрация старается сохранять доступность и корректность данных, но не гарантирует отсутствие технических ошибок.", "Финальные коммерческие условия заказа подтверждаются менеджером до выполнения."] }
      ]
    },
    en: {
      eyebrow: "Legal",
      title: "Terms of Use",
      description: "Basic rules for using the Bumpy Pay portal.",
      updatedAt: "June 17, 2026",
      sections: [
        { title: "1. Service purpose", paragraphs: ["Bumpy Pay provides a portal, dashboard, service showcase, requests, chats, reviews, giveaways and tools for Raid: Shadow Legends users."] },
        { title: "2. Account", paragraphs: ["Users are responsible for their account data and uploaded materials. Spam, fraud, harmful links and illegal content are prohibited."] },
        { title: "3. Requests and Bumpy Coins", paragraphs: ["A request is handled by a manager. Final amount, completion terms, Bumpy Coins accrual and write-off are confirmed by the manager."] },
        { title: "4. User content", paragraphs: ["Public chats, reviews and clan posts may be visible to other users and can be moderated by admins."] },
        { title: "5. Liability", paragraphs: ["The service is an MVP and may change. Final commercial terms are confirmed by the manager before execution."] }
      ]
    }
  },
  consent: {
    ru: {
      eyebrow: "Документы",
      title: "Согласие на обработку персональных данных",
      description: "Текст согласия, которое пользователь дает при регистрации и отправке заявок.",
      updatedAt: "17 июня 2026",
      sections: [
        { title: "1. Состав данных", paragraphs: ["Пользователь дает согласие на обработку email, никнейма, UID, данных профиля, заявок, переписки, загруженных файлов, отзывов, статусов заказов, истории Bumpy Coins и технических данных, необходимых для работы сервиса."] },
        { title: "2. Действия с данными", paragraphs: ["Согласие распространяется на сбор, запись, систематизацию, хранение, уточнение, использование, передачу внутри команды сервиса, обезличивание, блокирование, удаление и уничтожение данных."] },
        { title: "3. Цели обработки", paragraphs: ["Цели обработки: регистрация, авторизация, выполнение заявок, связь с менеджером, начисление и списание Bumpy Coins, публикация отзывов по желанию пользователя, участие в розыгрышах, безопасность и поддержка сервиса."] },
        { title: "4. Срок действия", paragraphs: ["Согласие действует до его отзыва пользователем или до прекращения обработки по основаниям, предусмотренным законом.", "Отзыв согласия может ограничить доступ к функциям, для которых обработка данных обязательна."] },
        { title: "5. Важно перед запуском", paragraphs: ["Этот текст является рабочей заготовкой для MVP. Перед коммерческим запуском юрист должен привести документ к данным конкретного оператора и фактической инфраструктуре."] }
      ]
    },
    en: {
      eyebrow: "Legal",
      title: "Personal Data Processing Consent",
      description: "Consent text used during registration and request submission.",
      updatedAt: "June 17, 2026",
      sections: [
        { title: "1. Data scope", paragraphs: ["The user consents to processing account, profile, request, message, uploaded file, review, order status, Bumpy Coins and technical service data."] },
        { title: "2. Processing actions", paragraphs: ["Processing may include collection, recording, storage, update, use, internal transfer, depersonalization, blocking, deletion and destruction."] },
        { title: "3. Purposes", paragraphs: ["Purposes include registration, requests, manager communication, Bumpy Coins, optional reviews, giveaways, security and support."] },
        { title: "4. Validity", paragraphs: ["Consent is valid until withdrawn or until processing ends according to applicable law."] }
      ]
    }
  },
  cookies: {
    ru: {
      eyebrow: "Документы",
      title: "Cookie и локальное хранение",
      description: "Как сайт использует cookie, localStorage и похожие технологии.",
      updatedAt: "17 июня 2026",
      sections: [
        { title: "1. Что используется", paragraphs: ["Сайт может использовать cookie, localStorage и sessionStorage для авторизации, выбранной темы, языка, уведомлений, скрытых плашек и технической стабильности интерфейса."] },
        { title: "2. Для чего это нужно", paragraphs: ["Эти данные помогают сохранять вход, тему Light/Dark, выбранный язык, состояние уведомлений, прогресс интерфейса и защиту от повторной отправки форм."] },
        { title: "3. Как управлять", paragraphs: ["Пользователь может очистить cookie и localStorage в настройках браузера. После очистки часть настроек сайта сбросится, а вход может потребоваться выполнить заново."] }
      ]
    },
    en: {
      eyebrow: "Legal",
      title: "Cookies and Local Storage",
      description: "How the site uses cookies, localStorage and similar technologies.",
      updatedAt: "June 17, 2026",
      sections: [
        { title: "1. Technologies", paragraphs: ["The site may use cookies, localStorage and sessionStorage for auth, theme, language, notifications and UI stability."] },
        { title: "2. Purposes", paragraphs: ["These technologies keep the selected theme, language, notification state and help prevent duplicate form submissions."] },
        { title: "3. Controls", paragraphs: ["Users can clear cookies and local storage in browser settings. Some preferences may reset afterwards."] }
      ]
    }
  }
};

export function LegalDocumentPage({ kind }: { kind: LegalDocumentKind }) {
  const { language, isRu } = useLanguage();
  const document = documents[kind][language];

  return (
    <PageShell eyebrow={document.eyebrow} title={document.title} description={document.description}>
      <article className="raid-ornate-panel max-w-4xl space-y-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-relic/14 pb-4">
          <p className="text-sm text-zinc-400">
            {isRu ? "Дата обновления" : "Updated"}: <span className="font-bold text-relic">{document.updatedAt}</span>
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <Link href="/privacy" className="rounded-full border border-relic/20 px-3 py-1.5 text-relic transition hover:border-relic">
              {isRu ? "Конфиденциальность" : "Privacy"}
            </Link>
            <Link href="/terms" className="rounded-full border border-relic/20 px-3 py-1.5 text-relic transition hover:border-relic">
              {isRu ? "Соглашение" : "Terms"}
            </Link>
            <Link href="/consent" className="rounded-full border border-relic/20 px-3 py-1.5 text-relic transition hover:border-relic">
              {isRu ? "Согласие" : "Consent"}
            </Link>
            <Link href="/cookies" className="rounded-full border border-relic/20 px-3 py-1.5 text-relic transition hover:border-relic">
              Cookie
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-zinc-200">
          {isRu
            ? "Это рабочая редакция документов для MVP. Перед публичным коммерческим запуском нужно заменить реквизиты оператора и отдать документы юристу на финальную проверку."
            : "This is an MVP working draft. Before commercial launch, replace operator details and have the documents reviewed by a lawyer."}
        </div>

        {document.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-bold text-white">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-zinc-300">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </PageShell>
  );
}
