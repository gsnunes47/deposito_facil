import assert from 'node:assert/strict';
import test from 'node:test';
import { obterMensagemExclusaoCliente } from '../services/clienteService.js';

function simularVendas(t, vendas) {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.ok(url.endsWith('/venda/abertas'));
    return new Response(JSON.stringify(vendas), { status: 200 });
  });
}

test('avisa o saldo restante, descontando pagamentos e ignorando outros clientes', async (t) => {
  simularVendas(t, [
    {
      cliente_id: 1,
      total: 10000,
      pagamentos: [{ valor: 2500 }, { valor: 1500 }],
    },
    { cliente_id: 1, total: 2000, pagamentos: [] },
    { cliente_id: 2, total: 99999, pagamentos: [] },
  ]);
  const mensagem = await obterMensagemExclusaoCliente({ id: 1, nome: 'Maria' });
  assert.match(mensagem, /Maria/);
  assert.match(mensagem, /2 conta\(s\) em aberto/);
  assert.match(mensagem, /80,00/);
  assert.match(mensagem, /continuar com a exclusão/);
  assert.match(mensagem, /vendas \(abertas e quitadas\) e os pagamentos/);
  assert.match(mensagem, /não pode ser desfeita/);
});

test('mantém a confirmação simples quando o cliente não tem contas abertas', async (t) => {
  simularVendas(t, [{ cliente_id: 2, total: 99999, pagamentos: [] }]);
  const mensagem = await obterMensagemExclusaoCliente({ id: 1, nome: 'Maria' });
  assert.match(mensagem, /Deseja realmente excluir cliente "Maria"/);
  assert.match(mensagem, /Todas as vendas e os pagamentos/);
  assert.match(mensagem, /não pode ser desfeita/);
});

test('não considera saldo zerado como conta em aberto', async (t) => {
  simularVendas(t, [
    { cliente_id: 1, total: 1000, pagamentos: [{ valor: 1000 }] },
  ]);
  assert.doesNotMatch(
    await obterMensagemExclusaoCliente({ id: 1, nome: 'Maria' }),
    /conta\(s\) em aberto/,
  );
});

test('interrompe a verificação se não conseguir consultar as contas', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Falha na consulta');
  });
  await assert.rejects(
    obterMensagemExclusaoCliente({ id: 1, nome: 'Maria' }),
    /Falha na consulta/,
  );
});
