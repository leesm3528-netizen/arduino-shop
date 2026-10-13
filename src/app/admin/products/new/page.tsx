import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/types";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">상품 등록</h1>
      <ProductForm categories={(categories ?? []) as Category[]} />
    </div>
  );
}
