"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProduct } from "@/lib/actions/admin";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/types";

type Props = { categories: Category[]; product?: Product };

export default function ProductForm({ categories, product }: Props) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const [image, setImage] = useState(product?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const specsText = Object.entries(product?.specs ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
    if (error) {
      setUploadError(error.message);
    } else {
      setImage(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image" value={image} />

      <div className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">상품명</label>
            <input id="name" name="name" required defaultValue={product?.name} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="slug">슬러그 (URL)</label>
            <input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              defaultValue={product?.slug}
              placeholder="arduino-uno-r3"
              className="input"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="category_id">카테고리</label>
            <select id="category_id" name="category_id" defaultValue={product?.category_id} className="input">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="price">가격 (원)</label>
            <input id="price" name="price" type="number" min={0} required defaultValue={product?.price} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="stock">재고</label>
            <input id="stock" name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="summary">한 줄 요약</label>
          <input id="summary" name="summary" defaultValue={product?.summary ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="specs">사양 (한 줄에 &quot;항목: 값&quot;)</label>
          <textarea id="specs" name="specs" rows={4} defaultValue={specsText} className="input font-mono" />
        </div>
        <div>
          <label className="label" htmlFor="description">상세 설명</label>
          <textarea id="description" name="description" rows={5} defaultValue={product?.description ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="devicemart_url">참고 링크 (디바이스마트)</label>
          <input id="devicemart_url" name="devicemart_url" type="url" defaultValue={product?.devicemart_url ?? ""} className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
          판매중 (체크 해제 시 쇼핑몰에서 숨김)
        </label>
      </div>

      <aside className="space-y-4">
        <div className="card space-y-3 p-5">
          <p className="text-sm font-medium">상품 이미지</p>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
            {image && <Image src={image} alt="" fill sizes="300px" className="object-cover" />}
          </div>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
          {uploading && <p className="text-xs text-zinc-500">업로드 중...</p>}
          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        </div>
        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1" disabled={pending || uploading}>
            {pending ? "저장 중..." : "저장"}
          </button>
          <Link href="/admin/products" className="btn-outline">
            취소
          </Link>
        </div>
      </aside>
    </form>
  );
}
