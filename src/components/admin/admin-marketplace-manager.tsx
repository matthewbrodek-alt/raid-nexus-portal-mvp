"use client";

import { ImagePlus, Pencil, Save, ShoppingBag, Trash2, X } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import type { MarketplaceAccount } from "@/lib/types";

async function uploadMarketplaceImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "marketplace");
  formData.append("publicId", `accounts/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`);

  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Could not upload marketplace screenshot.");
  }

  return (await response.json()) as CloudinaryAsset;
}

function listFromText(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function categoryTitle(category: MarketplaceAccount["category"]) {
  if (category === "progressed") {
    return "Прокаченный аккаунт";
  }

  if (category === "shards") {
    return "Аккаунт с осколками";
  }

  return "Стартовый аккаунт";
}

function statusTitle(status: MarketplaceAccount["status"]) {
  if (status === "reserved") {
    return "В резерве";
  }

  if (status === "sold") {
    return "Продан";
  }

  return "В наличии";
}

export function AdminMarketplaceManager() {
  const [lots, setLots] = useState<MarketplaceAccount[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MarketplaceAccount["category"]>("starter");
  const [price, setPrice] = useState("");
  const [level, setLevel] = useState("");
  const [mythicCount, setMythicCount] = useState("");
  const [legendaryCount, setLegendaryCount] = useState("");
  const [voidCount, setVoidCount] = useState("");
  const [power, setPower] = useState("");
  const [heroes, setHeroes] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [galleryScreenshots, setGalleryScreenshots] = useState<FileList | null>(null);
  const [lotStatus, setLotStatus] = useState<NonNullable<MarketplaceAccount["status"]>>("available");
  const [editingLot, setEditingLot] = useState<MarketplaceAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const lotsQuery = query(collection(db, collections.marketplaceAccounts), orderBy("createdAt", "desc"), limit(80));

    return onSnapshot(lotsQuery, (snapshot) => {
      setLots(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<MarketplaceAccount, "id">) })));
    });
  }, []);

  function resetForm() {
    setTitle("");
    setCategory("starter");
    setPrice("");
    setLevel("");
    setMythicCount("");
    setLegendaryCount("");
    setVoidCount("");
    setPower("");
    setHeroes("");
    setTags("");
    setDescription("");
    setScreenshot(null);
    setGalleryScreenshots(null);
    setLotStatus("available");
    setEditingLot(null);
  }

  function startEdit(lot: MarketplaceAccount) {
    setEditingLot(lot);
    setTitle(lot.title ?? "");
    setCategory(lot.category ?? "starter");
    setPrice(String(lot.price ?? ""));
    setLevel(String(lot.level ?? ""));
    setMythicCount(String(lot.mythicCount ?? ""));
    setLegendaryCount(String(lot.legendaryCount ?? ""));
    setVoidCount(String(lot.voidCount ?? ""));
    setPower(String(lot.power ?? ""));
    setHeroes((lot.heroes ?? []).join(", "));
    setTags((lot.tags ?? []).join(", "));
    setDescription(lot.description ?? "");
    setScreenshot(null);
    setGalleryScreenshots(null);
    setLotStatus(lot.status ?? "available");
    setStatus("");
  }

  async function saveLot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const uploaded = screenshot ? await uploadMarketplaceImage(screenshot) : null;
      const galleryFiles = Array.from(galleryScreenshots ?? []).slice(0, 5);
      const galleryAssets = await Promise.all(galleryFiles.map((file) => uploadMarketplaceImage(file)));
      const existingGalleryUrls = editingLot?.galleryUrls ?? [];
      const uploadedGalleryUrls = galleryAssets.map((asset) => asset.secureUrl ?? asset.url).filter(Boolean);
      const nextGalleryUrls = [...existingGalleryUrls, ...uploadedGalleryUrls].slice(0, 5);

      const payload: Record<string, unknown> = {
        title: title.trim(),
        category: category ?? "starter",
        price: Number(price) || 0,
        level: Number(level) || 1,
        mythicCount: Number(mythicCount) || 0,
        legendaryCount: Number(legendaryCount) || 0,
        voidCount: Number(voidCount) || 0,
        power: Number(power) || 0,
        heroes: listFromText(heroes),
        tags: listFromText(tags),
        description: description.trim(),
        status: lotStatus,
        updatedAt: serverTimestamp()
      };

      if (uploaded) {
        payload.screenshotUrl = uploaded.secureUrl ?? uploaded.url ?? "";
        payload.screenshot = {
          secureUrl: uploaded.secureUrl,
          url: uploaded.url,
          publicId: uploaded.publicId
        };
      }

      if (!editingLot || galleryAssets.length > 0) {
        payload.gallery = galleryAssets.map((asset, index) => ({
          secureUrl: asset.secureUrl,
          url: asset.url,
          publicId: asset.publicId,
          sortOrder: existingGalleryUrls.length + index + 1
        }));
        payload.galleryUrls = nextGalleryUrls;
      }

      if (editingLot) {
        await updateDoc(doc(db, collections.marketplaceAccounts, editingLot.id), payload);
        setStatus("Marketplace lot updated.");
      } else {
        await addDoc(collection(db, collections.marketplaceAccounts), {
          ...payload,
          screenshotUrl: uploaded?.secureUrl ?? uploaded?.url ?? "",
          screenshot: uploaded
            ? {
                secureUrl: uploaded.secureUrl,
                url: uploaded.url,
                publicId: uploaded.publicId
              }
            : null,
          gallery: galleryAssets.map((asset, index) => ({
            secureUrl: asset.secureUrl,
            url: asset.url,
            publicId: asset.publicId,
            sortOrder: index + 1
          })),
          galleryUrls: uploadedGalleryUrls,
          createdAt: serverTimestamp()
        });
        setStatus("Marketplace lot added.");
      }

      resetForm();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save marketplace lot.");
    } finally {
      setSaving(false);
    }
  }

  async function removeLot(lotId: string) {
    if (!window.confirm("Delete this marketplace lot?")) {
      return;
    }

    await deleteDoc(doc(db, collections.marketplaceAccounts, lotId));
    if (editingLot?.id === lotId) {
      resetForm();
    }
    setStatus("Marketplace lot deleted.");
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <ShoppingBag className="text-relic" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Account Purchase Forge</p>
          <h2 className="text-2xl font-bold text-white">Покупка аккаунта</h2>
          <p className="mt-1 text-sm text-zinc-500">Админы публикуют лоты со скриншотами, фильтрами и описанием.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={saveLot} className="space-y-3">
          {editingLot ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-relic/25 bg-relic/[0.08] p-3 text-sm text-zinc-300">
              <span>
                Редактирование: <b className="text-white">{editingLot.title}</b>
              </span>
              <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:border-relic/45 hover:text-white">
                <X size={14} />
                Отмена
              </button>
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Lot title" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <select value={category} onChange={(event) => setCategory(event.target.value as MarketplaceAccount["category"])} className="rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
              <option value="starter">Стартовый аккаунт</option>
              <option value="progressed">Прокаченный аккаунт</option>
              <option value="shards">Аккаунт с осколками</option>
            </select>
            <select value={lotStatus} onChange={(event) => setLotStatus(event.target.value as NonNullable<MarketplaceAccount["status"]>)} className="rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic sm:col-span-2">
              <option value="available">В наличии</option>
              <option value="reserved">В резерве</option>
              <option value="sold">Продан</option>
            </select>
            <input type="number" value={price} onChange={(event) => setPrice(event.target.value)} required placeholder="Price, RUB" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <input type="number" value={level} onChange={(event) => setLevel(event.target.value)} placeholder="Account level" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <input type="number" value={power} onChange={(event) => setPower(event.target.value)} placeholder="Power" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <input type="number" value={mythicCount} onChange={(event) => setMythicCount(event.target.value)} placeholder="Mythical count" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <input type="number" value={legendaryCount} onChange={(event) => setLegendaryCount(event.target.value)} placeholder="Legendary count" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <input type="number" value={voidCount} onChange={(event) => setVoidCount(event.target.value)} placeholder="Void count" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
          </div>
          <input value={heroes} onChange={(event) => setHeroes(event.target.value)} placeholder="Key heroes, comma separated" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags, comma separated" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Account description" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-black/25 p-3 text-sm text-zinc-300 hover:text-white">
            <ImagePlus size={17} className="text-relic" />
            {screenshot ? screenshot.name : "Upload main screenshot"}
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setScreenshot(event.target.files?.[0] ?? null)} />
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-black/25 p-3 text-sm text-zinc-300 hover:text-white">
            <ImagePlus size={17} className="text-relic" />
            {galleryScreenshots?.length ? `${Math.min(galleryScreenshots.length, 5)} extra screenshots selected` : "Upload up to 5 extra screenshots"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => setGalleryScreenshots(event.target.files)} />
          </label>
          <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
            <Save size={16} />
            {editingLot ? "Сохранить изменения" : "Добавить лот"}
          </button>
          {status ? <p className="rounded-md border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}
        </form>

        <div className="max-h-[580px] space-y-2 overflow-y-auto pr-1">
          {lots.map((lot) => (
            <div key={lot.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{lot.title}</p>
                <p className="truncate text-xs text-zinc-500">
                  {categoryTitle(lot.category)} / {statusTitle(lot.status)} / {lot.level} lvl / {lot.mythicCount ?? 0} mythical / {lot.legendaryCount} legendary / {lot.voidCount} void / {lot.price} RUB
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => startEdit(lot)} className="grid h-9 w-9 place-items-center rounded-md border border-relic/30 text-relic hover:bg-relic/15" aria-label="Edit marketplace lot">
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => void removeLot(lot.id)} className="grid h-9 w-9 place-items-center rounded-md border border-blood/30 text-ember hover:bg-blood/15" aria-label="Delete marketplace lot">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {lots.length === 0 ? <p className="text-sm text-zinc-500">No marketplace lots yet.</p> : null}
        </div>
      </div>
    </GlassPanel>
  );
}
