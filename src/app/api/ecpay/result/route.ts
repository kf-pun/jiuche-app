import { NextRequest, NextResponse } from "next/server";

const PAY_TYPE_MAP: Record<string, string> = {
  Credit_CreditCard: "credit",
  ATM_BOT: "atm",
  ATM_ESUN: "atm",
  ATM_TAISHIN: "atm",
  ATM_CTBC: "atm",
  ATM_CHINATRUST: "atm",
  CVS_CVS: "cvs",
  CVS_OK: "cvs",
  CVS_Family: "cvs",
  CVS_Hilife: "cvs",
  CVS_IBON: "cvs",
};

// ECPay POSTs to this URL to redirect the user after payment
export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body).entries());
  const origin = new URL(req.url).origin;

  const rtnCode = params.RtnCode ?? "";
  const amount = params.TradeAmt ?? "0";
  const payType = params.PaymentType ?? "";
  const method = PAY_TYPE_MAP[payType] ?? "credit";

  if (rtnCode === "1") {
    return NextResponse.redirect(
      new URL(`/wallet/topup/success?amount=${amount}&method=${method}`, origin)
    );
  }

  // Payment failed — redirect back to topup
  return NextResponse.redirect(new URL("/wallet/topup", origin));
}

// Fallback for GET (e.g. browser direct navigation)
export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(new URL("/wallet/topup", origin));
}
