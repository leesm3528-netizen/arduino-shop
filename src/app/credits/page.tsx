import type { Metadata } from "next";
import products from "../../../supabase/seed/products.json";

export const metadata: Metadata = { title: "이미지 출처" };

const HERO = [
  {
    name: "메인 배너 1",
    source: "https://commons.wikimedia.org/wiki/File:Multiple_shields_stacked_on_an_Arduino_board.jpg",
    author: "Kushagra Keshari",
    license: "CC BY-SA 4.0",
  },
  {
    name: "메인 배너 2",
    source: "https://commons.wikimedia.org/wiki/File:Electronics_workbench.jpg",
    author: "James Bastow",
    license: "CC BY-SA 2.0",
  },
];

export default function CreditsPage() {
  const rows = [
    ...HERO,
    ...products.map((p) => ({
      name: p.name,
      source: p.image_source,
      author: p.image_author,
      license: p.image_license,
    })),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">이미지 출처 및 라이선스</h1>
      <p className="mt-2 text-sm text-zinc-500">
        이 사이트의 사진은 Wikimedia Commons, Flickr 등에서 자유 라이선스로 공개된 사진입니다. 상품 사진은 대표
        이미지로, 실제 판매 상품과 다를 수 있습니다.
      </p>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">이미지</th>
              <th className="px-4 py-3 font-medium">저작자</th>
              <th className="px-4 py-3 font-medium">라이선스</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="px-4 py-2.5">
                  <a href={r.source} target="_blank" rel="noreferrer" className="hover:underline">
                    {r.name}
                  </a>
                </td>
                <td className="px-4 py-2.5 text-zinc-600">{r.author}</td>
                <td className="px-4 py-2.5 text-zinc-600">{r.license}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
