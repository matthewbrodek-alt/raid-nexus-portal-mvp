"use client";

import { ImagePlus, Pencil, Save, Trash2, WalletCards, X } from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { type FormEvent, useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import {
  getDonationOfferImageUrl,
  normalizeDonationOffer,
  type DonationOffer
} from "@/lib/donation/offers";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

async function uploadDonationOfferImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "offers");
  formData.append("publicId", `donation/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`);

  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить картинку предложения.");
  }

  return (await response.json()) as CloudinaryAsset;
}

export function AdminDonationOfferManager() {
  const [offers, setOffers] = useState<DonationOffer[]>([]);
  const [editingId, setEditingId] = useState("");
  const [ru, setRu] = useState("");
  const [en, setEn] = useState("");
  const [tag, setTag] = useState("offer");
  const [comment, setComment] = useState("");
  const [priceRub, setPriceRub] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const offersQuery = query(collection(db, collections.donationOffers), orderBy("createdAt", "desc"), limit(40));

    return onSnapshot(offersQuery, (snapshot) => {
      setOffers(snapshot.docs.map((item) => normalizeDonationOffer(item.id, item.data())));
    });
  }, []);

  function resetForm() {
    setEditingId("");
    setRu("");
    setEn("");
    setTag("offer");
    setComment("");
    setPriceRub("");
    setImageFile(null);
  }

  function startEdit(offer: DonationOffer) {
    setEditingId(offer.id);
    setRu(offer.ru);
    setEn(offer.en);
    setTag(offer.tag);
    setComment(offer.comment ?? "");
    setPriceRub(String(offer.priceRub || ""));
    setImageFile(null);
    setStatus("");
  }

  async function saveOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const uploaded = imageFile ? await uploadDonationOfferImage(imageFile) : null;
      const imagePayload = uploaded
        ? {
            publicId: uploaded.publicId,
            secureUrl: uploaded.secureUrl,
            url: uploaded.url,
            width: uploaded.width,
            height: uploaded.height,
            format: uploaded.format
          }
        : null;
      const basePayload = {
        ru: ru.trim(),
        en: en.trim() || ru.trim(),
        tag: tag.trim() || "offer",
        comment: comment.trim(),
        description: comment.trim(),
        priceRub: Number(priceRub) || 0,
        status: "published",
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, collections.donationOffers, editingId), {
          ...basePayload,
          ...(imagePayload
            ? {
                image: imagePayload,
                imageUrl: imagePayload.secureUrl
              }
            : {})
        });
        setStatus("Предложение обновлено.");
      } else {
        await addDoc(collection(db, collections.donationOffers), {
          ...basePayload,
          image: imagePayload,
          imageUrl: imagePayload?.secureUrl ?? "",
          createdAt: serverTimestamp()
        });
        setStatus("Предложение добавлено.");
      }

      resetForm();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось сохранить предложение.");
    } finally {
      setSaving(false);
    }
  }

  async function removeOffer(offerId: string) {
    if (!window.confirm("Удалить это донат-предложение?")) {
      return;
    }

    await deleteDoc(doc(db, collections.donationOffers, offerId));
    setStatus("Предложение удалено.");
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <WalletCards className="text-relic" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Donation Forge</p>
          <h2 className="text-2xl font-bold text-white">Донат-предложения</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Добавление, изменение и удаление предложений во вкладке доната.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={saveOffer} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={ru}
              onChange={(event) => setRu(event.target.value)}
              required
              placeholder="Название RU"
              className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <input
              value={en}
              onChange={(event) => setEn(event.target.value)}
              placeholder="Название EN"
              className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <input
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              placeholder="Тег: best start, premium..."
              className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <input
              type="number"
              min="0"
              value={priceRub}
              onChange={(event) => setPriceRub(event.target.value)}
              required
              placeholder="Цена от, RUB"
              className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            placeholder="Комментарий или краткое описание"
            className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-black/25 p-3 text-sm text-zinc-300 hover:text-white">
            <ImagePlus size={17} className="text-relic" />
            {imageFile ? imageFile.name : "Картинка предложения"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60"
            >
              <Save size={16} />
              {editingId ? "Сохранить изменения" : "Добавить предложение"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 hover:text-white"
              >
                <X size={16} />
                Отмена
              </button>
            ) : null}
          </div>
          {status ? <p className="rounded-md border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}
        </form>

        <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
          {offers.map((offer) => {
            const imageUrl = getDonationOfferImageUrl(offer);

            return (
              <div
                key={offer.id}
                className="group relative min-h-[174px] overflow-hidden rounded-[18px] border border-[#223348] bg-[#07101a] p-4"
              >
                <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,14,24,0.96),rgba(7,18,33,0.9))]" />
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
                ) : null}
                <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,10,17,0.94),rgba(5,10,17,0.58)_55%,rgba(5,10,17,0.2))]" />
                <div className="relative z-10 flex h-full min-h-[138px] flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-relic">{offer.tag}</p>
                    <h3 className="mt-2 max-w-[78%] text-xl font-black text-white">{offer.ru}</h3>
                    {offer.comment ? <p className="mt-1 max-w-[72%] text-sm text-zinc-300">{offer.comment}</p> : null}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="rounded-md border border-relic/25 bg-black/45 px-3 py-2 text-sm font-bold text-relic">
                      от {offer.priceRub.toLocaleString("ru-RU")} ₽
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(offer)}
                        className="grid h-9 w-9 place-items-center rounded-md border border-relic/30 text-relic hover:bg-relic/10"
                        aria-label="Редактировать предложение"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeOffer(offer.id)}
                        className="grid h-9 w-9 place-items-center rounded-md border border-blood/30 text-ember hover:bg-blood/15"
                        aria-label="Удалить предложение"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {offers.length === 0 ? <p className="text-sm text-zinc-500">Донат-предложений пока нет.</p> : null}
        </div>
      </div>
    </GlassPanel>
  );
}
