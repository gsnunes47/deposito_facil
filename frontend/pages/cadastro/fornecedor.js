import CadastroEntidade from '../../components/CadastroEntidade';
import {
  atualizarFornecedor,
  cadastrarFornecedor,
  excluirFornecedor,
  listarFornecedores,
} from '../../services/fornecedorService';

export default function CadastroFornecedor() {
  return (
    <CadastroEntidade
      titulo="Cadastro de Fornecedores"
      singular="Fornecedor"
      plural="Fornecedores"
      listar={listarFornecedores}
      cadastrar={cadastrarFornecedor}
      atualizar={atualizarFornecedor}
      excluir={excluirFornecedor}
    />
  );
}
