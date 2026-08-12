export interface ConfiguracaoComprovante {
  nomeEmpresa: string;
  documento: string;
  telefone: string;
  endereco: string;
  larguraPapelMm: 58 | 80;
  mensagemRodape?: string;
}

const CONFIGURACOES_COMPROVANTE: Record<number, ConfiguracaoComprovante> = {
  2: {
    nomeEmpresa: 'EMPRESA EXEMPLO',
    documento: 'CNPJ: 99.999.999/0001-99',
    telefone: 'Whatsapp: (99) 99999-8888',
    endereco: 'Rua Exemplo, 999 - Centro - CEP: 99.999-888',
    larguraPapelMm: 80,
  },
};

export function obterConfiguracaoComprovante(tenantId: number) {
  return CONFIGURACOES_COMPROVANTE[tenantId] ?? null;
}
