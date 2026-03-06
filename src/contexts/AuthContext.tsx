import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lf_profiles, lf_user_roles, lfTable } from "@/integrations/supabase/lf_types";

interface Profile extends lf_profiles { }

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data: profData } = await (supabase
      .from(lfTable("profiles") as any)
      .select("*")
      .eq("id", userId)
      .single() as any);
    if (profData) setProfile(profData as Profile);

    const { data: roleData } = await (supabase
      .from(lfTable("user_roles") as any)
      .select("role")
      .eq("user_id", userId)
      .single() as any);
    if (roleData) setRole((roleData as lf_user_roles).role);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    // Safety timeout - never stay loading forever
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await fetchProfile(session.user.id);
          } catch (e) {
            console.error("Erro ao carregar perfil:", e);
          }
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
        clearTimeout(timeout);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).catch(console.error).finally(() => {
          setLoading(false);
          clearTimeout(timeout);
        });
      } else {
        setLoading(false);
        clearTimeout(timeout);
      }
    }).catch(() => {
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome_completo: nome } },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
