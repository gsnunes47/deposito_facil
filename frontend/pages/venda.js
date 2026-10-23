import { useEffect, useState } from 'react';
import ComprovanteVenda from '../components/ComprovanteVenda';
import FormularioMovimentacao from '../components/FormularioMovimentacao';
import { listarClientes } from '../services/clienteService';
import { listarProdutos } from '../services/produtoService';
import { criarVenda } from '../services/vendaService';
import { imprimirComprovanteVenda } from '../services/impressaoService';
import { obterConfiguracoes } from '../services/configuracaoService';

const ID_COMPROVANTE = 'comprovante-venda-criada';

export default function Venda() {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [comprovante, setComprovante] = useState(null);
  const [exibirProdutosEmLista, setExibirProdutosEmLista] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [produtosCarregados, clientesCarregados, configuracoes] =
          await Promise.all([
            listarProdutos(),
            listarClientes(),
            obterConfiguracoes(),
          ]);

        setProdutos(produtosCarregados);
        setClientes(clientesCarregados);
        setExibirProdutosEmLista(configuracoes.listar_produtos);
      } catch (error) {
        setErroCarregamento(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  useEffect(() => {
    if (!comprovante) return;

    try {
      imprimirComprovanteVenda(comprovante, ID_COMPROVANTE);
    } finally {
      setComprovante(null);
    }
  }, [comprovante]);

  async function registrarVenda({
    entidade_id,
    entidade_nome,
    produtos: itens,
    data,
    pagamento,
  }) {
    const resultado = await criarVenda({
      ...(entidade_id
        ? { cliente_id: entidade_id }
        : { cliente_nome: entidade_nome }),
      produtos: itens,
      ...(data && { data }),
      ...(pagamento && { pagamento }),
    });

    if (resultado.comprovante) {
      setComprovante(resultado.comprovante);
    }
  }

  return (
    <FormularioMovimentacao
      titulo="Venda"
      produtos={produtos}
      entidades={clientes}
      rotuloEntidade="Cliente"
      rotuloTotal="Preço total"
      textoBotao="Confirmar venda"
      mensagemSucesso="Venda realizada com sucesso."
      onSubmit={registrarVenda}
      carregando={carregando}
      erroCarregamento={erroCarregamento}
      exibirData
      permitirNovaEntidade
      selecaoIncremental={!exibirProdutosEmLista}
      controlesQuantidade
      preencherPrecoPadrao
      permitirPagamento
    >
      <ComprovanteVenda comprovante={comprovante} elementoId={ID_COMPROVANTE} />
    </FormularioMovimentacao>
  );
}
