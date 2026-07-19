import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import TituloPagina from '../../components/TituloPagina';
import SelectPesquisavel from '../../components/SelectPesquisavel';
import { encontrarRelatorio } from '../../config/relatorios';
import { listarClientes } from '../../services/clienteService';
import { gerarRelatorio } from '../../services/relatorioService';
import styles from '../../styles/Relatorios.module.css';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const nomesFormaPagamento = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
};

function dataLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function filtrosIniciais() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  return {
    data_inicio: dataLocal(inicioMes),
    data_fim: dataLocal(hoje),
    cliente_id: '',
    forma_pagamento: '',
  };
}

function formatarData(data) {
  const [ano, mes, dia] = String(data).slice(0, 10).split('-').map(Number);

  return new Intl.DateTimeFormat('pt-BR').format(new Date(ano, mes - 1, dia));
}

function Valor({ children, negativo = false }) {
  return (
    <strong className={negativo ? styles.valorNegativo : undefined}>
      {formatadorMoeda.format(Number(children ?? 0) / 100)}
    </strong>
  );
}

function CartaoMetrica({ rotulo, valor, detalhe, negativo = false }) {
  return (
    <div className={styles.metrica}>
      <span>{rotulo}</span>
      <Valor negativo={negativo}>{valor}</Valor>
      {detalhe && <small>{detalhe}</small>}
    </div>
  );
}

