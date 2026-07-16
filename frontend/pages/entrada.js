import { useEffect, useState } from 'react';
import FormularioMovimentacao from '../components/FormularioMovimentacao';
import { criarEncomenda } from '../services/encomendaService';
import { listarFornecedores } from '../services/fornecedorService';
import { listarProdutos } from '../services/produtoService';

export default function Entrada() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [produtosCarregados, fornecedoresCarregados] =
          await Promise.all([listarProdutos(), listarFornecedores()]);

        setProdutos(produtosCarregados);
        setFornecedores(fornecedoresCarregados);
      } catch (error) {
        setErroCarregamento(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  async function registrarEncomenda({ entidade_id, produtos: itens }) {
    await criarEncomenda({
      fornecedor_id: entidade_id,
      produtos: itens,
    });
  }

  return (
    <FormularioMovimentacao
      titulo="Entrada de encomenda"
      produtos={produtos}
      entidades={fornecedores}
      rotuloEntidade="Fornecedor"
      rotuloTotal="Custo total"
      textoBotao="Confirmar entrada"
      mensagemSucesso="Encomenda registrada com sucesso."
      onSubmit={registrarEncomenda}
      carregando={carregando}
      erroCarregamento={erroCarregamento}
    />
  );
}
