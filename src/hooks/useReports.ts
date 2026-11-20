
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/supabase-helpers";
import type { Report } from "@/lib/supabase-helpers";

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data, error } = await db
      .reports()
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch reports:", error);
      return;
    }

    setReports((data ?? []) as Report[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();

    const channel = supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
        },
        () => {
          void refetch();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    reports,
    loading,
    refetch,
  };
}
