import { useState } from 'react';
import Navbar from './Navbar';
import TituloPagina from './TituloPagina';
import SelectPesquisavel, { PREFIXO_NOVO_ITEM } from './SelectPesquisavel';
import styles from '../styles/Movimentacao.module.css';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function FormularioMovimentacao({
  titulo,
  produtos,
  entidades,
  rotuloEntidade,
  rotuloTotal,
  textoBotao,
  mensagemSucesso,
  onSubmit,
  carregando,
  erroCarregamento,
  exibirData = false,
  permitirNovaEntidade = false,
  selecaoIncremental = false,
  controlesQuantidade = false,
  preencherPrecoPadrao = false,
  permitirPagamento = false,
  children,
}) {
  const [entidadeId, setEntidadeId] = useState('');
  const [data, setData] = useState('');
  const [valores, setValores] = useState({});
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [itemParaAdicionar, setItemParaAdicionar] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [registrarPagamento, setRegistrarPagamento] = useState(false);
  const [tipoPagamento, setTipoPagamento] = useState('TOTAL');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [valorPagamento, setValorPagamento] = useState('');

  const produtosExibidos = selecaoIncremental
    ? itensSelecionados
        .map((id) => produtos.find((produto) => produto.id === id))
        .filter(Boolean)
    : produtos;

  const total = produtosExibidos.reduce((soma, produto) => {
    const item = valores[produto.id] ?? {};
    return soma + (Number(item.quantidade) || 0) * (Number(item.preco) || 0);
  }, 0);

  function alterarProduto(produtoId, campo, valor) {
    setValores((valoresAtuais) => ({
      ...valoresAtuais,
      [produtoId]: {
        ...valoresAtuais[produtoId],
        [campo]: valor,
      },
    }));
  }

  function ajustarQuantidade(produtoId, diferenca) {
    const quantidadeAtual = Number(valores[produtoId]?.quantidade) || 0;
    alterarProduto(
      produtoId,
      'quantidade',
      String(Math.max(1, quantidadeAtual + diferenca)),
    );
  }

  function adicionarItem(valor) {
    const produtoId = Number(valor);
    if (!Number.isInteger(produtoId)) return;
    const produto = produtos.find((item) => item.id === produtoId);

    setItensSelecionados((atuais) =>
      atuais.includes(produtoId) ? atuais : [...atuais, produtoId],
    );
    setValores((atuais) => ({
      ...atuais,
      [produtoId]: {
        ...atuais[produtoId],
        quantidade: atuais[produtoId]?.quantidade || '1',
        ...(preencherPrecoPadrao && produto?.preco_padrao != null
          ? { preco: (Number(produto.preco_padrao) / 100).toFixed(2) }
          : {}),
      },
    }));
    setItemParaAdicionar('');
  }

  function removerItem(produtoId) {
    setItensSelecionados((atuais) => atuais.filter((id) => id !== produtoId));
    setValores((atuais) => {
      const novosValores = { ...atuais };
      delete novosValores[produtoId];
      return novosValores;
    });
  }

  function prepararProdutos() {
    const produtosSelecionados = [];

    for (const produto of produtosExibidos) {
      const item = valores[produto.id] ?? {};
      const possuiQuantidade =
        item.quantidade !== '' && item.quantidade != null;
      const possuiPreco = item.preco !== '' && item.preco != null;

      if (!possuiQuantidade && !possuiPreco) continue;

      const quantidade = Number(item.quantidade);
      const preco = Number(item.preco);

      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        throw new Error(
          `Informe uma quantidade inteira maior que zero para ${produto.nome}.`,
        );
      }

      if (!Number.isFinite(preco) || preco <= 0) {
        throw new Error(
          `Informe um preço maior que zero para ${produto.nome}.`,
        );
      }

      produtosSelecionados.push({
        id: produto.id,
        quantidade,
        valor_unitario: Math.round(preco * 100),
      });
    }

    if (produtosSelecionados.length === 0) {
      throw new Error('Informe ao menos um produto ou serviço.');
    }

    return produtosSelecionados;
  }

  function prepararPagamento(produtosSelecionados) {
    if (!permitirPagamento || !registrarPagamento) return undefined;

    if (!formaPagamento) {
      throw new Error('Selecione a forma de pagamento.');
    }

    if (tipoPagamento === 'TOTAL') {
      return { forma_pagamento: formaPagamento, quitar: true };
    }

    const totalCentavos = produtosSelecionados.reduce(
      (soma, item) => soma + item.quantidade * item.valor_unitario,
      0,
    );
    const valorCentavos = Math.round(Number(valorPagamento) * 100);

    if (!Number.isInteger(valorCentavos) || valorCentavos <= 0) {
      throw new Error('Informe um valor de pagamento maior que zero.');
    }

    if (valorCentavos >= totalCentavos) {
      throw new Error(
        'Para pagar o valor completo, selecione Pagamento total.',
      );
    }

    return {
      forma_pagamento: formaPagamento,
      valor: valorCentavos,
    };
  }

  function preencherMetadePagamento() {
    const totalCentavos = Math.round(total * 100);
    const metade = Math.floor(totalCentavos / 2);
    setValorPagamento((metade / 100).toFixed(2));
  }

  async function enviarFormulario(event) {
    event.preventDefault();
    setMensagem(null);

    try {
      if (!entidadeId) {
        throw new Error(`Selecione um ${rotuloEntidade.toLowerCase()}.`);
      }

      const produtosSelecionados = prepararProdutos();
      const pagamento = prepararPagamento(produtosSelecionados);
      setEnviando(true);

      await onSubmit({
        ...(String(entidadeId).startsWith(PREFIXO_NOVO_ITEM)
          ? {
              entidade_nome: String(entidadeId).slice(PREFIXO_NOVO_ITEM.length),
            }
          : { entidade_id: Number(entidadeId) }),
        produtos: produtosSelecionados,
        ...(data && { data }),
        ...(pagamento && { pagamento }),
      });

      setEntidadeId('');
      setData('');
      setValores({});
      setItensSelecionados([]);
      setItemParaAdicionar('');
      setRegistrarPagamento(false);
      setTipoPagamento('TOTAL');
      setFormaPagamento('');
      setValorPagamento('');
      setMensagem({ tipo: 'sucesso', texto: mensagemSucesso });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className={styles.pagina}>
        <TituloPagina>{titulo}</TituloPagina>

        {(mensagem || erroCarregamento) && (
          <div
            className={`${styles.mensagem} ${styles[mensagem?.tipo ?? 'erro']}`}
          >
            {mensagem?.texto ?? erroCarregamento}
          </div>
        )}

        <form className={styles.formulario} onSubmit={enviarFormulario}>
          {carregando ? (
            <p className={styles.estado}>Carregando dados...</p>
          ) : produtos.length === 0 ? (
            <p className={styles.estado}>
              Nenhum produto ou serviço cadastrado.
            </p>
          ) : (
            <>
              {selecaoIncremental && (
                <div className={styles.seletorItem}>
                  <label htmlFor="item-venda">Adicionar item</label>
                  <SelectPesquisavel
                    id="item-venda"
                    value={itemParaAdicionar}
                    onChange={adicionarItem}
                    options={produtos
                      .filter(
                        (produto) => !itensSelecionados.includes(produto.id),
                      )
                      .map((produto) => ({
                        value: produto.id,
                        label: produto.nome,
                        tipo: produto.tipo,
                      }))}
                    searchPlaceholder="Digite para pesquisar produtos e serviços"
                    limparAposSelecionar
                  />
                </div>
              )}

              {selecaoIncremental && produtosExibidos.length === 0 ? (
                <p className={styles.estado}>
                  Pesquise e adicione os itens da venda.
                </p>
              ) : (
                <div className={styles.listaProdutos}>
                  {produtosExibidos.map((produto) => {
                    const item = valores[produto.id] ?? {};

                    return (
                      <div className={styles.produto} key={produto.id}>
                        <div className={styles.identificacaoProduto}>
                          <label
                            className={styles.nomeProduto}
                            htmlFor={`quantidade-${produto.id}`}
                          >
                            {produto.nome}
                          </label>
                        </div>

                        <div className={styles.camposProduto}>
                          <div>
                            <label htmlFor={`quantidade-${produto.id}`}>
                              Quantidade
                            </label>
                            {controlesQuantidade ? (
                              <div className={styles.controleQuantidade}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    ajustarQuantidade(produto.id, -1)
                                  }
                                  aria-label={`Diminuir quantidade de ${produto.nome}`}
                                >
                                  −
                                </button>
                                <input
                                  id={`quantidade-${produto.id}`}
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={item.quantidade ?? ''}
                                  onChange={(event) =>
                                    alterarProduto(
                                      produto.id,
                                      'quantidade',
                                      event.target.value,
                                    )
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    ajustarQuantidade(produto.id, 1)
                                  }
                                  aria-label={`Aumentar quantidade de ${produto.nome}`}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <input
                                id={`quantidade-${produto.id}`}
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantidade ?? ''}
                                onChange={(event) =>
                                  alterarProduto(
                                    produto.id,
                                    'quantidade',
                                    event.target.value,
                                  )
                                }
                              />
                            )}
                          </div>

                          <div>
                            <label htmlFor={`preco-${produto.id}`}>
                              Preço unitário
                            </label>
                            <input
                              id={`preco-${produto.id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.preco ?? ''}
                              onChange={(event) =>
                                alterarProduto(
                                  produto.id,
                                  'preco',
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                          {selecaoIncremental && (
                            <button
                              className={styles.botaoRemoverItem}
                              type="button"
                              onClick={() => removerItem(produto.id)}
                              aria-label={`Retirar ${produto.nome} da venda`}
                              title="Retirar item"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className={styles.dadosMovimentacao}>
            <div className={styles.campo}>
              <label htmlFor="entidade">{rotuloEntidade}</label>
              <SelectPesquisavel
                id="entidade"
                value={entidadeId}
                onChange={setEntidadeId}
                options={entidades.map((entidade) => ({
                  value: entidade.id,
                  label: entidade.nome,
                }))}
                permitirNovo={permitirNovaEntidade}
                rotuloNovo={(nome) =>
                  `Cadastrar novo ${rotuloEntidade.toLowerCase()}: ${nome}`
                }
                searchPlaceholder={`Digite para pesquisar ${rotuloEntidade.toLowerCase()}`}
                required
              />
            </div>

            {exibirData && (
              <div className={styles.campo}>
                <label htmlFor="data">Data</label>
                <input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(event) => setData(event.target.value)}
                />
              </div>
            )}

            <div className={styles.total}>
              <span>{rotuloTotal}</span>
              <strong>{formatadorMoeda.format(total)}</strong>
            </div>
          </div>

          {permitirPagamento && (
            <section className={styles.pagamentoInicial}>
              <label className={styles.opcaoPagamento}>
                <input
                  type="checkbox"
                  checked={registrarPagamento}
                  onChange={(event) =>
                    setRegistrarPagamento(event.target.checked)
                  }
                />
                Registrar pagamento agora
              </label>

              {registrarPagamento && (
                <div className={styles.camposPagamento}>
                  <div className={styles.campo}>
                    <label htmlFor="tipo-pagamento-inicial">Pagamento</label>
                    <select
                      id="tipo-pagamento-inicial"
                      value={tipoPagamento}
                      onChange={(event) => setTipoPagamento(event.target.value)}
                    >
                      <option value="TOTAL">Total — quitar a venda</option>
                      <option value="PARCIAL">
                        Parcial — manter saldo aberto
                      </option>
                    </select>
                  </div>

                  <div className={styles.campo}>
                    <label htmlFor="forma-pagamento-inicial">
                      Forma de pagamento
                    </label>
                    <select
                      id="forma-pagamento-inicial"
                      value={formaPagamento}
                      onChange={(event) =>
                        setFormaPagamento(event.target.value)
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="PIX">PIX</option>
                      <option value="CARTAO_CREDITO">Cartão de crédito</option>
                      <option value="CARTAO_DEBITO">Cartão de débito</option>
                    </select>
                  </div>

                  {tipoPagamento === 'PARCIAL' && (
                    <div className={styles.campo}>
                      <label htmlFor="valor-pagamento-inicial">
                        Valor recebido
                      </label>
                      <div className={styles.valorPagamento}>
                        <input
                          id="valor-pagamento-inicial"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={valorPagamento}
                          onChange={(event) =>
                            setValorPagamento(event.target.value)
                          }
                          placeholder="0,00"
                        />
                        <button
                          type="button"
                          onClick={preencherMetadePagamento}
                          disabled={total <= 0.01}
                        >
                          Usar metade
                        </button>
                      </div>
                    </div>
                  )}

                  <p className={styles.ajudaPagamento}>
                    {tipoPagamento === 'TOTAL'
                      ? 'A venda será criada como paga.'
                      : 'O pagamento será registrado e o restante continuará em aberto.'}
                  </p>
                </div>
              )}
            </section>
          )}

          <button
            className={styles.botaoConfirmar}
            type="submit"
            disabled={enviando || carregando || produtos.length === 0}
          >
            {enviando ? 'Processando...' : textoBotao}
          </button>
        </form>

        {children}
      </main>
    </>
  );
}
