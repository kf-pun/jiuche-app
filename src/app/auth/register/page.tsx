"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function Field({ label, field, placeholder, hint, form, errors, set, transform }: {
  label: string; field: string; placeholder: string; hint?: string;
  form: Record<string, string | boolean>;
  errors: Record<string, string>;
  set: (k: string, v: string | boolean) => void;
  transform?: (v: string) => string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={form[field] as string}
        onChange={(e) => set(field, transform ? transform(e.target.value) : e.target.value)}
        className={`w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none border transition-colors ${errors[field] ? "border-red-300 bg-red-50" : "border-gray-100 focus:border-green-400"}`}
      />
      {hint && !errors[field] && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {errors[field] && <p className="text-xs text-red-400 mt-1">{errors[field]}</p>}
    </div>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const supabase = createClient();
  const phone = searchParams.get("phone") || "";

  const [form, setForm] = useState({ name: "", company: "", isDriver: false, carModel: "", carPlate: "", carColor: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string | boolean) => { setForm((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "請輸入姓名";
    if (!form.company.trim()) e.company = "請輸入公司名稱";
    if (form.isDriver) {
      if (!form.carModel.trim()) e.carModel = "請輸入車型";
      if (!form.carPlate.trim()) e.carPlate = "請輸入車牌號碼";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toE164 = (p: string) => {
    const digits = p.replace(/\D/g, "");
    if (digits.startsWith("0")) return "+886" + digits.slice(1);
    return "+" + digits;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setErrors({ name: "Session 已過期，請重新登入" });
      setLoading(false);
      router.replace("/auth/login");
      return;
    }

    const { error } = await supabase.from("users").insert({
      id: authUser.id,
      phone: toE164(phone),
      name: form.name,
      company: form.company,
      is_driver: form.isDriver,
      vehicle_type: form.isDriver ? form.carModel : null,
      vehicle_plate: form.isDriver ? form.carPlate : null,
      vehicle_color: form.isDriver ? form.carColor : null,
      balance: 0,
      co2_total: 0,
      rating: 0,
      rating_count: 0,
    });

    if (error) {
      setErrors({ name: "建立帳號失敗，請稍後再試" });
      setLoading(false);
      return;
    }

    await refreshUser();
    const redirect = sessionStorage.getItem("jiuche_redirect") || "/";
    sessionStorage.removeItem("jiuche_redirect");
    router.replace(redirect);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-8 flex flex-col items-center">
        <div className="bg-white/20 rounded-2xl p-3 mb-3">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">建立帳號</h1>
        <p className="text-white/70 text-sm mt-1">完成後即可開始使用揪車</p>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-700">基本資料</h3>
          <Field label="姓名" field="name" placeholder="請輸入您的姓名" form={form} errors={errors} set={set} />
          <Field label="公司 / 機構" field="company" placeholder="例：台積電、聯發科" hint="用於媒合同公司同事共乘" form={form} errors={errors} set={set} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">我想當司機</h3>
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
              <Field label="車型" field="carModel" placeholder="例：Toyota Camry" form={form} errors={errors} set={set} />
              <Field label="車牌號碼" field="carPlate" placeholder="例：ABC-1234" form={form} errors={errors} set={set} transform={(v) => v.replace(/[^A-Za-z0-9-]/g, "").toUpperCase()} />
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">車身顏色</label>
                <div className="flex gap-2 flex-wrap">
                  {["白色", "銀色", "黑色", "灰色", "藍色", "紅色"].map((c) => (
                    <button
                      key={c}
                      onClick={() => set("carColor", c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        form.carColor === c ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 flex gap-3">
          <div className="bg-white/20 rounded-xl p-2 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white/90 text-xs leading-relaxed">
            每次共乘都將自動計算減碳量，累積您的 ESG 貢獻，並納入企業永續報告。
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>建立中...</>
          ) : "完成註冊，開始揪車！"}
        </button>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterContent /></Suspense>;
}