function ResultadoContasAbertas({ resultado }) {
  return (
    <>
      <div className={styles.metricas}>
        <CartaoMetrica
          rotulo="Saldo em aberto"
          valor={resultado.resumo.saldo}
          detalhe={`${resultado.resumo.quantidade} venda(s) aberta(s)`}
        />
        <CartaoMetrica rotulo="Total original" valor={resultado.resumo.total} />
        <CartaoMetrica
          rotulo="Já recebido"
          valor={resultado.resumo.total_pago}
        />
      </div>

      {resultado.registros.length === 0 ? (
        <p className={styles.estado}>Nenhuma conta em aberto no período.</p>
      ) : (
        <div className={styles.tabelaContainer}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Recebido</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {resultado.registros.map((registro) => (
                <tr key={registro.venda_id}>
                  <td>{formatarData(registro.data)}</td>
                  <td>{registro.cliente}</td>
                  <td>
                    <Valor>{registro.total}</Valor>
                  </td>
                  <td>
                    <Valor>{registro.total_pago}</Valor>
                  </td>
                  <td>
                    <Valor>{registro.saldo}</Valor>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ResultadoLucro({ resultado }) {
  return (
    <div className={styles.metricas}>
      <CartaoMetrica
        rotulo="Vendas faturadas"
        valor={resultado.total_vendas_faturadas}
      />
      <CartaoMetrica rotulo="Despesas" valor={resultado.total_despesas} />
      <CartaoMetrica rotulo="Encomendas" valor={resultado.total_encomendas} />
      <CartaoMetrica
        rotulo="Resultado líquido"
        valor={resultado.lucro_liquido}
        negativo={resultado.lucro_liquido < 0}
      />
    </div>
  );
}

function ResultadoResumoVendas({ resultado }) {
  return (
    <div className={styles.metricas}>
      <CartaoMetrica
        rotulo="Total vendido"
        valor={resultado.total_vendas}
        detalhe={`${resultado.quantidade_vendas} venda(s)`}
      />
      <CartaoMetrica
        rotulo="Faturado"
        valor={resultado.total_faturado}
        detalhe={`${resultado.quantidade_faturadas} venda(s) quitada(s)`}
      />
      <CartaoMetrica
        rotulo="Não faturado"
        valor={resultado.total_nao_faturado}
        detalhe={`${resultado.quantidade_abertas} venda(s) aberta(s)`}
      />
    </div>
  );
}

function ResultadoFormasPagamento({ resultado }) {
  return (
    <>
      <div className={styles.metricas}>
        <CartaoMetrica
          rotulo="Total recebido"
          valor={resultado.resumo.total}
          detalhe={`${resultado.resumo.quantidade} pagamento(s)`}
        />
      </div>

      {resultado.registros.length === 0 ? (
        <p className={styles.estado}>Nenhum pagamento no período.</p>
      ) : (
        <div className={styles.tabelaContainer}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Forma de pagamento</th>
                <th>Pagamentos</th>
                <th>Total recebido</th>
              </tr>
            </thead>
            <tbody>
              {resultado.registros.map((registro) => (
                <tr key={registro.forma_pagamento}>
                  <td>
                    {nomesFormaPagamento[registro.forma_pagamento] ??
                      registro.forma_pagamento}
                  </td>
                  <td>{registro.quantidade}</td>
                  <td>
                    <Valor>{registro.total}</Valor>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Resultado({ tipo, resultado }) {
  if (tipo === 'contas-abertas') {
    return <ResultadoContasAbertas resultado={resultado} />;
  }
  if (tipo === 'lucro') {
    return <ResultadoLucro resultado={resultado} />;
  }
  if (tipo === 'resumo-vendas') {
    return <ResultadoResumoVendas resultado={resultado} />;
  }
  return <ResultadoFormasPagamento resultado={resultado} />;
}

export default function PaginaRelatorio() {
  const router = useRouter();
  const tipo = Array.isArray(router.query.tipo)
    ? router.query.tipo[0]
    : router.query.tipo;
  const relatorio = encontrarRelatorio(tipo);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [clientes, setClientes] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [periodoResultado, setPeriodoResultado] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!relatorio?.filtroCliente) return;

    listarClientes()
      .then(setClientes)
      .catch((error) => setErro(error.message));
  }, [relatorio?.filtroCliente]);

  function alterarFiltro(event) {
    const { name, value } = event.target;
    setFiltros((atuais) => ({ ...atuais, [name]: value }));
  }

  async function consultar(event) {
    event.preventDefault();
    setGerando(true);
    setErro(null);

    try {
      const dados = await gerarRelatorio(relatorio.endpoint, filtros);
      setResultado(dados);
      setPeriodoResultado({
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
      });
    } catch (error) {
      setResultado(null);
      setPeriodoResultado(null);
      setErro(error.message);
    } finally {
      setGerando(false);
    }
  }

  if (!router.isReady) return null;

  if (!relatorio) {
    return (
      <>
        <Navbar />
        <main className={styles.pagina}>
          <TituloPagina>Relatório não encontrado</TituloPagina>
          <Link className={styles.voltar} href="/relatorios">
            ← Voltar para relatórios
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.pagina}>
        <Link className={styles.voltar} href="/relatorios">
          ← Todos os relatórios
        </Link>
        <TituloPagina>{relatorio.titulo}</TituloPagina>

        <p className={styles.descricaoPagina}>{relatorio.descricao}</p>

        <section className={styles.cartao}>
          <form className={styles.filtros} onSubmit={consultar}>
            <div>
              <label htmlFor="data_inicio">Data inicial</label>
              <input
                id="data_inicio"
                name="data_inicio"
                type="date"
                value={filtros.data_inicio}
                onChange={alterarFiltro}
                required
              />
            </div>
            <div>
              <label htmlFor="data_fim">Data final</label>
              <input
                id="data_fim"
                name="data_fim"
                type="date"
                min={filtros.data_inicio}
                value={filtros.data_fim}
                onChange={alterarFiltro}
                required
              />
            </div>

            {relatorio.filtroCliente && (
              <div>
                <label htmlFor="cliente_id">Cliente</label>
                <SelectPesquisavel
                  id="cliente_id"
                  value={filtros.cliente_id}
                  onChange={(value) =>
                    setFiltros((atuais) => ({
                      ...atuais,
                      cliente_id: value,
                    }))
                  }
                  options={clientes.map((cliente) => ({
                    value: cliente.id,
                    label: cliente.nome,
                  }))}
                  placeholder="Todos os clientes"
                  searchPlaceholder="Pesquise um cliente"
                />
              </div>
            )}

            {relatorio.filtroFormaPagamento && (
              <div>
                <label htmlFor="forma_pagamento">Forma de pagamento</label>
                <select
                  id="forma_pagamento"
                  name="forma_pagamento"
                  value={filtros.forma_pagamento}
                  onChange={alterarFiltro}
                >
                  <option value="">Todas as formas</option>
                  {Object.entries(nomesFormaPagamento).map(([valor, nome]) => (
                    <option key={valor} value={valor}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" disabled={gerando}>
              {gerando ? 'Gerando...' : 'Gerar relatório'}
            </button>
          </form>

          <p className={styles.criterio}>
            <strong>Critério:</strong> {relatorio.criterio}
          </p>
        </section>

        {erro && <div className={styles.erro}>{erro}</div>}

        {resultado && (
          <section className={styles.resultado}>
            <div className={styles.cabecalhoResultado}>
              <div>
                <span>Resultado gerado</span>
                <h2>
                  {formatarData(periodoResultado.data_inicio)} até{' '}
                  {formatarData(periodoResultado.data_fim)}
                </h2>
              </div>
            </div>
            <Resultado tipo={tipo} resultado={resultado} />
          </section>
        )}
      </main>
    </>
  );
}
