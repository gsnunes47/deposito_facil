import { describe, expect, it } from 'vitest';
import { obterConfiguracaoComprovante } from '../../src/config/comprovantes.js';

describe('Configuração de comprovantes', () => {
  it('deve retornar a configuração atual para o tenant 2', () => {
    expect(obterConfiguracaoComprovante(2)).toEqual({
      nomeEmpresa: 'BANANAS CLIMATIZADAS JOSÉ LUIZ - EQUIPE MAX LHP',
      documento: '',
      telefone: 'Whatsapp: (11) 98361-0736',
      endereco:
        'Rua Alves Seixas, 267 - Vila União - CEP:03920-050',
      larguraPapelMm: 80,
    });
  });

  it('não deve reutilizar a configuração em outro tenant', () => {
    expect(obterConfiguracaoComprovante(1)).toBeNull();
    expect(obterConfiguracaoComprovante(5)).toBeNull();
  });
});
