// products.json → seed.sql 생성: node supabase/seed/build-seed.mjs
import { readFileSync, writeFileSync } from "node:fs";

const dir = new URL(".", import.meta.url);
const products = JSON.parse(readFileSync(new URL("products.json", dir), "utf8"));
const q = (s) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);

const categories = [
  ["boards", "개발보드", 1],
  ["sensors", "센서", 2],
  ["modules", "모듈", 3],
  ["parts", "부품", 4],
  ["kits", "키트", 5],
  ["tools", "공구", 6],
];

let sql = "-- 자동 생성 파일: build-seed.mjs\n";
sql += "insert into public.categories (slug, name, sort_order) values\n";
sql += categories.map(([s, n, o]) => `  (${q(s)}, ${q(n)}, ${o})`).join(",\n");
sql += "\non conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;\n\n";

sql += "insert into public.products (category_id, slug, name, summary, price, stock, specs, image, devicemart_url)\nselect c.id, v.slug, v.name, v.summary, v.price, v.stock, v.specs::jsonb, v.image, v.devicemart_url\nfrom (values\n";
sql += products
  .map(
    (p) =>
      `  (${q(p.category)}, ${q(p.slug)}, ${q(p.name)}, ${q(p.summary)}, ${p.price}, ${p.stock}, ${q(JSON.stringify(p.specs))}, ${q(p.image)}, ${q(p.devicemart_url)})`,
  )
  .join(",\n");
sql += "\n) as v(category, slug, name, summary, price, stock, specs, image, devicemart_url)\njoin public.categories c on c.slug = v.category\n";
sql += "on conflict (slug) do update set\n  category_id = excluded.category_id, name = excluded.name, summary = excluded.summary,\n  price = excluded.price, specs = excluded.specs, image = excluded.image, devicemart_url = excluded.devicemart_url;\n";

writeFileSync(new URL("seed.sql", dir), sql);
console.log(`seed.sql: ${categories.length} categories, ${products.length} products`);
