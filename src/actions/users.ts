"use server";

import { createClient } from "@/lib/supabase/server";

export interface UpdateProfileInput {
  name: string;
  company: string;
  isDriver: boolean;
  vehicleType: string;
  carModel: string;
  carPlate: string;
  carColor: string;
}

export async function updateUserProfile(
  input: UpdateProfileInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "未登入" };

  const { error } = await supabase
    .from("users")
    .update({
      name: input.name,
      company: input.company,
      is_driver: input.isDriver,
      vehicle_type: input.isDriver ? (input.vehicleType || null) : null,
      car_model: input.isDriver ? (input.carModel || null) : null,
      vehicle_plate: input.isDriver ? (input.carPlate || null) : null,
      vehicle_color: input.isDriver ? (input.carColor || null) : null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("updateUserProfile error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
