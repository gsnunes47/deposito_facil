import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import {
  atualizarProduto,
  cadastrarProduto,
  excluirProduto,
  listarProdutos,
} from '../../services/produtoService';
import styles from '../../styles/Produto.module.css';

const FORMULARIO_INICIAL = {
  id: null,
  nome: '',
};

export default function CadastroProduto() {
  const [produtos, setProdutos] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const editando = formulario.id !== null;

  async function carregarProdutos() {
    setCarregando(true);

    try {
      const dados = await listarProdutos();
      setProdutos(dados);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  function alterarCampo(event) {
    const { name, value } = event.target;

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }));
  }

  function iniciarEdicao(produto) {
    setFormulario({
      id: produto.id,
      nome: produto.nome,
    });
    setMensagem(null);
  }

  function cancelarEdicao() {
    setFormulario(FORMULARIO_INICIAL);
    setMensagem(null);
  }

  async function salvarProduto(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem(null);

    try {
      if (editando) {
        await atualizarProduto(formulario.id, {
          nome: formulario.nome,
        });
        setMensagem({ tipo: 'sucesso', texto: 'Produto atualizado.' });
      } else {
        await cadastrarProduto(formulario.nome);
        setMensagem({ tipo: 'sucesso', texto: 'Produto cadastrado.' });
      }

      setFormulario(FORMULARIO_INICIAL);
      await carregarProdutos();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    } finally {
      setSalvando(false);
    }
  }

  async function removerProduto(produto) {
    const confirmou = window.confirm(
      `Deseja realmente excluir o produto "${produto.nome}"?`,
    );

    if (!confirmou) return;

    setMensagem(null);

    try {
      await excluirProduto(produto.id);
      setMensagem({ tipo: 'sucesso', texto: 'Produto excluído.' });

      if (formulario.id === produto.id) {
        setFormulario(FORMULARIO_INICIAL);
      }

      await carregarProdutos();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    }
  }

  return (
    <>
      <Navbar />

      <main className={styles.pagina}>
        <header className={styles.cabecalho}>
          <h1>Cadastro de Produtos</h1>
        </header>

        {mensagem && (
          <div className={`${styles.mensagem} ${styles[mensagem.tipo]}`}>
            {mensagem.texto}
          </div>
        )}

        <section className={styles.cartao}>
          <div className={styles.tituloSecao}>
            <div>
              <h2>{editando ? 'Editar produto' : 'Novo produto'}</h2>
              <p>
                {editando
                  ? 'Altere o nome do produto selecionado.'
                  : 'Informe o nome do produto que deseja cadastrar.'}
              </p>
            </div>
          </div>

          <form className={styles.formulario} onSubmit={salvarProduto}>
            <div className={styles.campoNome}>
              <label htmlFor="nome">Nome do produto</label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formulario.nome}
                onChange={alterarCampo}
                placeholder="Ex.: Banana prata"
                autoComplete="off"
                required
              />
            </div>

            <div className={styles.acoesFormulario}>
              {editando && (
                <button
                  className={styles.botaoSecundario}
                  type="button"
                  onClick={cancelarEdicao}
                  disabled={salvando}
                >
                  Cancelar
                </button>
              )}

              <button
                className={styles.botaoPrimario}
                type="submit"
                disabled={salvando}
              >
                {salvando
                  ? 'Salvando...'
                  : editando
                    ? 'Salvar alterações'
                    : 'Cadastrar produto'}
              </button>
            </div>
          </form>
        </section>

        <section className={styles.cartao}>
          <div className={styles.tituloSecao}>
            <div>
              <h2>Produtos cadastrados</h2>
              <p>{produtos.length} produto(s) encontrado(s).</p>
            </div>

            <button
              className={styles.botaoSecundario}
              type="button"
              onClick={carregarProdutos}
              disabled={carregando}
            >
              Atualizar lista
            </button>
          </div>

          {carregando ? (
            <p className={styles.estadoLista}>Carregando produtos...</p>
          ) : produtos.length === 0 ? (
            <p className={styles.estadoLista}>Nenhum produto cadastrado.</p>
          ) : (
            <div className={styles.tabelaContainer}>
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th className={styles.colunaAcoes}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id}>
                      <td>{produto.nome}</td>
                      <td className={styles.acoesTabela}>
                        <button
                          className={styles.botaoEditar}
                          type="button"
                          onClick={() => iniciarEdicao(produto)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.botaoExcluir}
                          type="button"
                          onClick={() => removerProduto(produto)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
