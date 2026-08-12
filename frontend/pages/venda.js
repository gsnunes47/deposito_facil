import { useEffect, useState } from 'react';
import ComprovanteVenda from '../components/ComprovanteVenda';
import FormularioMovimentacao from '../components/FormularioMovimentacao';
import { listarClientes } from '../services/clienteService';
import { listarProdutos } from '../services/produtoService';
import { criarVenda } from '../services/vendaService';
import { imprimirComprovanteVenda } from '../services/impressaoService';

const ID_COMPROVANTE = 'comprovante-venda-criada';

export default function Venda() {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [comprovante, setComprovante] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [produtosCarregados, clientesCarregados] = await Promise.all([
          listarProdutos(),
          listarClientes(),
        ]);

        setProdutos(produtosCarregados);
        setClientes(clientesCarregados);
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

  async function registrarVenda({ entidade_id, produtos: itens, data }) {
    const resultado = await criarVenda({
      cliente_id: entidade_id,
      produtos: itens,
      ...(data && { data }),
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
    >
      <ComprovanteVenda
        comprovante={comprovante}
        elementoId={ID_COMPROVANTE}
      />
    </FormularioMovimentacao>
  );
}
