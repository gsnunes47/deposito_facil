import { describe, expect, it } from 'vitest';
import { obterConfiguracaoComprovante } from '../../src/config/comprovantes.js';

describe('Configuração de comprovantes', () => {
  it('deve retornar a configuração fictícia para o tenant 2', () => {
    expect(obterConfiguracaoComprovante(2)).toEqual({
      nomeEmpresa: 'EMPRESA EXEMPLO DO TENANT 2',
      documento: 'CNPJ: 99.999.999/0001-99',
      telefone: 'Whatsapp: (99) 99999-8888',
      endereco:
        'Rua Exemplo, 999 - Centro - CEP: 99.999-888',
      larguraPapelMm: 80,
    });
  });

  it('não deve reutilizar a configuração em outro tenant', () => {
    expect(obterConfiguracaoComprovante(1)).toBeNull();
    expect(obterConfiguracaoComprovante(5)).toBeNull();
  });
});
