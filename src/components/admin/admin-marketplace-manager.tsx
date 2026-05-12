"use client";

import { ImagePlus, Save, ShoppingBag, Trash2 } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
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

export function AdminMarketplaceManager() {
  const [lots, setLots] = useState<MarketplaceAccount[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [level, setLevel] = useState("");
  const [legendaryCount, setLegendaryCount] = useState("");
  const [voidCount, setVoidCount] = useState("");
  const [power, setPower] = useState("");
  const [heroes, setHeroes] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const lotsQuery = query(collection(db, collections.marketplaceAccounts), orderBy("createdAt", "desc"), limit(20));

    return onSnapshot(lotsQuery, (snapshot) => {
      setLots(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<MarketplaceAccount, "id">) })));
    });
  }, []);

  async function createLot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const uploaded = screenshot ? await uploadMarketplaceImage(screenshot) : null;

      await addDoc(collection(db, collections.marketplaceAccounts), {
        title: title.trim(),
        price: Number(price) || 0,
        level: Number(level) || 1,
        legendaryCount: Number(legendaryCount) || 0,
        voidCount: Number(voidCount) || 0,
        power: Number(power) || 0,
        heroes: listFromText(heroes),
        tags: listFromText(tags),
        description: description.trim(),
        status: "available",
        screenshotUrl: uploaded?.secureUrl ?? uploaded?.url ?? "",
        screenshot: uploaded
          ? {
              secureUrl: uploaded.secureUrl,
              url: uploaded.url,
              publicId: uploaded.publicId
            }
          : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setTitle("");
      setPrice("");
      setLevel("");
      setLegendaryCount("");
      setVoidCount("");
      setPower("");
      setHeroes("");
      setTags("");
      setDescription("");
      setScreenshot(null);
      setStatus("Marketplace lot added.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not add marketplace lot.");
    } finally {
      setSaving(false);
    }
  }

  async function removeLot(lotId: string) {
    if (!window.confirm("Delete this marketplace lot?")) {
      return;
    }

    await deleteDoc(doc(db, collections.marketplaceAccounts, lotId));
    setStatus("Marketplace lot deleted.");
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <ShoppingBag className="text-relic" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Marketplace Forge</p>
          <h2 className="text-2xl font-bold text-white">Account lots</h2>
          <p className="mt-1 text-sm text-zinc-500">Admins can publish sale lots with screenshots, filters and descriptions.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={createLot} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Lot title" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <input type="number" value={price} onChange={(event) => setPrice(event.target.value)} required placeholder="Price, RUB" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <input type="number" value={level} onChange={(event) => setLevel(event.target.value)} placeholder="Account level" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <input type="number" value={power} onChange={(event) => setPower(event.target.value)} placeholder="Power" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
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
          <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
            <Save size={16} />
            Add lot
          </button>
          {status ? <p className="rounded-md border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}
        </form>

        <div className="max-h-[580px] space-y-2 overflow-y-auto pr-1">
          {lots.map((lot) => (
            <div key={lot.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{lot.title}</p>
                <p className="truncate text-xs text-zinc-500">
                  {lot.level} lvl / {lot.legendaryCount} legendary / {lot.price} RUB
                </p>
              </div>
              <button type="button" onClick={() => void removeLot(lot.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-blood/30 text-ember hover:bg-blood/15">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {lots.length === 0 ? <p className="text-sm text-zinc-500">No marketplace lots yet.</p> : null}
        </div>
      </div>
    </GlassPanel>
  );
}
