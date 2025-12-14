-- Add CPF column to tutores table
ALTER TABLE public.tutores ADD COLUMN cpf TEXT UNIQUE;

-- Create documents/templates table for letterhead and contracts
CREATE TABLE public.documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.tutores(id) ON DELETE SET NULL,
    reserva_id UUID REFERENCES public.reservas(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'contrato', -- 'contrato', 'termo', 'recibo'
    assinatura_url TEXT,
    assinado_em TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'assinado', 'cancelado'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create templates table for letterhead
CREATE TABLE public.templates_documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    logo_url TEXT,
    tipo TEXT NOT NULL DEFAULT 'contrato',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_documento ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documentos
CREATE POLICY "Pet sitters can view own documentos" ON public.documentos FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Pet sitters can insert documentos" ON public.documentos FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "Pet sitters can update own documentos" ON public.documentos FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "Pet sitters can delete own documentos" ON public.documentos FOR DELETE USING (auth.uid() = tenant_id);

-- RLS Policies for templates_documento
CREATE POLICY "Pet sitters can view own templates" ON public.templates_documento FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Pet sitters can insert templates" ON public.templates_documento FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "Pet sitters can update own templates" ON public.templates_documento FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "Pet sitters can delete own templates" ON public.templates_documento FOR DELETE USING (auth.uid() = tenant_id);

-- Create storage bucket for logos and signatures
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true);

-- Storage policies
CREATE POLICY "Users can upload own logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own files" ON storage.objects FOR SELECT USING (bucket_id = 'documentos');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update RPC function to include CPF
CREATE OR REPLACE FUNCTION public.criar_reserva_anonima(
    p_tenant_id uuid, 
    p_tutor_nome text, 
    p_tutor_contato text, 
    p_tutor_email text, 
    p_tutor_cpf text,
    p_data_inicio timestamp with time zone, 
    p_data_fim timestamp with time zone, 
    p_observacoes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_reserva_id UUID;
    v_tutor_id UUID;
BEGIN
    -- Check if tutor with this CPF already exists for this tenant
    SELECT id INTO v_tutor_id FROM public.tutores 
    WHERE cpf = p_tutor_cpf AND tenant_id = p_tenant_id;
    
    -- If tutor doesn't exist, create one
    IF v_tutor_id IS NULL THEN
        INSERT INTO public.tutores (tenant_id, nome, telefone, email, cpf)
        VALUES (p_tenant_id, p_tutor_nome, p_tutor_contato, p_tutor_email, p_tutor_cpf)
        RETURNING id INTO v_tutor_id;
    END IF;
    
    -- Create reservation linked to tutor
    INSERT INTO public.reservas (
        tenant_id,
        tutor_id,
        tutor_nome,
        tutor_contato,
        tutor_email,
        data_inicio,
        data_fim,
        observacoes,
        status
    ) VALUES (
        p_tenant_id,
        v_tutor_id,
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

-- Add triggers for updated_at
CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON public.documentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_documento_updated_at BEFORE UPDATE ON public.templates_documento FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();