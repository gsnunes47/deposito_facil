import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import TituloPagina from '../components/TituloPagina';
import {
  obterConfiguracoes,
  salvarConfiguracoes,
} from '../services/configuracaoService';
import styles from '../styles/Configuracoes.module.css';

export default function Configuracoes() {
  const [listarProdutos, setListarProdutos] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [carregado, setCarregado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    let ativo = true;
    obterConfiguracoes()
      .then((configuracoes) => {
        if (!ativo) return;
        setListarProdutos(configuracoes.listar_produtos);
        setCarregado(true);
      })
      .catch((error) => {
        if (ativo) setMensagem({ tipo: 'erro', texto: error.message });
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true);
    setMensagem(null);
    try {
      const configuracoes = await salvarConfiguracoes({
        listar_produtos: listarProdutos,
      });
      setListarProdutos(configuracoes.listar_produtos);
      setMensagem({
        tipo: 'sucesso',
        texto: 'Configurações salvas com sucesso.',
      });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.pagina}>
        <TituloPagina>Configurações</TituloPagina>
        {mensagem && (
          <div
            role="status"
            className={`${styles.mensagem} ${styles[mensagem.tipo]}`}
          >
            {mensagem.texto}
          </div>
        )}
        <form className={styles.formulario} onSubmit={salvar}>
          <h2>Produtos em vendas e entradas</h2>
          {carregando ? (
            <p>Carregando configurações...</p>
          ) : (
            <>
              <label className={styles.opcao}>
                <input
                  type="checkbox"
                  checked={listarProdutos}
                  disabled={!carregado || salvando}
                  onChange={(event) => {
                    setListarProdutos(event.target.checked);
                    setMensagem(null);
                  }}
                  aria-describedby="descricao-lista-produtos"
                />
                Exibir todos os produtos em lista
              </label>
              <p id="descricao-lista-produtos">
                Marque para mostrar a lista completa de itens em vendas e
                entradas. Desmarque para pesquisar e adicionar itens pelo
                seletor.
              </p>
              <p>
                Essa preferência vale para todos os usuários da sua empresa.
              </p>
            </>
          )}
          <button type="submit" disabled={!carregado || salvando}>
            {salvando ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </form>
      </main>
    </>
  );
}
