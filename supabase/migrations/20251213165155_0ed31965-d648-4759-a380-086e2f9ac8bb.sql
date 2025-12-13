-- Enum para funções de usuário
CREATE TYPE public.app_role AS ENUM ('master', 'petsitter');

-- Tabela de roles (separada do perfil por segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'petsitter',
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Perfis de Pet Sitters
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    empresa TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tutores (donos dos pets)
CREATE TABLE public.tutores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT NOT NULL,
    endereco TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tutores ENABLE ROW LEVEL SECURITY;

-- Pets
CREATE TABLE public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.tutores(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    especie TEXT NOT NULL DEFAULT 'Cachorro',
    raca TEXT,
    idade INTEGER,
    peso DECIMAL(5,2),
    observacoes TEXT,
    foto_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Reservas
CREATE TABLE public.reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.tutores(id) ON DELETE SET NULL,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    tutor_nome TEXT NOT NULL,
    tutor_contato TEXT NOT NULL,
    tutor_email TEXT,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aguardando' CHECK (status IN ('Aguardando', 'Aprovada', 'Recusada', 'Concluída', 'Cancelada')),
    valor DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Financeiro
CREATE TABLE public.financeiro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('Receber', 'Pagar')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    pago_recebido BOOLEAN NOT NULL DEFAULT false,
    data_pagamento DATE,
    categoria TEXT,
    reserva_id UUID REFERENCES public.reservas(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;

-- Caixa PDV
CREATE TABLE public.caixa_pdv (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('Entrada', 'Saída')),
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL,
    forma_pagamento TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.caixa_pdv ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles" ON public.user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Tutores (multi-tenant)
CREATE POLICY "Pet sitters can view own tutores" ON public.tutores
    FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can insert tutores" ON public.tutores
    FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can update own tutores" ON public.tutores
    FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can delete own tutores" ON public.tutores
    FOR DELETE USING (auth.uid() = tenant_id);

-- Pets (multi-tenant)
CREATE POLICY "Pet sitters can view own pets" ON public.pets
    FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can insert pets" ON public.pets
    FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can update own pets" ON public.pets
    FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can delete own pets" ON public.pets
    FOR DELETE USING (auth.uid() = tenant_id);

-- Reservas (multi-tenant)
CREATE POLICY "Pet sitters can view own reservas" ON public.reservas
    FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can insert reservas" ON public.reservas
    FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can update own reservas" ON public.reservas
    FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can delete own reservas" ON public.reservas
    FOR DELETE USING (auth.uid() = tenant_id);

-- Financeiro (multi-tenant)
CREATE POLICY "Pet sitters can view own financeiro" ON public.financeiro
    FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can insert financeiro" ON public.financeiro
    FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can update own financeiro" ON public.financeiro
    FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can delete own financeiro" ON public.financeiro
    FOR DELETE USING (auth.uid() = tenant_id);

-- Caixa PDV (multi-tenant)
CREATE POLICY "Pet sitters can view own caixa" ON public.caixa_pdv
    FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Pet sitters can insert caixa" ON public.caixa_pdv
    FOR INSERT WITH CHECK (auth.uid() = tenant_id);

-- Função RPC para reservas anônimas (página pública)
CREATE OR REPLACE FUNCTION public.criar_reserva_anonima(
    p_tenant_id UUID,
    p_tutor_nome TEXT,
    p_tutor_contato TEXT,
    p_tutor_email TEXT,
    p_data_inicio TIMESTAMPTZ,
    p_data_fim TIMESTAMPTZ,
    p_observacoes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reserva_id UUID;
BEGIN
    INSERT INTO public.reservas (
        tenant_id,
        tutor_nome,
        tutor_contato,
        tutor_email,
        data_inicio,
        data_fim,
        observacoes,
        status
    ) VALUES (
        p_tenant_id,
        p_tutor_nome,
        p_tutor_contato,
        p_tutor_email,
        p_data_inicio,
        p_data_fim,
        p_observacoes,
        'Aguardando'
    ) RETURNING id INTO v_reserva_id;
    
    RETURN v_reserva_id;
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutores_updated_at BEFORE UPDATE ON public.tutores
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON public.reservas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financeiro_updated_at BEFORE UPDATE ON public.financeiro
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil e role ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'petsitter');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();