import assert from 'node:assert/strict';
import test from 'node:test';

import {
  imprimirComprovanteVenda,
  imprimirComprovantesVenda,
} from '../services/impressaoService.js';

function criarClassList() {
  const classes = new Set();

  return {
    add: (...nomes) => nomes.forEach((nome) => classes.add(nome)),
    contains: (nome) => classes.has(nome),
    remove: (...nomes) => nomes.forEach((nome) => classes.delete(nome)),
    toggle(nome, ativo) {
      if (ativo) classes.add(nome);
      else classes.delete(nome);
    },
  };
}

function prepararDom() {
  const elemento = { classList: criarClassList() };
  let estiloAdicionado;
  let chamadasPrint = 0;
  let fluxoContinuoDurantePrint = false;

  globalThis.document = {
    title: 'Depósito Fácil',
    body: { classList: criarClassList() },
    head: {
      appendChild(estilo) {
        estiloAdicionado = estilo;
      },
    },
    createElement: () => ({ id: '', textContent: '' }),
    getElementById(id) {
      if (id === 'comprovante') return elemento;
      if (id === 'estilos-impressao-documento') {
        return { remove() {} };
      }
      return null;
    },
  };
  globalThis.window = {
    print() {
      chamadasPrint += 1;
      fluxoContinuoDurantePrint = elemento.classList.contains(
        'impressao-fluxo-continuo',
      );
    },
  };

  return {
    elemento,
    obterChamadasPrint: () => chamadasPrint,
    obterCss: () => estiloAdicionado.textContent,
    obterFluxoContinuoDurantePrint: () => fluxoContinuoDurantePrint,
  };
}

function criarComprovantes(quantidade) {
  return Array.from({ length: quantidade }, (_, indice) => ({
    configuracao: { larguraPapelMm: 80 },
    venda: { id: indice + 1 },
  }));
}

test('mantém a impressão individual sem ativar o fluxo contínuo', () => {
  const dom = prepararDom();

  imprimirComprovanteVenda(criarComprovantes(1)[0], 'comprovante');

  assert.equal(dom.obterChamadasPrint(), 1);
  assert.equal(dom.obterFluxoContinuoDurantePrint(), false);
});

test('imprime várias vendas em um único trabalho e sem quebra forçada', () => {
  const dom = prepararDom();

  imprimirComprovantesVenda(criarComprovantes(3), 'comprovante');

  assert.equal(dom.obterChamadasPrint(), 1);
  assert.equal(dom.obterFluxoContinuoDurantePrint(), true);
  assert.match(dom.obterCss(), /break-before: auto/);
  assert.match(dom.obterCss(), /break-after: auto/);
  assert.doesNotMatch(
    dom.obterCss(),
    /(?:break|page-break)-(?:before|after): always/,
  );
});

test('uma seleção longa continua sendo enviada em um único trabalho', () => {
  const dom = prepararDom();

  imprimirComprovantesVenda(criarComprovantes(50), 'comprovante');

  assert.equal(dom.obterChamadasPrint(), 1);
});
