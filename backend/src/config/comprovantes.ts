export interface ConfiguracaoComprovante {
  nomeEmpresa?: string;
  documento?: string;
  telefone?: string;
  endereco?: string;
  larguraPapelMm: 58 | 80;
  mensagemRodape?: string;
}

const CONFIGURACOES_COMPROVANTE: Record<number, ConfiguracaoComprovante> = {
  2: {
    nomeEmpresa: 'BANANAS CLIMATIZADAS JOSÉ LUIZ - EQUIPE MAX LHP',
    documento: '',
    telefone: 'Whatsapp: (11) 98361-0736',
    endereco: 'Rua Alves Seixas, 267 - Vila União - CEP:03920-050',
    larguraPapelMm: 80,
  },
};

export function obterConfiguracaoComprovante(tenantId: number) {
  return CONFIGURACOES_COMPROVANTE[tenantId] ?? null;
}
