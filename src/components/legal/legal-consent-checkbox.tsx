"use client";

import Link from "next/link";
import { useId } from "react";
import { useLanguage } from "@/lib/i18n/use-language";

type ConsentKind = "registration" | "request" | "review";

type LegalConsentCheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  kind: ConsentKind;
  onChange: (checked: boolean) => void;
};

const copy = {
  ru: {
    registration: "Я принимаю пользовательское соглашение и даю согласие на обработку персональных данных.",
    request: "Я согласен на обработку данных заявки, переписку с менеджером и хранение прикрепленных файлов для выполнения заказа.",
    review: "Я согласен на публикацию отзыва и обработку данных, указанных в отзыве.",
    terms: "соглашение",
    privacy: "политика конфиденциальности",
    consent: "согласие",
    prefix: "Подробнее:"
  },
  en: {
    registration: "I accept the user agreement and consent to personal data processing.",
    request: "I consent to request data processing, manager communication and storage of attached files to complete the order.",
    review: "I consent to publishing this review and processing the data included in it.",
    terms: "terms",
    privacy: "privacy policy",
    consent: "consent",
    prefix: "Details:"
  }
};

export function LegalConsentCheckbox({ checked, disabled, kind, onChange }: LegalConsentCheckboxProps) {
  const id = useId();
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <label
      htmlFor={id}
      className="legal-consent-checkbox flex cursor-pointer items-start gap-3 rounded-2xl border border-relic/18 bg-black/18 p-3 text-sm leading-6 text-zinc-300 transition hover:border-relic/35"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="legal-consent-input mt-1 h-4 w-4 rounded border-relic/40 bg-black/40 text-relic accent-[#2f7cff] focus:ring-relic disabled:cursor-not-allowed disabled:opacity-60"
        required
      />
      <span className="min-w-0">
        <span className="block text-zinc-100">{t[kind]}</span>
        <span className="mt-1 block text-xs text-zinc-500">
          {t.prefix}{" "}
          <Link href="/terms" target="_blank" className="text-relic underline-offset-4 transition hover:underline">
            {t.terms}
          </Link>
          {", "}
          <Link href="/privacy" target="_blank" className="text-relic underline-offset-4 transition hover:underline">
            {t.privacy}
          </Link>
          {", "}
          <Link href="/consent" target="_blank" className="text-relic underline-offset-4 transition hover:underline">
            {t.consent}
          </Link>
          .
        </span>
      </span>
    </label>
  );
}
