import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import TituloPagina from '../../components/TituloPagina';
import SelectPesquisavel from '../../components/SelectPesquisavel';
import RegistroVendaCard, {
  calcularDebito,
} from '../../components/RegistroVendaCard';
import { listarClientes } from '../../services/clienteService';
import {
  excluirPagamento,
  quitarVendas,
  registrarPagamento,
} from '../../services/pagamentoService';
import { listarProdutos } from '../../services/produtoService';
import {
  excluirVenda,
  listarVendasAbertas,
  listarVendasFechadas,
} from '../../services/vendaService';
import styles from '../../styles/RegistroVendas.module.css';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function RegistroVendas() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendasAbertas, setVendasAbertas] = useState([]);
  const [vendasFechadas, setVendasFechadas] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState(null);
  const [vendaPagamento, setVendaPagamento] = useState(null);
  const [pagamento, setPagamento] = useState({
    valor: '',
    forma_pagamento: '',
  });
  const [erroPagamento, setErroPagamento] = useState(null);
  const [salvandoPagamento, setSalvandoPagamento] = useState(false);
  const [vendasSelecionadas, setVendasSelecionadas] = useState([]);
  const [vendasQuitacao, setVendasQuitacao] = useState(null);
  const [formaQuitacao, setFormaQuitacao] = useState('');
  const [salvandoQuitacao, setSalvandoQuitacao] = useState(false);
  const [mesVendasAbertas, setMesVendasAbertas] = useState('');
  const [mesVendasFechadas, setMesVendasFechadas] = useState('');

  async function carregarVendas() {
    const [abertas, fechadas] = await Promise.all([
      listarVendasAbertas(),
      listarVendasFechadas(),
    ]);

    setVendasAbertas(abertas);
    setVendasFechadas(fechadas);
    setVendasSelecionadas([]);
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        const [clientesCarregados, produtosCarregados] = await Promise.all([
          listarClientes(),
          listarProdutos(),
        ]);

        setClientes(clientesCarregados);
        setProdutos(produtosCarregados);
        await carregarVendas();
      } catch (error) {
        setMensagem({ tipo: 'erro', texto: error.message });
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const produtosPorId = useMemo(
    () => Object.fromEntries(produtos.map((produto) => [produto.id, produto])),
    [produtos],
  );

  const vendasAbertasFiltradas = vendasAbertas.filter(
    (venda) =>
      String(venda.cliente_id) === clienteId &&
      (!mesVendasAbertas || venda.data?.slice(0, 7) === mesVendasAbertas),
  );
  const vendasFechadasFiltradas = vendasFechadas.filter(
    (venda) =>
      String(venda.cliente_id) === clienteId &&
      (!mesVendasFechadas || venda.data?.slice(0, 7) === mesVendasFechadas),
  );
  const debitoTotal = vendasAbertasFiltradas.reduce(
    (total, venda) => total + calcularDebito(venda),
    0,
  );
  const totalVendasFechadas = vendasFechadasFiltradas.reduce(
    (total, venda) => total + Number(venda.total ?? 0),
    0,
  );
  const vendasSelecionadasDetalhes = vendasAbertasFiltradas.filter((venda) =>
    vendasSelecionadas.includes(venda.id),
  );
  const totalSelecionado = vendasSelecionadasDetalhes.reduce(
    (total, venda) => total + calcularDebito(venda),
    0,
  );
  const todasSelecionadas =
    vendasAbertasFiltradas.length > 0 &&
    vendasSelecionadasDetalhes.length === vendasAbertasFiltradas.length;

  function alternarVendaSelecionada(vendaId) {
    setVendasSelecionadas((atuais) =>
      atuais.includes(vendaId)
        ? atuais.filter((id) => id !== vendaId)
        : [...atuais, vendaId],
    );
  }

  function alternarTodasVendas() {
    setVendasSelecionadas(
      todasSelecionadas ? [] : vendasAbertasFiltradas.map((venda) => venda.id),
    );
  }

  function abrirQuitacao(vendas) {
    setVendasQuitacao(vendas);
    setFormaQuitacao('');
  }

  function fecharQuitacao() {
    if (salvandoQuitacao) return;
    setVendasQuitacao(null);
  }

  async function confirmarQuitacao(event) {
    event.preventDefault();
    setMensagem(null);
    setSalvandoQuitacao(true);

    try {
      const resultado = await quitarVendas(
        vendasQuitacao.map((venda) => venda.id),
        formaQuitacao,
      );
      await carregarVendas();
      setVendasQuitacao(null);
      setMensagem({ tipo: 'sucesso', texto: resultado.message });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    } finally {
      setSalvandoQuitacao(false);
    }
  }

  function abrirPagamento(venda) {
    setVendaPagamento(venda);
    setPagamento({ valor: '', forma_pagamento: '' });
    setErroPagamento(null);
  }

  function fecharPagamento() {
    if (salvandoPagamento) return;
    setVendaPagamento(null);
  }

  async function adicionarPagamento(event) {
    event.preventDefault();
    setMensagem(null);
    setErroPagamento(null);

    const valor = Math.round(Number(pagamento.valor) * 100);
    const debito = calcularDebito(vendaPagamento);

    if (!Number.isFinite(valor) || valor <= 0) {
      setErroPagamento('Informe um valor maior que zero.');
      return;
    }

    if (valor > debito) {
      setErroPagamento('O pagamento não pode ser maior que o valor a pagar.');
      return;
    }

    if (
      valor === debito &&
      !window.confirm('Este pagamento fechará a venda. Deseja continuar?')
    ) {
      return;
    }

    setSalvandoPagamento(true);

    try {
      await registrarPagamento({
        venda_id: vendaPagamento.id,
        valor,
        forma_pagamento: pagamento.forma_pagamento,
      });
      await carregarVendas();
      setVendaPagamento(null);
      setMensagem({ tipo: 'sucesso', texto: 'Pagamento adicionado.' });
    } catch (error) {
      setErroPagamento(error.message);
    } finally {
      setSalvandoPagamento(false);
    }
  }

  async function removerPagamento(pagamentoSelecionado) {
    if (
      !window.confirm('Você tem certeza que deseja excluir este pagamento?')
    ) {
      return;
    }

    try {
      await excluirPagamento(pagamentoSelecionado.id);
      await carregarVendas();
      setMensagem({ tipo: 'sucesso', texto: 'Pagamento excluído.' });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    }
  }

  async function removerVenda(venda) {
    if (!window.confirm('Tem certeza que deseja deletar esta venda?')) {
      return;
    }

    try {
      await excluirVenda(venda.id);
      await carregarVendas();
      setMensagem({ tipo: 'sucesso', texto: 'Venda deletada.' });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    }
  }

  return (
    <>
      <Navbar />

      <main className={styles.pagina}>
        <TituloPagina>Registro de Vendas</TituloPagina>

        {mensagem && (
          <div className={`${styles.mensagem} ${styles[mensagem.tipo]}`}>
            {mensagem.texto}
          </div>
        )}

        <section className={styles.filtro}>
          <label htmlFor="cliente">Cliente</label>
          <SelectPesquisavel
            id="cliente"
            value={clienteId}
            onChange={(value) => {
              setClienteId(value);
              setVendasSelecionadas([]);
            }}
            options={clientes.map((cliente) => ({
              value: cliente.id,
              label: cliente.nome,
            }))}
            searchPlaceholder="Pesquise um cliente"
            disabled={carregando}
          />
        </section>

        {carregando ? (
          <p className={styles.estado}>Carregando vendas...</p>
        ) : !clienteId ? (
          <p className={styles.estado}>
            Selecione um cliente para visualizar as vendas.
          </p>
        ) : (
          <>
            <section className={styles.resumoDebito}>
              <div>
                <span>Débito total</span>
                <small>
                  {vendasAbertasFiltradas.length}{' '}
                  {vendasAbertasFiltradas.length === 1
                    ? 'venda aberta'
                    : 'vendas abertas'}
                </small>
              </div>
              <strong>{formatadorMoeda.format(debitoTotal / 100)}</strong>
            </section>

            <section className={styles.secao}>
              <div className={styles.cabecalhoAbertas}>
                <h2>Vendas Abertas</h2>

                <div className={styles.controlesAbertas}>
                  {vendasAbertasFiltradas.length > 0 && (
                    <label className={styles.selecionarTodas}>
                      <input
                        type="checkbox"
                        checked={todasSelecionadas}
                        onChange={alternarTodasVendas}
                      />
                      Selecionar todas
                    </label>
                  )}

                  <label className={styles.filtroMes}>
                    <span>Mês</span>
                    <input
                      type="month"
                      value={mesVendasAbertas}
                      onChange={(event) => {
                        setMesVendasAbertas(event.target.value);
                        setVendasSelecionadas([]);
                      }}
                    />
                  </label>
                </div>
              </div>

              {vendasSelecionadasDetalhes.length > 0 && (
                <div className={styles.barraQuitacao}>
                  <div>
                    <strong>
                      {vendasSelecionadasDetalhes.length}{' '}
                      {vendasSelecionadasDetalhes.length === 1
                        ? 'venda selecionada'
                        : 'vendas selecionadas'}
                    </strong>
                    <span>
                      Total: {formatadorMoeda.format(totalSelecionado / 100)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => abrirQuitacao(vendasSelecionadasDetalhes)}
                  >
                    Quitar selecionadas
                  </button>
                </div>
              )}
              {vendasAbertasFiltradas.length === 0 ? (
                <p className={styles.estado}>
                  {mesVendasAbertas
                    ? 'Nenhuma venda aberta neste mês.'
                    : 'Nenhuma venda aberta.'}
                </p>
              ) : (
                vendasAbertasFiltradas.map((venda) => (
                  <RegistroVendaCard
                    key={venda.id}
                    venda={venda}
                    produtosPorId={produtosPorId}
                    selecionada={vendasSelecionadas.includes(venda.id)}
                    onSelecionar={alternarVendaSelecionada}
                    onAdicionarPagamento={abrirPagamento}
                    onQuitarVenda={(vendaSelecionada) =>
                      abrirQuitacao([vendaSelecionada])
                    }
                    onExcluirPagamento={removerPagamento}
                    onExcluirVenda={removerVenda}
                  />
                ))
              )}
            </section>

            <section className={`${styles.resumoDebito} ${styles.resumoFechadas}`}>
              <div>
                <span>Total de vendas fechadas</span>
                <small>
                  {vendasFechadasFiltradas.length}{' '}
                  {vendasFechadasFiltradas.length === 1
                    ? 'venda fechada'
                    : 'vendas fechadas'}
                </small>
              </div>
              <strong>
                {formatadorMoeda.format(totalVendasFechadas / 100)}
              </strong>
            </section>

            <section className={styles.secao}>
              <div className={styles.cabecalhoAbertas}>
                <h2>Vendas Fechadas</h2>

                <label className={styles.filtroMes}>
                  <span>Mês</span>
                  <input
                    type="month"
                    value={mesVendasFechadas}
                    onChange={(event) =>
                      setMesVendasFechadas(event.target.value)
                    }
                  />
                </label>
              </div>
              {vendasFechadasFiltradas.length === 0 ? (
                <p className={styles.estado}>
                  {mesVendasFechadas
                    ? 'Nenhuma venda fechada neste mês.'
                    : 'Nenhuma venda fechada.'}
                </p>
              ) : (
                vendasFechadasFiltradas.map((venda) => (
                  <RegistroVendaCard
                    key={venda.id}
                    venda={venda}
                    produtosPorId={produtosPorId}
                    fechada
                  />
                ))
              )}
            </section>
          </>
        )}
      </main>

      {vendaPagamento && (
        <div className={styles.fundoModal} onMouseDown={fecharPagamento}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-pagamento"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className={styles.fecharModal}
              type="button"
              onClick={fecharPagamento}
              aria-label="Fechar"
            >
              ×
            </button>

            <h2 id="titulo-pagamento">Adicionar pagamento</h2>
            <p>
              A pagar:{' '}
              <strong>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(calcularDebito(vendaPagamento) / 100)}
              </strong>
            </p>

            {erroPagamento && (
              <div className={`${styles.mensagem} ${styles.erro}`}>
                {erroPagamento}
              </div>
            )}

            <form onSubmit={adicionarPagamento}>
              <label htmlFor="valor">Valor</label>
              <input
                id="valor"
                type="number"
                min="0.01"
                step="0.01"
                value={pagamento.valor}
                onChange={(event) =>
                  setPagamento((atual) => ({
                    ...atual,
                    valor: event.target.value,
                  }))
                }
                required
              />

              <label htmlFor="forma-pagamento">Forma de pagamento</label>
              <select
                id="forma-pagamento"
                value={pagamento.forma_pagamento}
                onChange={(event) =>
                  setPagamento((atual) => ({
                    ...atual,
                    forma_pagamento: event.target.value,
                  }))
                }
                required
              >
                <option value="">Selecione</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="PIX">Pix</option>
                <option value="CARTAO_CREDITO">Cartão de crédito</option>
                <option value="CARTAO_DEBITO">Cartão de débito</option>
              </select>

              <button type="submit" disabled={salvandoPagamento}>
                {salvandoPagamento ? 'Adicionando...' : 'Adicionar pagamento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {vendasQuitacao && (
        <div className={styles.fundoModal} onMouseDown={fecharQuitacao}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-quitacao"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className={styles.fecharModal}
              type="button"
              onClick={fecharQuitacao}
              aria-label="Fechar"
            >
              ×
            </button>

            <h2 id="titulo-quitacao">
              {vendasQuitacao.length === 1
                ? 'Quitar venda'
                : 'Quitar vendas selecionadas'}
            </h2>
            <p>
              {vendasQuitacao.length}{' '}
              {vendasQuitacao.length === 1 ? 'venda' : 'vendas'} —{' '}
              <strong>
                {formatadorMoeda.format(
                  vendasQuitacao.reduce(
                    (total, venda) => total + calcularDebito(venda),
                    0,
                  ) / 100,
                )}
              </strong>
            </p>

            <form onSubmit={confirmarQuitacao}>
              <label htmlFor="forma-quitacao">Forma de pagamento</label>
              <select
                id="forma-quitacao"
                value={formaQuitacao}
                onChange={(event) => setFormaQuitacao(event.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="PIX">Pix</option>
                <option value="CARTAO_CREDITO">Cartão de crédito</option>
                <option value="CARTAO_DEBITO">Cartão de débito</option>
              </select>

              <button type="submit" disabled={salvandoQuitacao}>
                {salvandoQuitacao ? 'Quitando...' : 'Confirmar quitação'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
