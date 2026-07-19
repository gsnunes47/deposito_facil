import { useState } from 'react';
import Modal from './Modal';
import {
  atualizarUsuarioTenant,
  criarUsuarioTenant,
  excluirUsuarioTenant,
} from '../services/adminService';
import styles from '../styles/Admin.module.css';

const usuarioInicial = {
  login: '',
  password: '',
  access_level: 'funcionario',
};

const niveisAcesso = [
  { value: 'admin', label: 'Admin' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'funcionario', label: 'Funcionário' },
];

function nomeNivel(nivel) {
  return niveisAcesso.find((item) => item.value === nivel)?.label ?? nivel;
}

export default function GerenciadorUsuariosTenant({
  tenant,
  onChanged,
  onMessage,
  onError,
}) {
  const [aberto, setAberto] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState(usuarioInicial);
  const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
  const [edicao, setEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);

  async function cadastrar(event) {
    event.preventDefault();
    setSalvando(true);
    try {
      const result = await criarUsuarioTenant(tenant.id, novoUsuario);
      setNovoUsuario(usuarioInicial);
      setModalUsuarioAberto(false);
      await onChanged();
      onMessage(result.message);
    } catch (error) {
      onError(error);
    } finally {
      setSalvando(false);
    }
  }

  function editar(user) {
    setEdicao({
      userId: user.id,
      login: user.name,
      password: '',
      access_level: user.access_level,
    });
  }

  async function salvar(event) {
    event.preventDefault();
    setSalvando(true);
    try {
      const result = await atualizarUsuarioTenant(tenant.id, edicao.userId, {
        login: edicao.login,
        password: edicao.password || undefined,
        access_level: edicao.access_level,
      });
      setEdicao(null);
      await onChanged();
      onMessage(result.message);
    } catch (error) {
      onError(error);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(user) {
    if (!window.confirm('Excluir o login ' + user.name + '?')) return;
    setSalvando(true);
    try {
      const result = await excluirUsuarioTenant(tenant.id, user.id);
      await onChanged();
      onMessage(result.message);
    } catch (error) {
      onError(error);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.tenant}>
      <div className={styles.tenantCabecalho}>
        <div className={styles.identidade}>
          <strong>{tenant.name}</strong>
          <span>
            #{tenant.id} · {tenant.users.length}{' '}
            {tenant.users.length === 1 ? 'login' : 'logins'}
          </span>
        </div>
        <div className={styles.acoes}>
          <a href={'/login/' + tenant.id} target="_blank" rel="noreferrer">
            Abrir login
          </a>
          <button
            className={styles.botaoSecundario}
            type="button"
            onClick={() => setAberto((atual) => !atual)}
          >
            {aberto ? 'Fechar usuários' : 'Gerenciar usuários'}
          </button>
        </div>
      </div>

      {aberto && (
        <div className={styles.gestaoUsuarios}>
          <div className={styles.cabecalhoGestao}>
            <strong>Usuários</strong>
            <button type="button" onClick={() => setModalUsuarioAberto(true)}>
              Novo usuário
            </button>
          </div>
          <div className={styles.listaUsuarios}>
            {tenant.users.map((user) => (
              <div className={styles.usuario} key={user.id}>
                {edicao?.userId === user.id ? (
                  <form className={styles.formUsuario} onSubmit={salvar}>
                    <div>
                      <label htmlFor={'edit-login-' + user.id}>Login</label>
                      <input
                        id={'edit-login-' + user.id}
                        value={edicao.login}
                        onChange={(event) =>
                          setEdicao((atual) => ({
                            ...atual,
                            login: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={'edit-level-' + user.id}>
                        Nível de acesso
                      </label>
                      <select
                        id={'edit-level-' + user.id}
                        value={edicao.access_level}
                        onChange={(event) =>
                          setEdicao((atual) => ({
                            ...atual,
                            access_level: event.target.value,
                          }))
                        }
                      >
                        {niveisAcesso.map((nivel) => (
                          <option key={nivel.value} value={nivel.value}>
                            {nivel.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={'edit-password-' + user.id}>
                        Redefinir senha
                      </label>
                      <input
                        id={'edit-password-' + user.id}
                        type="password"
                        minLength="8"
                        value={edicao.password}
                        onChange={(event) =>
                          setEdicao((atual) => ({
                            ...atual,
                            password: event.target.value,
                          }))
                        }
                        autoComplete="new-password"
                        placeholder="Deixe vazio para manter"
                      />
                    </div>
                    <div className={styles.acoesEdicao}>
                      <button
                        className={styles.botaoCancelar}
                        type="button"
                        onClick={() => setEdicao(null)}
                        disabled={salvando}
                      >
                        Cancelar
                      </button>
                      <button type="submit" disabled={salvando}>
                        {salvando ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className={styles.dadosUsuario}>
                      <strong>{user.name}</strong>
                      <span>{nomeNivel(user.access_level)}</span>
                    </div>
                    <div className={styles.acoesUsuario}>
                      <button
                        className={styles.botaoSecundario}
                        type="button"
                        onClick={() => editar(user)}
                        disabled={salvando}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.botaoPerigo}
                        type="button"
                        onClick={() => excluir(user)}
                        disabled={salvando}
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {modalUsuarioAberto && (
            <Modal
              titulo={'Novo usuário · ' + tenant.name}
              onClose={() => {
                if (!salvando) setModalUsuarioAberto(false);
              }}
            >
              <form className={styles.novoUsuario} onSubmit={cadastrar}>
                <div className={styles.formUsuario}>
                  <div>
                    <label htmlFor={'new-login-' + tenant.id}>Login</label>
                    <input
                      id={'new-login-' + tenant.id}
                      value={novoUsuario.login}
                      onChange={(event) =>
                        setNovoUsuario((atual) => ({
                          ...atual,
                          login: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor={'new-level-' + tenant.id}>
                      Nível de acesso
                    </label>
                    <select
                      id={'new-level-' + tenant.id}
                      value={novoUsuario.access_level}
                      onChange={(event) =>
                        setNovoUsuario((atual) => ({
                          ...atual,
                          access_level: event.target.value,
                        }))
                      }
                    >
                      {niveisAcesso.map((nivel) => (
                        <option key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={'new-password-' + tenant.id}>Senha</label>
                    <input
                      id={'new-password-' + tenant.id}
                      type="password"
                      minLength="8"
                      value={novoUsuario.password}
                      onChange={(event) =>
                        setNovoUsuario((atual) => ({
                          ...atual,
                          password: event.target.value,
                        }))
                      }
                      autoComplete="new-password"
                      placeholder="Mínimo de 8 caracteres"
                      required
                    />
                  </div>
                  <button type="submit" disabled={salvando}>
                    {salvando ? 'Criando...' : 'Adicionar login'}
                  </button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}
