
-- 1. Create app_role enum (if it doesn't exist, though it usually does in a centralized project)
-- DO $$ BEGIN 
--   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
--     CREATE TYPE public.app_role AS ENUM ('admin', 'advogado', 'operacional');
--   END IF;
-- END $$;

-- 2. Create lf_profiles table
CREATE TABLE IF NOT EXISTS public.lf_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT,
  oab TEXT,
  especialidade TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create lf_user_roles table
CREATE TABLE IF NOT EXISTS public.lf_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- 4. Create lf_processos table
CREATE TABLE IF NOT EXISTS public.lf_processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  numero TEXT NOT NULL,
  tribunal TEXT NOT NULL,
  tribunal_sigla TEXT NOT NULL,
  partes TEXT,
  autor TEXT,
  reu TEXT,
  assunto TEXT,
  responsavel TEXT,
  data_ultimo_movimento DATE,
  proxima_data_critica DATE,
  dias_para_prazo INTEGER,
  status_prazo TEXT CHECK (status_prazo IN ('urgente', 'atencao', 'saudavel', 'vencido')) DEFAULT 'saudavel',
  status TEXT CHECK (status IN ('ativo', 'finalizado', 'suspenso')) DEFAULT 'ativo',
  uf TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create lf_movimentacoes table
CREATE TABLE IF NOT EXISTS public.lf_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id UUID REFERENCES public.lf_processos(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('peticao', 'sentenca', 'despacho', 'agravo', 'citacao', 'autuacao', 'outro')) DEFAULT 'outro',
  prazo_dias INTEGER,
  prazo_final DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create lf_notificacoes table
CREATE TABLE IF NOT EXISTS public.lf_notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT CHECK (tipo IN ('urgente', 'atencao', 'saudavel', 'vencido', 'info')) DEFAULT 'info',
  titulo TEXT NOT NULL,
  descricao TEXT,
  data TIMESTAMP WITH TIME ZONE DEFAULT now(),
  lida BOOLEAN DEFAULT false,
  processo_id UUID REFERENCES public.lf_processos(id) ON DELETE SET NULL
);

-- 7. Create lf_user_preferences table
CREATE TABLE IF NOT EXISTS public.lf_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  alerta_email BOOLEAN DEFAULT true,
  resumo_diario BOOLEAN DEFAULT true,
  alertas_criticos BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_numero TEXT,
  tribunais_favoritos TEXT[] DEFAULT '{}',
  sync_interval_hours INTEGER DEFAULT 6,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Enable RLS
ALTER TABLE public.lf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lf_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lf_processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lf_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lf_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lf_user_preferences ENABLE ROW LEVEL SECURITY;

-- 9. Security definer function (adjusted with lf_ prefix internally if needed, but the check is on specific table)
CREATE OR REPLACE FUNCTION public.lf_has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lf_user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 10. lf_profiles policies
CREATE POLICY "Users can view own profile" ON public.lf_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.lf_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.lf_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.lf_profiles FOR SELECT USING (public.lf_has_role(auth.uid(), 'admin'));

-- 11. lf_user_roles policies
CREATE POLICY "Users can view own roles" ON public.lf_user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.lf_user_roles FOR ALL USING (public.lf_has_role(auth.uid(), 'admin'));

-- 12. lf_processos policies
CREATE POLICY "Users can view own processos" ON public.lf_processos FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can insert own processos" ON public.lf_processos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own processos" ON public.lf_processos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all processos" ON public.lf_processos FOR ALL USING (public.lf_has_role(auth.uid(), 'admin'));

-- 13. lf_movimentacoes policies
CREATE POLICY "Users can view movimentacoes of own processos" ON public.lf_movimentacoes 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.lf_processos p WHERE p.id = processo_id AND p.user_id = auth.uid())
  );
CREATE POLICY "Users can insert movimentacoes to own processos" ON public.lf_movimentacoes 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.lf_processos p WHERE p.id = processo_id AND p.user_id = auth.uid())
  );

-- 14. lf_notificacoes policies
CREATE POLICY "Users can view own notificacoes" ON public.lf_notificacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notificacoes" ON public.lf_notificacoes FOR UPDATE USING (auth.uid() = user_id);

-- 15. lf_user_preferences policies
CREATE POLICY "Users can view own preferences" ON public.lf_user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own preferences" ON public.lf_user_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 16. Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.lf_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.lf_profiles (id, nome_completo)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'nome_completo');
  
  INSERT INTO public.lf_user_preferences (user_id) VALUES (NEW.id);
  
  -- Default role: advogado
  INSERT INTO public.lf_user_roles (user_id, role) VALUES (NEW.id, 'advogado');
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_auth_user_created_lf ON auth.users;

CREATE TRIGGER on_auth_user_created_lf
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.lf_handle_new_user();

-- 17. Timestamp trigger
-- Using same function name if it exists or prefix it
CREATE TRIGGER update_lf_profiles_updated_at BEFORE UPDATE ON public.lf_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lf_processos_updated_at BEFORE UPDATE ON public.lf_processos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lf_preferences_updated_at BEFORE UPDATE ON public.lf_user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
