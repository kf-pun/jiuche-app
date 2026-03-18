import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ECPAY_HASH_KEY = process.env.ECPAY_HASH_KEY ?? "5294y06JbISpM5x9";
const ECPAY_HASH_IV = process.env.ECPAY_HASH_IV ?? "v77hoKGq4kWxNNIS";

function phpUrlEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/~/g, "%7E")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

function verifyCheckMacValue(params: Record<string, string>): boolean {
  const received = params.CheckMacValue;
  if (!received) return false;
  const { CheckMacValue: _ignored, ...rest } = params;
  const sorted = Object.keys(rest)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}=${rest[k]}`)
    .join("&");
  const raw = `HashKey=${ECPAY_HASH_KEY}&${sorted}&HashIV=${ECPAY_HASH_IV}`;
  const encoded = phpUrlEncode(raw).toLowerCase();
  const computed = createHash("sha256").update(encoded).digest("hex").toUpperCase();
  return computed === received;
}

const plain = (body: string) =>
  new NextResponse(body, { status: 200, headers: { "Content-Type": "text/plain" } });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body).entries());

  if (!verifyCheckMacValue(params)) {
    return plain("0|CheckMacValue error");
  }

  const { RtnCode, MerchantTradeNo } = params;
  if (RtnCode !== "1") {
    // Payment failed — mark transaction as failed
    const service = await createServiceClient();
    await service
      .from("wallet_transactions")
      .update({ status: "failed" })
      .eq("ecpay_trade_no", MerchantTradeNo)
      .eq("status", "pending");
    return plain("0|Payment failed");
  }

  const service = await createServiceClient();

  const { data: tx } = await service
    .from("wallet_transactions")
    .select("id, user_id, amount, status")
    .eq("ecpay_trade_no", MerchantTradeNo)
    .eq("status", "pending")
    .single();

  if (!tx) return plain("0|Transaction not found");

  // Mark completed
  await service
    .from("wallet_transactions")
    .update({ status: "completed" })
    .eq("id", tx.id);

  // Update user balance
  const { data: userRow } = await service
    .from("users")
    .select("balance")
    .eq("id", tx.user_id)
    .single();

  if (userRow) {
    await service
      .from("users")
      .update({ balance: userRow.balance + tx.amount })
      .eq("id", tx.user_id);
  }

  return plain("1|OK");
}
