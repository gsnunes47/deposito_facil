import { useEffect, useState } from 'react';
import FormularioMovimentacao from '../components/FormularioMovimentacao';
import { criarEncomenda } from '../services/encomendaService';
import { listarFornecedores } from '../services/fornecedorService';
import { listarProdutos } from '../services/produtoService';
import { obterConfiguracoes } from '../services/configuracaoService';

export default function Entrada() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [exibirProdutosEmLista, setExibirProdutosEmLista] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [produtosCarregados, fornecedoresCarregados, configuracoes] =
          await Promise.all([
            listarProdutos(),
            listarFornecedores(),
            obterConfiguracoes(),
          ]);

        setProdutos(
          produtosCarregados.filter((produto) => produto.tipo !== 'SERVICO'),
        );
        setFornecedores(fornecedoresCarregados);
        setExibirProdutosEmLista(configuracoes.listar_produtos);
      } catch (error) {
        setErroCarregamento(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  async function registrarEncomenda({
    entidade_id,
    entidade_nome,
    produtos: itens,
  }) {
    await criarEncomenda({
      ...(entidade_id
        ? { fornecedor_id: entidade_id }
        : { fornecedor_nome: entidade_nome }),
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
      permitirNovaEntidade
      selecaoIncremental={!exibirProdutosEmLista}
      controlesQuantidade
    />
  );
}
