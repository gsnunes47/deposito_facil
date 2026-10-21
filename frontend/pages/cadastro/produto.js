import CadastroEntidade from '../../components/CadastroEntidade';
import {
  atualizarProduto,
  cadastrarProduto,
  excluirProduto,
  listarProdutos,
} from '../../services/produtoService';

export default function CadastroProduto() {
  return (
    <CadastroEntidade
      titulo="Cadastro de Produtos e Serviços"
      singular="Item"
      plural="Produtos e serviços"
      listar={listarProdutos}
      cadastrar={cadastrarProduto}
      atualizar={atualizarProduto}
      excluir={excluirProduto}
      possuiDocumento={false}
      possuiTipo
      possuiPrecoPadrao
    />
  );
}
