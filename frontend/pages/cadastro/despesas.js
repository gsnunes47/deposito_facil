import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import TituloPagina from '../../components/TituloPagina';
import {
  atualizarDespesa,
  cadastrarDespesa,
  excluirDespesa,
  listarDespesas,
} from '../../services/despesaService';
import styles from '../../styles/Despesas.module.css';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function dataAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formularioInicial() {
  return {
    id: null,
    descricao: '',
    valor: '',
    data: dataAtual(),
  };
}

function nomeMes(mesSelecionado) {
  const [ano, mes] = mesSelecionado.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(ano, mes - 1, 1));
}

export default function CadastroDespesas() {
  const [despesas, setDespesas] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [mesSelecionado, setMesSelecionado] = useState(
    dataAtual().slice(0, 7),
  );
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const editando = formulario.id !== null;

  async function carregarDespesas() {
    setCarregando(true);
    try {
      setDespesas(await listarDespesas());
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDespesas();
  }, []);

  const despesasDoMes = despesas.filter(
    (despesa) => String(despesa.data).slice(0, 7) === mesSelecionado,
  );
  const totalDoMes = despesasDoMes.reduce(
    (total, despesa) => total + Number(despesa.valor),
    0,
  );

  function alterarCampo(event) {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  }

  function mudarMes(diferenca) {
    const [ano, mes] = mesSelecionado.split('-').map(Number);
    const novaData = new Date(ano, mes - 1 + diferenca, 1);
    const novoAno = novaData.getFullYear();
    const novoMes = String(novaData.getMonth() + 1).padStart(2, '0');
    setMesSelecionado(`${novoAno}-${novoMes}`);
  }

  function iniciarEdicao(despesa) {
    setFormulario({
      id: despesa.id,
      descricao: despesa.descricao,
      valor: (Number(despesa.valor) / 100).toFixed(2),
      data: String(despesa.data).slice(0, 10),
    });
    setMensagem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicao() {
    setFormulario(formularioInicial());
    setMensagem(null);
  }

  async function salvarDespesa(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem(null);

    const dados = {
      descricao: formulario.descricao,
      valor: Math.round(Number(formulario.valor) * 100),
      data: formulario.data,
    };

    try {
      if (editando) {
        await atualizarDespesa(formulario.id, dados);
        setMensagem({
          tipo: 'sucesso',
          texto: 'Despesa atualizada com sucesso.',
        });
      } else {
        await cadastrarDespesa(dados);
        setMensagem({
          tipo: 'sucesso',
          texto: 'Despesa cadastrada com sucesso.',
        });
      }

      setMesSelecionado(formulario.data.slice(0, 7));
      setFormulario(formularioInicial());
      await carregarDespesas();
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    } finally {
      setSalvando(false);
    }
  }

  async function removerDespesa(despesa) {
    if (
      !window.confirm(
        `Deseja realmente excluir a despesa "${despesa.descricao}"?`,
      )
    ) {
      return;
    }

    setMensagem(null);
    try {
      await excluirDespesa(despesa.id);
      if (formulario.id === despesa.id) {
        setFormulario(formularioInicial());
      }
      await carregarDespesas();
      setMensagem({
        tipo: 'sucesso',
        texto: 'Despesa excluída com sucesso.',
      });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.pagina}>
        <TituloPagina>Cadastro de Despesas</TituloPagina>

        {mensagem && (
          <div className={`${styles.mensagem} ${styles[mensagem.tipo]}`}>
            {mensagem.texto}
          </div>
        )}

        <section className={styles.cartao}>
          <div className={styles.tituloSecao}>
            <div>
              <h2>{editando ? 'Editar despesa' : 'Nova despesa'}</h2>
              <p>Registre os gastos operacionais da empresa.</p>
            </div>
          </div>

          <form className={styles.formulario} onSubmit={salvarDespesa}>
            <div className={styles.campoDescricao}>
              <label htmlFor="descricao">Descrição</label>
              <input
                id="descricao"
                name="descricao"
                type="text"
                value={formulario.descricao}
                onChange={alterarCampo}
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label htmlFor="valor">Valor</label>
              <input
                id="valor"
                name="valor"
                type="number"
                min="0.01"
                step="0.01"
                value={formulario.valor}
                onChange={alterarCampo}
                required
              />
            </div>
            <div>
              <label htmlFor="data">Data</label>
              <input
                id="data"
                name="data"
                type="date"
                value={formulario.data}
                onChange={alterarCampo}
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
                    : 'Cadastrar'}
              </button>
            </div>
          </form>
        </section>

        <section className={styles.cartao}>
          <div className={styles.cabecalhoLista}>
            <div>
              <h2>Despesas do mês</h2>
              <p>{nomeMes(mesSelecionado)}</p>
            </div>
            <div className={styles.navegacaoMes}>
              <button type="button" onClick={() => mudarMes(-1)}>
                ← Anterior
              </button>
              <input
                type="month"
                value={mesSelecionado}
                onChange={(event) => setMesSelecionado(event.target.value)}
                aria-label="Selecionar mês"
              />
              <button type="button" onClick={() => mudarMes(1)}>
                Próximo →
              </button>
            </div>
          </div>

          {carregando ? (
            <p className={styles.estadoLista}>Carregando despesas...</p>
          ) : despesasDoMes.length === 0 ? (
            <p className={styles.estadoLista}>Nenhuma despesa neste mês.</p>
          ) : (
            <div className={styles.tabelaContainer}>
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th className={styles.colunaAcoes}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {despesasDoMes.map((despesa) => (
                    <tr key={despesa.id}>
                      <td>{String(despesa.data).slice(8, 10)}</td>
                      <td>{despesa.descricao}</td>
                      <td>{formatadorMoeda.format(Number(despesa.valor) / 100)}</td>
                      <td className={styles.acoesTabela}>
                        <button
                          className={styles.botaoEditar}
                          type="button"
                          onClick={() => iniciarEdicao(despesa)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.botaoExcluir}
                          type="button"
                          onClick={() => removerDespesa(despesa)}
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

          <div className={styles.totalMes}>
            <span>Total do mês</span>
            <strong>{formatadorMoeda.format(totalDoMes / 100)}</strong>
          </div>
        </section>
      </main>
    </>
  );
}
