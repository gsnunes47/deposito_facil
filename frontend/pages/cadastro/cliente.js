import CadastroEntidade from '../../components/CadastroEntidade';
import {
  atualizarCliente,
  cadastrarCliente,
  excluirCliente,
  listarClientes,
} from '../../services/clienteService';

export default function CadastroCliente() {
  return (
    <CadastroEntidade
      titulo="Cadastro de Clientes"
      singular="Cliente"
      plural="Clientes"
      listar={listarClientes}
      cadastrar={cadastrarCliente}
      atualizar={atualizarCliente}
      excluir={excluirCliente}
    />
  );
}
