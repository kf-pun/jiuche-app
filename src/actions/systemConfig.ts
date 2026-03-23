"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface FareConfig {
  fuelPrice95: number;
  fuelPrice98: number;
  tier1: number; // 0–10km
  tier2: number; // 11–30km
  tier3: number; // >30km
}

/** 讀取 system_config 表的油價與服務費設定，失敗時回傳預設值 */
export async function getFareConfig(): Promise<FareConfig> {
  const defaults: FareConfig = {
    fuelPrice95: 32.5,
    fuelPrice98: 34.5,
    tier1: 10,
    tier2: 15,
    tier3: 20,
  };

  try {
    const service = await createServiceClient();
    const { data } = await service
      .from("system_config")
      .select("key, value")
      .in("key", [
        "fuel_price_95", "fuel_price_98",
        "service_fee_tier1", "service_fee_tier2", "service_fee_tier3",
      ]);

    if (!data) return defaults;

    const map = Object.fromEntries(data.map((r) => [r.key, parseFloat(r.value)]));
    return {
      fuelPrice95: map["fuel_price_95"]    ?? defaults.fuelPrice95,
      fuelPrice98: map["fuel_price_98"]    ?? defaults.fuelPrice98,
      tier1:       map["service_fee_tier1"] ?? defaults.tier1,
      tier2:       map["service_fee_tier2"] ?? defaults.tier2,
      tier3:       map["service_fee_tier3"] ?? defaults.tier3,
    };
  } catch {
    return defaults;
  }
}

/** 判斷乘客是否為企業包月員工（免服務費） */
export async function isEnterprisePassenger(userId: string): Promise<boolean> {
  try {
    const service = await createServiceClient();
    const { data: userRow } = await service
      .from("users")
      .select("company")
      .eq("id", userId)
      .single();

    if (!userRow?.company) return false;

    const { data: company } = await service
      .from("companies")
      .select("subscription_active")
      .eq("name", userRow.company)
      .single();

    return company?.subscription_active === true;
  } catch {
    return false;
  }
}
