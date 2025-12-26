-- Table for editable homepage and plan configurations
CREATE TABLE public.configuracoes_sistema (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chave text NOT NULL UNIQUE,
    valor jsonb NOT NULL DEFAULT '{}',
    descricao text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Only master users can manage configurations
CREATE POLICY "Masters can view configurations"
ON public.configuracoes_sistema
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Masters can insert configurations"
ON public.configuracoes_sistema
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Masters can update configurations"
ON public.configuracoes_sistema
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Masters can delete configurations"
ON public.configuracoes_sistema
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'master'));

-- Allow public read for homepage config
CREATE POLICY "Public can view homepage config"
ON public.configuracoes_sistema
FOR SELECT
TO anon
USING (chave IN ('homepage', 'planos'));

-- Insert default configurations
INSERT INTO public.configuracoes_sistema (chave, valor, descricao) VALUES
('homepage', '{
  "hero": {
    "titulo": "Gerencie seu negócio de Pet Sitting com facilidade",
    "subtitulo": "Sistema completo para gestão de reservas, tutores, pets e finanças do seu negócio de hospedagem animal.",
    "cta_primario": "Começar Agora",
    "cta_secundario": "Ver Preços"
  },
  "features": [
    {"icone": "Calendar", "titulo": "Gestão de Reservas", "descricao": "Controle completo de check-in, check-out e agenda de hospedagem."},
    {"icone": "Users", "titulo": "Cadastro de Tutores", "descricao": "Mantenha todas as informações dos tutores organizadas."},
    {"icone": "Heart", "titulo": "Perfil dos Pets", "descricao": "Registre informações detalhadas de cada pet."},
    {"icone": "DollarSign", "titulo": "Controle Financeiro", "descricao": "Acompanhe receitas, despesas e fluxo de caixa."},
    {"icone": "FileText", "titulo": "Documentos", "descricao": "Gere contratos e termos de responsabilidade."},
    {"icone": "Shield", "titulo": "Segurança", "descricao": "Dados protegidos com criptografia de ponta."}
  ],
  "galeria_titulo": "Nossos Clientes Felizes"
}', 'Configurações da página inicial'),
('planos', '{
  "mensal": {
    "price_id": "price_1SfBifK0WxZIdTiKu0XHqupK",
    "product_id": "prod_mensal",
    "nome": "Plano Mensal",
    "preco": 19.90,
    "descricao": "Acesso completo por 1 mês",
    "periodo": "mês"
  },
  "anual": {
    "price_id": "price_1SeRAMK0WxZIdTiKA3R5RXVI",
    "product_id": "prod_anual",
    "nome": "Plano Anual",
    "preco": 119.90,
    "descricao": "Acesso completo por 1 ano",
    "periodo": "ano",
    "badge": "2 MESES GRÁTIS"
  },
  "features": [
    "Gestão ilimitada de tutores e pets",
    "Controle completo de reservas",
    "Gestão financeira integrada",
    "Geração de documentos e contratos",
    "Caixa PDV para controle diário",
    "Suporte prioritário"
  ],
  "dias_carencia": 7
}', 'Configurações dos planos de assinatura');

-- Trigger for updated_at
CREATE TRIGGER update_configuracoes_sistema_updated_at
BEFORE UPDATE ON public.configuracoes_sistema
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();