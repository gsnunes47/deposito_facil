import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import TituloPagina from '../components/TituloPagina';
import { buscarEstoque } from '../services/estoqueService';
import styles from '../styles/Estoque.module.css';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatarCentavos(valor) {
  return formatadorMoeda.format(Number(valor ?? 0) / 100);
}

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(data));
}

function ListaMovimentacoes({ movimentacoes, tipo }) {
  const entrada = tipo === 'entrada';

  if (movimentacoes.length === 0) {
    return (
      <p className={styles.estado}>
        {entrada ? 'Nenhuma entrada registrada.' : 'Nenhuma saída registrada.'}
      </p>
    );
  }

  return (
    <div className={styles.listaMovimentacoes}>
      {movimentacoes.map((movimentacao) => (
        <article
          className={`${styles.movimentacao} ${
            entrada ? styles.entrada : styles.saida
          }`}
          key={movimentacao.id}
        >
          <div className={styles.itens}>
            {movimentacao.itens.map((item) => (
              <p key={`${movimentacao.id}-${item.produto_id}`}>
                <strong>{item.quantidade}</strong> {item.produto}
                <span>{formatarCentavos(item.valor_unitario)} por unidade</span>
              </p>
            ))}
          </div>

          <div className={styles.dadosMovimentacao}>
            <span>{formatarData(movimentacao.data)}</span>
            <span>
              {entrada ? movimentacao.fornecedor : movimentacao.cliente}
            </span>
            {entrada ? (
              <strong>{formatarCentavos(movimentacao.total)}</strong>
            ) : (
              <span
                className={`${styles.status} ${
                  movimentacao.pago ? styles.quitado : styles.aberto
                }`}
              >
                {movimentacao.pago ? 'Quitada' : 'Em aberto'}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Estoque() {
  const [estoque, setEstoque] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  async function carregarEstoque() {
    setCarregando(true);
    setErro(null);

    try {
      setEstoque(await buscarEstoque());
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEstoque();
  }, []);

  return (
    <>
      <Navbar />
      <main className={styles.pagina}>
        <TituloPagina>Estoque</TituloPagina>

        {erro && <div className={styles.erro}>{erro}</div>}

        {carregando && !estoque ? (
          <p className={styles.carregando}>Carregando estoque...</p>
        ) : estoque ? (
          <>
            <section className={styles.resumo}>
              <div>
                <span>Produtos cadastrados</span>
                <strong>{estoque.resumo.produtos_cadastrados}</strong>
              </div>
              <div>
                <span>Unidades em estoque</span>
                <strong>{estoque.resumo.total_unidades}</strong>
              </div>
              <div>
                <span>Produtos esgotados</span>
                <strong>{estoque.resumo.produtos_esgotados}</strong>
              </div>
            </section>

            <div className={styles.gradePrincipal}>
              <section className={styles.cartao}>
                <h2>Saldo atual</h2>

                {estoque.produtos.length === 0 ? (
                  <p className={styles.estado}>Nenhum produto cadastrado.</p>
                ) : (
                  <div className={styles.tabelaContainer}>
                    <table className={styles.tabela}>
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Quantidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estoque.produtos.map((produto) => (
                          <tr key={produto.id}>
                            <td>{produto.nome}</td>
                            <td>
                              <strong
                                className={
                                  produto.quantidade <= 0
                                    ? styles.semEstoque
                                    : undefined
                                }
                              >
                                {produto.quantidade}
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className={styles.movimentacoes}>
                <div className={styles.cartao}>
                  <h2>Últimas entradas</h2>
                  <ListaMovimentacoes
                    movimentacoes={estoque.entradas}
                    tipo="entrada"
                  />
                </div>

                <div className={styles.cartao}>
                  <h2>Últimas saídas</h2>
                  <ListaMovimentacoes
                    movimentacoes={estoque.saidas}
                    tipo="saida"
                  />
                </div>
              </section>
            </div>
          </>
        ) : null}
      </main>
    </>
  );
}
