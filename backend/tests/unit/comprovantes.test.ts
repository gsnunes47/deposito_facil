import { describe, expect, it } from 'vitest';
import { obterConfiguracaoComprovante } from '../../src/config/comprovantes.js';

describe('Configuração de comprovantes', () => {
  it('deve retornar a configuração atual para o tenant 2', () => {
    expect(obterConfiguracaoComprovante(2)).toEqual({
      nomeEmpresa: 'DEPOSITO DE FRUTAS',
      documento: '',
      telefone: 'Whatsapp: (11) 99999-9999',
      endereco:
        'Rua Teste de Abril, 04 - Vila Testando - CEP:99999-999',
      larguraPapelMm: 80,
    });
  });

  it('não deve reutilizar a configuração em outro tenant', () => {
    expect(obterConfiguracaoComprovante(1)).toBeNull();
    expect(obterConfiguracaoComprovante(5)).toBeNull();
  });
});
