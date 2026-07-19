import { useState } from 'react';
import Navbar from './Navbar';
import TituloPagina from './TituloPagina';
import SelectPesquisavel from './SelectPesquisavel';
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
}) {
  const [entidadeId, setEntidadeId] = useState('');
  const [data, setData] = useState('');
  const [valores, setValores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const total = produtos.reduce((soma, produto) => {
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

  function prepararProdutos() {
    const produtosSelecionados = [];

    for (const produto of produtos) {
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
      throw new Error('Informe ao menos um produto.');
    }

    return produtosSelecionados;
  }

  async function enviarFormulario(event) {
    event.preventDefault();
    setMensagem(null);

    try {
      if (!entidadeId) {
        throw new Error(`Selecione um ${rotuloEntidade.toLowerCase()}.`);
      }

      const produtosSelecionados = prepararProdutos();
      setEnviando(true);

      await onSubmit({
        entidade_id: Number(entidadeId),
        produtos: produtosSelecionados,
        ...(data && { data }),
      });

      setEntidadeId('');
      setData('');
      setValores({});
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
            <p className={styles.estado}>Nenhum produto cadastrado.</p>
          ) : (
            <div className={styles.listaProdutos}>
              {produtos.map((produto) => {
                const item = valores[produto.id] ?? {};

                return (
                  <div className={styles.produto} key={produto.id}>
                    <label
                      className={styles.nomeProduto}
                      htmlFor={`quantidade-${produto.id}`}
                    >
                      {produto.nome}
                    </label>

                    <div className={styles.camposProduto}>
                      <div>
                        <label htmlFor={`quantidade-${produto.id}`}>
                          Quantidade
                        </label>
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
                    </div>
                  </div>
                );
              })}
            </div>
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

          <button
            className={styles.botaoConfirmar}
            type="submit"
            disabled={enviando || carregando || produtos.length === 0}
          >
            {enviando ? 'Processando...' : textoBotao}
          </button>
        </form>
      </main>
    </>
  );
}
