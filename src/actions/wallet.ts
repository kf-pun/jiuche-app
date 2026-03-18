"use server";

import { createHash } from "crypto";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { WalletTransactionInsert } from "@/types/database";

// ── ECPay helpers ──────────────────────────────────────────────────────────────

const ECPAY_MERCHANT_ID = process.env.ECPAY_MERCHANT_ID ?? "2000132";
const ECPAY_HASH_KEY = process.env.ECPAY_HASH_KEY ?? "5294y06JbISpM5x9";
const ECPAY_HASH_IV = process.env.ECPAY_HASH_IV ?? "v77hoKGq4kWxNNIS";
const ECPAY_API_URL = process.env.ECPAY_API_URL ?? "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

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

function generateCheckMacValue(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const raw = `HashKey=${ECPAY_HASH_KEY}&${sorted}&HashIV=${ECPAY_HASH_IV}`;
  const encoded = phpUrlEncode(raw).toLowerCase();
  return createHash("sha256").update(encoded).digest("hex").toUpperCase();
}

export interface EcpayOrderResult {
  success: boolean;
  formAction?: string;
  params?: Record<string, string>;
  transactionId?: string;
  error?: string;
}

export async function createEcpayOrder(
  amount: number,
  paymentType: "credit" | "atm" | "cvs"
): Promise<EcpayOrderResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "未登入" };

  const service = await createServiceClient();

  // MerchantTradeNo: JC + yyyyMMddHHmmss + 2-digit random (max 20 chars)
  const now = new Date();
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  const tradeNo = `JC${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(Math.floor(Math.random() * 99))}`;
  const tradeDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const methodLabel = paymentType === "credit" ? "信用卡" : paymentType === "atm" ? "ATM" : "超商";
  const choosePayment = paymentType === "credit" ? "Credit" : paymentType === "atm" ? "ATM" : "CVS";

  // Write pending transaction
  const { data: txData, error: txErr } = await service
    .from("wallet_transactions")
    .insert({
      user_id: user.id,
      type: "topup",
      amount,
      description: `ECPay 儲值（${methodLabel}）`,
      reference_id: null,
      status: "pending",
      ecpay_trade_no: tradeNo,
    })
    .select("id")
    .single();

  if (txErr || !txData) return { success: false, error: "建立訂單失敗，請稍後再試" };

  const ecpayParams: Record<string, string> = {
    MerchantID: ECPAY_MERCHANT_ID,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: tradeDate,
    PaymentType: "aio",
    TotalAmount: String(amount),
    TradeDesc: encodeURIComponent("揪車錢包儲值"),
    ItemName: `揪車錢包儲值 NT$${amount}`,
    ReturnURL: `${APP_URL}/api/ecpay/callback`,
    OrderResultURL: `${APP_URL}/api/ecpay/result`,
    ChoosePayment: choosePayment,
    EncryptType: "1",
  };
  ecpayParams.CheckMacValue = generateCheckMacValue(ecpayParams);

  return {
    success: true,
    formAction: ECPAY_API_URL,
    params: ecpayParams,
    transactionId: txData.id,
  };
}

// ── Top-up ────────────────────────────────────────────────────────────────────

export interface TopupResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export async function createTopup(amount: number, method: string): Promise<TopupResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "未登入" };

  const service = await createServiceClient();

  const { data: userRow } = await service
    .from("users")
    .select("balance")
    .eq("id", user.id)
    .single();

  if (!userRow) return { success: false, error: "找不到用戶" };

  const tx: WalletTransactionInsert = {
    user_id: user.id,
    type: "topup",
    amount,
    description: `儲值（${method}）`,
    reference_id: null,
  };

  const { data: txData, error: txErr } = await service
    .from("wallet_transactions")
    .insert(tx)
    .select("id")
    .single();

  if (txErr || !txData) {
    console.error("createTopup error:", txErr);
    return { success: false, error: "儲值失敗，請稍後再試" };
  }

  await service
    .from("users")
    .update({ balance: userRow.balance + amount })
    .eq("id", user.id);

  return { success: true, transactionId: txData.id };
}

// ── Get Transactions ──────────────────────────────────────────────────────────

export interface WalletTx {
  id: string;
  type: "topup" | "payment" | "refund" | "earning";
  amount: number;
  description: string;
  createdAt: string;
}

export async function getWalletTransactions(): Promise<WalletTx[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id, type, amount, description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];

  return (data ?? []).map((t) => ({
    id: t.id,
    type: t.type as WalletTx["type"],
    amount: t.amount,
    description: t.description,
    createdAt: t.created_at,
  }));
}
