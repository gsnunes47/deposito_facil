import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import TituloPagina from './TituloPagina';
import styles from '../styles/Cadastro.module.css';

const FORMULARIO_INICIAL = {
  id: null,
  nome: '',
  documento: '',
  tipo: 'PRODUTO',
  preco_padrao: '',
};

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function CadastroEntidade({
  titulo,
  singular,
  plural,
  listar,
  cadastrar,
  atualizar,
  excluir,
  possuiDocumento = true,
  possuiTipo = false,
  possuiPrecoPadrao = false,
}) {
  const [entidades, setEntidades] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const editando = formulario.id !== null;
  const nomeEntidade = singular.toLowerCase();

  async function carregarEntidades() {
    setCarregando(true);
    try {
      setEntidades(await listar());
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEntidades();
  }, []);

  function alterarCampo(event) {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  }

  function iniciarEdicao(entidade) {
    setFormulario({
      id: entidade.id,
      nome: entidade.nome,
      documento: entidade.documento ?? '',
      tipo: entidade.tipo ?? 'PRODUTO',
      preco_padrao:
        entidade.preco_padrao == null
          ? ''
          : (Number(entidade.preco_padrao) / 100).toFixed(2),
    });
    setMensagem(null);
  }

  function cancelarEdicao() {
    setFormulario(FORMULARIO_INICIAL);
    setMensagem(null);
  }

  async function salvarEntidade(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem(null);

    const dados = {
      nome: formulario.nome,
      ...(possuiDocumento && { documento: formulario.documento }),
      ...(possuiTipo && { tipo: formulario.tipo }),
      ...(possuiPrecoPadrao && {
        preco_padrao:
          formulario.preco_padrao === ''
            ? null
            : Math.round(Number(formulario.preco_padrao) * 100),
      }),
    };

    try {
      if (editando) {
        await atualizar(formulario.id, dados);
        setMensagem({
          tipo: 'sucesso',
          texto: `${singular} atualizado com sucesso.`,
        });
      } else {
        await cadastrar(dados);
        setMensagem({
          tipo: 'sucesso',
          texto: `${singular} cadastrado com sucesso.`,
        });
      }
      setFormulario(FORMULARIO_INICIAL);
      await carregarEntidades();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    } finally {
      setSalvando(false);
    }
  }

  async function removerEntidade(entidade) {
    if (
      !window.confirm(
        `Deseja realmente excluir ${nomeEntidade} "${entidade.nome}"?`,
      )
    ) {
      return;
    }

    setMensagem(null);
    try {
      await excluir(entidade.id);
      setMensagem({
        tipo: 'sucesso',
        texto: `${singular} excluído com sucesso.`,
      });
      if (formulario.id === entidade.id) setFormulario(FORMULARIO_INICIAL);
      await carregarEntidades();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.pagina}>
        <TituloPagina>{titulo}</TituloPagina>

        {mensagem && (
          <div className={`${styles.mensagem} ${styles[mensagem.tipo]}`}>
            {mensagem.texto}
          </div>
        )}

        <section className={styles.cartao}>
          <div className={styles.tituloSecao}>
            <div>
              <h2>
                {editando ? `Editar ${nomeEntidade}` : `Novo ${nomeEntidade}`}
              </h2>
              <p>
                {editando
                  ? `Altere os dados do ${nomeEntidade} selecionado.`
                  : `Informe os dados do ${nomeEntidade}.`}
              </p>
            </div>
          </div>

          <form
            className={[
              styles.formulario,
              (possuiDocumento || possuiTipo) && styles.formularioComDocumento,
              possuiPrecoPadrao && styles.formularioComPreco,
            ]
              .filter(Boolean)
              .join(' ')}
            onSubmit={salvarEntidade}
          >
            <div className={styles.campoNome}>
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formulario.nome}
                onChange={alterarCampo}
                autoComplete="off"
                required
              />
            </div>

            {possuiDocumento && (
              <div className={styles.campoNome}>
                <label htmlFor="documento">Documento (opcional)</label>
                <input
                  id="documento"
                  name="documento"
                  type="text"
                  value={formulario.documento}
                  onChange={alterarCampo}
                  placeholder="CPF ou CNPJ"
                  autoComplete="off"
                />
              </div>
            )}

            {possuiTipo && (
              <div className={styles.campoNome}>
                <label htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formulario.tipo}
                  onChange={alterarCampo}
                >
                  <option value="PRODUTO">Produto</option>
                  <option value="SERVICO">Serviço</option>
                </select>
              </div>
            )}

            {possuiPrecoPadrao && (
              <div className={styles.campoNome}>
                <label htmlFor="preco_padrao">Preço padrão</label>
                <input
                  id="preco_padrao"
                  name="preco_padrao"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formulario.preco_padrao}
                  onChange={alterarCampo}
                  placeholder="0,00"
                />
              </div>
            )}

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
                    : 'Cadastrar'}
              </button>
            </div>
          </form>
        </section>

        <section className={styles.cartao}>
          <div className={styles.tituloSecao}>
            <div>
              <h2>{plural} cadastrados</h2>
              <p>{entidades.length} registro(s) encontrado(s).</p>
            </div>
            <button
              className={styles.botaoSecundario}
              type="button"
              onClick={carregarEntidades}
              disabled={carregando}
            >
              Atualizar lista
            </button>
          </div>

          {carregando ? (
            <p className={styles.estadoLista}>Carregando...</p>
          ) : entidades.length === 0 ? (
            <p className={styles.estadoLista}>Nenhum registro cadastrado.</p>
          ) : (
            <div className={styles.tabelaContainer}>
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    {possuiTipo && <th>Tipo</th>}
                    {possuiPrecoPadrao && <th>Preço padrão</th>}
                    {possuiDocumento && <th>Documento</th>}
                    <th className={styles.colunaAcoes}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {entidades.map((entidade) => (
                    <tr key={entidade.id}>
                      <td>{entidade.nome}</td>
                      {possuiTipo && (
                        <td>
                          {entidade.tipo === 'SERVICO' ? 'Serviço' : 'Produto'}
                        </td>
                      )}
                      {possuiPrecoPadrao && (
                        <td>
                          {entidade.preco_padrao == null
                            ? '—'
                            : formatadorMoeda.format(
                                Number(entidade.preco_padrao) / 100,
                              )}
                        </td>
                      )}
                      {possuiDocumento && <td>{entidade.documento || '—'}</td>}
                      <td className={styles.acoesTabela}>
                        <button
                          className={styles.botaoEditar}
                          type="button"
                          onClick={() => iniciarEdicao(entidade)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.botaoExcluir}
                          type="button"
                          onClick={() => removerEntidade(entidade)}
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
