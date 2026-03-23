"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { VEHICLE_TYPES } from "@/lib/fareUtils";
import Link from "next/link";

export default function ProfileEditPage() {
  const { user, isLoggedIn, updateUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name:        user?.name        ?? "",
    company:     user?.company     ?? "",
    isDriver:    user?.isDriver    ?? false,
    vehicleType: user?.vehicleType ?? "",
    carModel:    user?.carModel    ?? "",
    carPlate:    user?.carPlate    ?? "",
    carColor:    user?.carColor    ?? "",
  });

  // BUG-SP16-02 fix: sync form when user first loads (useState initial value only runs once at mount)
  useEffect(() => {
    if (user) {
      setForm({
        name:        user.name,
        company:     user.company,
        isDriver:    user.isDriver,
        vehicleType: user.vehicleType,
        carModel:    user.carModel,
        carPlate:    user.carPlate,
        carColor:    user.carColor,
      });
    }
  }, [user?.id]); // only re-sync when user identity changes, not on every user field update

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setTimeout(() => {
      updateUser({
        name: form.name.trim(),
        avatar: form.name.trim()[0],
        company: form.company.trim(),
        isDriver: form.isDriver,
        vehicleType: form.isDriver ? form.vehicleType : "",
        carModel:    form.isDriver ? form.carModel    : "",
        carPlate:    form.isDriver ? form.carPlate    : "",
        carColor:    form.isDriver ? form.carColor    : "",
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/profile"), 800);
    }, 900);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-20">
        <p className="text-gray-400">請先登入</p>
        <Link href="/auth/login" className="mt-4 text-green-600 text-sm">前往登入</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <Link href="/profile" className="flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          返回個人資料
        </Link>
        <h1 className="text-xl font-bold text-white">編輯資料</h1>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-700">基本資料</h3>
          {[
            { label: "姓名",       key: "name",    placeholder: "請輸入姓名" },
            { label: "公司 / 機構", key: "company", placeholder: "例：台積電" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[key as "name" | "company"]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none border border-gray-100 focus:border-green-400 transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">司機設定</h3>
              <p className="text-xs text-gray-400 mt-0.5">開啟後可發布共乘行程</p>
            </div>
            <button
              onClick={() => set("isDriver", !form.isDriver)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.isDriver ? "bg-green-500" : "bg-gray-200"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isDriver ? "left-6" : "left-0.5"}`} />
            </button>
          </div>

          {form.isDriver && (
            <div className="flex flex-col gap-3 pt-3 border-t border-gray-50">
              {/* 車輛類別（8種，用於油耗計算） */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">車輛類別（用於計算油耗）</label>
                <div className="grid grid-cols-2 gap-2">
                  {VEHICLE_TYPES.map((vt) => (
                    <button
                      key={vt}
                      onClick={() => set("vehicleType", vt)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium text-left transition-all ${
                        form.vehicleType === vt
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {vt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 車輛品牌型號（自由文字，顯示用） */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">車輛品牌型號（選填，顯示給乘客）</label>
                <input
                  type="text"
                  placeholder={({
                    "小型轎車": "例：Toyota Yaris",
                    "中型轎車": "例：Toyota Camry",
                    "大型轎車": "例：BMW 5 Series",
                    "SUV（小）": "例：Honda HR-V",
                    "SUV（中）": "例：Honda CR-V",
                    "SUV（大）": "例：Ford Explorer",
                    "MPV":       "例：Toyota Sienna",
                    "電動車":    "例：Tesla Model 3",
                  } as Record<string, string>)[form.vehicleType] ?? "例：Honda CR-V"}
                  value={form.carModel}
                  onChange={(e) => set("carModel", e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none border border-gray-100 focus:border-green-400 transition-colors"
                />
              </div>

              {/* 車牌號碼 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">車牌號碼</label>
                <input
                  type="text"
                  placeholder="例：ABC-1234"
                  value={form.carPlate}
                  onChange={(e) => set("carPlate", e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none border border-gray-100 focus:border-green-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">車身顏色</label>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { label: "白色", hex: "#F0F0F0" },
                    { label: "銀色", hex: "#C0C0C0" },
                    { label: "黑色", hex: "#222222" },
                    { label: "灰色", hex: "#808080" },
                    { label: "藍色", hex: "#3B82F6" },
                    { label: "紅色", hex: "#EF4444" },
                  ] as const).map(({ label, hex }) => (
                    <button key={label} onClick={() => set("carColor", label)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.carColor === label ? "ring-2 ring-green-500 ring-offset-1 bg-green-50 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      <span className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: hex }} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || saved || !form.name.trim()}
          className={`w-full font-semibold py-4 rounded-xl shadow flex items-center justify-center gap-2 active:scale-95 transition-all ${saved ? "bg-green-100 text-green-700" : "bg-gradient-to-r from-green-600 to-emerald-500 text-white disabled:opacity-50"}`}
        >
          {saving ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>儲存中...</>
          ) : saved ? (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>已儲存！</>
          ) : "儲存變更"}
        </button>
      </div>
    </div>
  );
}
