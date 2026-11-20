
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/supabase-helpers";
import type { Official } from "@/lib/supabase-helpers";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [official, setOfficial] = useState<Official | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOfficial = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setOfficial(null);
      return;
    }

    try {
      const { data, error } = await db
        .officials()
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Official lookup failed:", error);
        setOfficial(null);
        return;
      }

      setOfficial(data as Official | null);
    } catch (error) {
      console.error("Authentication lookup failed:", error);
      setOfficial(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
      }

      if (!mounted) return;

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      await loadOfficial(currentUser);

      if (mounted) {
        setLoading(false);
      }
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      if (!mounted) return;

      setUser(currentUser);

      if (!currentUser) {
        setOfficial(null);
        setLoading(false);
      } else {
        setLoading(true);
        void loadOfficial(currentUser).finally(() => {
          if (mounted) setLoading(false);
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadOfficial]);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out failed:", error);
    }

    return { error };
  };

  return {
    user,
    official,
    loading,
    signIn,
    signOut,
  };
}
