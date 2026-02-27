import { supabase } from "@/integrations/supabase/client";

export async function uploadAccidentImage(file: File): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("accident-images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("accident-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export type Report = {
  id: string;
  photo_url: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  status: string;
  assigned_driver_id: string | null;
  created_at: string;
};

export type Official = {
  id: string;
  name: string;
  role: "ambulance" | "police";
  email: string;
  created_at: string;
};

// Helper to bypass typed client until types regenerate
export const db = {
  reports: () => (supabase as any).from("reports"),
  officials: () => (supabase as any).from("officials"),
};
