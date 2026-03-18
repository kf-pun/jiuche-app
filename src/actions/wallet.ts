"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { WalletTransactionInsert } from "@/types/database";

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
