import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/Navbar';
import RegistroEncomendaCard, {
  calcularCaixas,
  calcularValorPendente,
} from '../../components/RegistroEncomendaCard';
import TituloPagina from '../../components/TituloPagina';
import {
  listarEncomendasAbertas,
  listarEncomendasFechadas,
} from '../../services/encomendaService';
import { listarFornecedores } from '../../services/fornecedorService';
import {
  excluirPagamentoEncomenda,
  registrarPagamentoEncomenda,
} from '../../services/pagamentoEncomendaService';
import { listarProdutos } from '../../services/produtoService';
import styles from '../../styles/RegistroVendas.module.css';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function RegistroEncomendas() {
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [abertas, setAbertas] = useState([]);
  const [fechadas, setFechadas] = useState([]);
  const [fornecedorId, setFornecedorId] = useState('');
  const [mes, setMes] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState(null);
  const [encomendaPagamento, setEncomendaPagamento] = useState(null);
  const [pagamento, setPagamento] = useState({
    valor: '',
    forma_pagamento: '',
  });
  const [erroPagamento, setErroPagamento] = useState(null);
  const [salvandoPagamento, setSalvandoPagamento] = useState(false);

  async function carregarEncomendas() {
    const [encomendasAbertas, encomendasFechadas] = await Promise.all([
      listarEncomendasAbertas(),
      listarEncomendasFechadas(),
    ]);
    setAbertas(encomendasAbertas);
    setFechadas(encomendasFechadas);
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        const [fornecedoresCarregados, produtosCarregados] = await Promise.all([
          listarFornecedores(),
          listarProdutos(),
        ]);
        setFornecedores(fornecedoresCarregados);
        setProdutos(produtosCarregados);
        await carregarEncomendas();
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
  const fornecedoresPorId = useMemo(
    () =>
      Object.fromEntries(
        fornecedores.map((fornecedor) => [fornecedor.id, fornecedor]),
      ),
    [fornecedores],
  );

  function filtrar(encomendas) {
    return encomendas
      .filter(
        (encomenda) =>
          (!fornecedorId ||
            String(encomenda.fornecedor_id) === fornecedorId) &&
          (!mes || String(encomenda.data).slice(0, 7) === mes),
      )
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  const abertasFiltradas = filtrar(abertas);
  const fechadasFiltradas = filtrar(fechadas);
  const totalPendente = abertasFiltradas.reduce(
    (total, encomenda) => total + calcularValorPendente(encomenda),
    0,
  );

  function abrirPagamento(encomenda) {
    setEncomendaPagamento(encomenda);
    setPagamento({ valor: '', forma_pagamento: '' });
    setErroPagamento(null);
  }

  function abrirQuitacao(encomenda) {
    setEncomendaPagamento(encomenda);
    setPagamento({
      valor: (calcularValorPendente(encomenda) / 100).toFixed(2),
      forma_pagamento: '',
    });
    setErroPagamento(null);
  }

  function fecharPagamento() {
    if (!salvandoPagamento) setEncomendaPagamento(null);
  }

  async function adicionarPagamento(event) {
    event.preventDefault();
    setMensagem(null);
    setErroPagamento(null);

    const valor = Math.round(Number(pagamento.valor) * 100);
    const valorPendente = calcularValorPendente(encomendaPagamento);

    if (!Number.isFinite(valor) || valor <= 0) {
      setErroPagamento('Informe um valor maior que zero.');
      return;
    }
    if (valor > valorPendente) {
      setErroPagamento('O pagamento não pode ser maior que o valor a pagar.');
      return;
    }
    if (
      valor === valorPendente &&
      !window.confirm('Este pagamento quitará a encomenda. Deseja continuar?')
    ) {
      return;
    }

    setSalvandoPagamento(true);
    try {
      await registrarPagamentoEncomenda({
        encomenda_id: encomendaPagamento.id,
        valor,
        forma_pagamento: pagamento.forma_pagamento,
      });
      await carregarEncomendas();
      setEncomendaPagamento(null);
      setMensagem({ tipo: 'sucesso', texto: 'Pagamento registrado.' });
    } catch (error) {
      setErroPagamento(error.message);
    } finally {
      setSalvandoPagamento(false);
    }
  }

  async function removerPagamento(pagamentoSelecionado) {
    if (!window.confirm('Você tem certeza que deseja excluir este pagamento?')) {
      return;
    }
    try {
      await excluirPagamentoEncomenda(pagamentoSelecionado.id);
      await carregarEncomendas();
      setMensagem({ tipo: 'sucesso', texto: 'Pagamento excluído.' });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    }
  }

  function listarCards(encomendas, fechada = false) {
    return encomendas.map((encomenda) => (
      <RegistroEncomendaCard
        key={encomenda.id}
        encomenda={encomenda}
        produtosPorId={produtosPorId}
        fornecedor={fornecedoresPorId[encomenda.fornecedor_id]}
        fechada={fechada}
        onAdicionarPagamento={abrirPagamento}
        onQuitarEncomenda={abrirQuitacao}
        onExcluirPagamento={removerPagamento}
      />
    ));
  }

  return (
    <>
      <Navbar />
      <main className={styles.pagina}>
        <TituloPagina>Registro de Encomendas</TituloPagina>

        {mensagem && (
          <div className={`${styles.mensagem} ${styles[mensagem.tipo]}`}>
            {mensagem.texto}
          </div>
        )}

        <section className={`${styles.filtro} ${styles.filtrosEncomendas}`}>
          <div>
            <label htmlFor="fornecedor">Fornecedor</label>
            <select
              id="fornecedor"
              value={fornecedorId}
              onChange={(event) => setFornecedorId(event.target.value)}
              disabled={carregando}
            >
              <option value="">Todos os fornecedores</option>
              {fornecedores.map((fornecedor) => (
                <option key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="mes">Mês</label>
            <input
              id="mes"
              type="month"
              value={mes}
              onChange={(event) => setMes(event.target.value)}
              disabled={carregando}
            />
          </div>
        </section>

        {carregando ? (
          <p className={styles.estado}>Carregando encomendas...</p>
        ) : (
          <>
            <section className={styles.resumosEncomendas}>
              <div className={styles.resumoDebito}>
                <div>
                  <span>Total a pagar</span>
                  <small>
                    {abertasFiltradas.length}{' '}
                    {abertasFiltradas.length === 1
                      ? 'encomenda aberta'
                      : 'encomendas abertas'}
                  </small>
                </div>
                <strong>{formatadorMoeda.format(totalPendente / 100)}</strong>
              </div>
              <div className={styles.resumoDebito}>
                <div>
                  <span>Total de caixas</span>
                  <small>Soma das quantidades encomendadas</small>
                </div>
                <strong>{calcularCaixas(abertasFiltradas)}</strong>
              </div>
            </section>

            <section className={styles.secao}>
              <h2>Encomendas em aberto</h2>
              {abertasFiltradas.length === 0 ? (
                <p className={styles.estado}>Nenhuma encomenda em aberto.</p>
              ) : (
                listarCards(abertasFiltradas)
              )}
            </section>

            <section className={styles.secao}>
              <h2>Encomendas pagas</h2>
              {fechadasFiltradas.length === 0 ? (
                <p className={styles.estado}>Nenhuma encomenda paga.</p>
              ) : (
                listarCards(fechadasFiltradas, true)
              )}
            </section>
          </>
        )}
      </main>

      {encomendaPagamento && (
        <div className={styles.fundoModal} onMouseDown={fecharPagamento}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-pagamento-encomenda"
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
            <h2 id="titulo-pagamento-encomenda">Registrar pagamento</h2>
            <p>
              A pagar:{' '}
              <strong>
                {formatadorMoeda.format(
                  calcularValorPendente(encomendaPagamento) / 100,
                )}
              </strong>
            </p>
            {erroPagamento && (
              <div className={`${styles.mensagem} ${styles.erro}`}>
                {erroPagamento}
              </div>
            )}
            <form onSubmit={adicionarPagamento}>
              <label htmlFor="valor-encomenda">Valor</label>
              <input
                id="valor-encomenda"
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
              <label htmlFor="forma-pagamento-encomenda">
                Forma de pagamento
              </label>
              <select
                id="forma-pagamento-encomenda"
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
                {salvandoPagamento ? 'Registrando...' : 'Registrar pagamento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
