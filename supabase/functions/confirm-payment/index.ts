// 토스페이먼츠 결제 승인 → 주문 상태를 paid 로 변경
// 클라이언트 금액을 믿지 않고 DB 주문 금액과 대조한 뒤 승인한다.
import { createClient } from "jsr:@supabase/supabase-js@2";

// 토스페이먼츠 공식 문서 테스트 시크릿 키 (실서비스는 TOSS_SECRET_KEY 시크릿 설정)
const TOSS_SECRET_KEY =
  Deno.env.get("TOSS_SECRET_KEY") ?? "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { paymentKey, orderId, amount } = await req.json();
    if (!paymentKey || !orderId || amount == null) {
      return json({ message: "잘못된 요청입니다" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ message: "로그인이 필요합니다" }, 401);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, status, total_price")
      .eq("order_no", orderId)
      .maybeSingle();

    if (!order || order.user_id !== user.id) {
      return json({ message: "주문을 찾을 수 없습니다" }, 404);
    }
    if (order.status !== "pending") {
      return json({ ok: true, orderId: order.id, alreadyConfirmed: true });
    }
    if (order.total_price !== Number(amount)) {
      return json({ message: "결제 금액이 주문 금액과 다릅니다" }, 400);
    }

    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(TOSS_SECRET_KEY + ":"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    });
    const tossBody = await tossRes.json();
    if (!tossRes.ok) {
      return json({ message: tossBody.message ?? "결제 승인에 실패했습니다", code: tossBody.code }, 400);
    }

    const { error } = await admin.rpc("mark_order_paid", {
      p_order_id: order.id,
      p_payment_key: paymentKey,
    });
    if (error) return json({ message: error.message }, 500);

    return json({ ok: true, orderId: order.id });
  } catch (e) {
    return json({ message: e instanceof Error ? e.message : "서버 오류" }, 500);
  }
});
