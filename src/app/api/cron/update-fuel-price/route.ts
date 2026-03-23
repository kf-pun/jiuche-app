import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * S10-6 — 每週四自動更新中油油價
 * 資料來源：政府開放資料平台 data.gov.tw（能源局）
 * 呼叫者：Vercel Cron（每週四 01:00 UTC = 09:00 台灣時間）
 * 保護：Authorization: Bearer ${CRON_SECRET}
 *
 * 若 API 不可用或解析失敗 → 保留 system_config 舊值，不中斷服務
 */

/** data.gov.tw 中油零售油價 API（JSON） */
const DATA_GOV_API =
  "https://data.gov.tw/api/v2/rest/datastore/search?resource_id=f5054e52-4a26-4711-955b-9e5e1e079e81&limit=5&sort=pub_time+desc";

interface GovRecord {
  pub_time?: string;
  " 92無鉛汽油"?: string;
  " 95無鉛汽油"?: string;
  " 98無鉛汽油"?: string;
  "92無鉛汽油"?: string;
  "95無鉛汽油"?: string;
  "98無鉛汽油"?: string;
}

function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseFloat(raw.trim());
  return isFinite(n) && n > 20 && n < 60 ? n : null; // 合理範圍 20–60 元/公升
}

export async function GET(req: NextRequest) {
  // ── 1. 驗證 CRON_SECRET ──────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result: { updated: string[]; skipped: string[]; error?: string } = {
    updated: [],
    skipped: [],
  };

  try {
    // ── 2. 抓取能源局油價 API ────────────────────────────────────────────────
    const res = await fetch(DATA_GOV_API, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`data.gov.tw API 回應 ${res.status}`);
    }

    const json = await res.json();
    const records: GovRecord[] = json?.result?.records ?? [];

    if (records.length === 0) {
      throw new Error("data.gov.tw 回傳空資料");
    }

    // 取最新一筆（已按 pub_time desc 排序）
    const latest = records[0];

    const price92 = parsePrice(latest["92無鉛汽油"] ?? latest[" 92無鉛汽油"]);
    const price95 = parsePrice(latest["95無鉛汽油"] ?? latest[" 95無鉛汽油"]);
    const price98 = parsePrice(latest["98無鉛汽油"] ?? latest[" 98無鉛汽油"]);

    if (!price92 && !price95 && !price98) {
      throw new Error("無法解析任何油價欄位");
    }

    // ── 3. 寫入 system_config ──────────────────────────────────────────────
    const service = await createServiceClient();
    const now = new Date().toISOString();

    const updates: Array<{ key: string; value: string }> = [];
    if (price92) updates.push({ key: "fuel_price_92", value: String(price92) });
    if (price95) updates.push({ key: "fuel_price_95", value: String(price95) });
    if (price98) updates.push({ key: "fuel_price_98", value: String(price98) });

    for (const row of updates) {
      const { error } = await service
        .from("system_config")
        .update({ value: row.value, updated_at: now })
        .eq("key", row.key);

      if (error) {
        result.skipped.push(`${row.key} (DB error: ${error.message})`);
      } else {
        result.updated.push(`${row.key}=${row.value}`);
      }
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    // 不拋出 — 回傳 200 讓 Vercel Cron 不重試，保留舊油價
    return NextResponse.json(
      { ok: false, ...result, timestamp: new Date().toISOString() },
      { status: 200 }
    );
  }

  return NextResponse.json({
    ok: true,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
