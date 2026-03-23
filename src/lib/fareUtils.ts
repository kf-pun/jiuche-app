/**
 * 油耗與費用計算工具
 * 資料來源：交通部能源局 ecocar.artc.org.tw，官方值 × 1.15 市區修正係數
 */

export const VEHICLE_TYPES = [
  '小型轎車', '中型轎車', '大型轎車',
  'SUV（小）', 'SUV（中）', 'SUV（大）',
  'MPV', '電動車',
] as const;

export type VehicleType = typeof VEHICLE_TYPES[number];

/** 市區油耗（L/km），電動車為 0 */
export const FUEL_EFFICIENCY: Record<VehicleType, number> = {
  '小型轎車': 0.068,
  '中型轎車': 0.095,
  '大型轎車': 0.110,
  'SUV（小）': 0.095,
  'SUV（中）': 0.109,
  'SUV（大）': 0.130,
  'MPV':       0.127,
  '電動車':    0,
};

/** 預設油號（用於查系統油價） */
export const FUEL_GRADE: Record<VehicleType, '92' | '95' | '98' | 'N/A'> = {
  '小型轎車': '95',
  '中型轎車': '95',
  '大型轎車': '98',
  'SUV（小）': '95',
  'SUV（中）': '95',
  'SUV（大）': '98',
  'MPV':       '95',
  '電動車':    'N/A',
};

/** 預設油價（當 system_config 無法讀取時的兜底值） */
export const DEFAULT_FUEL_PRICES = {
  '92': 30.3,
  '95': 32.5,
  '98': 34.5,
};

/**
 * 計算法定油資上限（每位乘客，取整數）
 * 公式：Math.floor( (距離 × 油耗 × 油價) / 乘客數 )
 * 電動車：回傳 null（不計油耗）
 */
export function calcFareLimit(
  distanceKm: number,
  vehicleType: VehicleType | null,
  fuelPrice95: number,
  fuelPrice98: number,
  passengers: number
): number | null {
  const vt = vehicleType || '中型轎車'; // null/空字串 → 中型轎車兜底
  const efficiency = FUEL_EFFICIENCY[vt];
  if (efficiency === 0) return null; // 電動車

  const grade = FUEL_GRADE[vt];
  const fuelPrice = grade === '98' ? fuelPrice98 : fuelPrice95;

  return Math.floor((distanceKm * efficiency * fuelPrice) / passengers);
}

/**
 * 服務費分級（方案 B：依距離）
 * $10（0–10km）/ $15（11–30km）/ $20（>30km）
 * 從 system_config 傳入分級金額
 */
export function calcServiceFee(
  distanceKm: number | null,
  tier1: number,
  tier2: number,
  tier3: number
): number {
  if (distanceKm == null) return tier2; // 無距離資訊 → 預設中段
  if (distanceKm <= 10) return tier1;
  if (distanceKm <= 30) return tier2;
  return tier3;
}
