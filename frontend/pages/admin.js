import Head from 'next/head';
import { useEffect, useState } from 'react';
import GerenciadorUsuariosTenant from '../components/GerenciadorUsuariosTenant';
import Modal from '../components/Modal';
import {
  autenticarAdmin,
  criarTenant,
  listarTenants,
} from '../services/adminService';
import styles from '../styles/Admin.module.css';

const novoTenantInicial = {
  name: '',
  admin_login: 'admin',
  admin_password: '',
};

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false);
  const [login, setLogin] = useState('admin');
  const [password, setPassword] = useState('');
  const [novoTenant, setNovoTenant] = useState(novoTenantInicial);
  const [modalTenantAberto, setModalTenantAberto] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function carregarTenants() {
    const dados = await listarTenants();
    setTenants(Array.isArray(dados) ? dados : []);
    setAutenticado(true);
  }

  useEffect(() => {
    carregarTenants()
      .catch(() => setAutenticado(false))
      .finally(() => setCarregando(false));
  }, []);

  function tratarErro(error) {
    if (error.status === 401 || error.status === 403) {
      setAutenticado(false);
    }
    setMensagem({ tipo: 'erro', texto: error.message });
  }

  function mostrarSucesso(texto) {
    setMensagem({ tipo: 'sucesso', texto });
  }

  async function entrar(event) {
    event.preventDefault();
    setMensagem(null);
    setEnviando(true);
    try {
      await autenticarAdmin({ login, password });
      await carregarTenants();
      setPassword('');
    } catch (error) {
      tratarErro(error);
    } finally {
      setEnviando(false);
    }
  }

  async function cadastrarTenant(event) {
    event.preventDefault();
    setMensagem(null);
    setEnviando(true);
    try {
      const tenant = await criarTenant(novoTenant);
      setNovoTenant(novoTenantInicial);
      setModalTenantAberto(false);
      await carregarTenants();
      mostrarSucesso(
        'Tenant #' +
          tenant.tenant_id +
          ' criado com o login ' +
          novoTenant.admin_login +
          '.',
      );
    } catch (error) {
      tratarErro(error);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Administração | Depósito Fácil</title>
      </Head>
      <main className={styles.pagina}>
        <section className={styles.cartao}>
          <div className={styles.marca}>DF</div>
          <p className={styles.sobretitulo}>Administração da plataforma</p>
          <h1>{autenticado ? 'Tenants e usuários' : 'Acesso restrito'}</h1>

          {mensagem && (
            <p className={styles[mensagem.tipo]} role="alert">
              {mensagem.texto}
            </p>
          )}

          {carregando ? (
            <p className={styles.estado}>Verificando acesso...</p>
          ) : !autenticado ? (
            <form onSubmit={entrar}>
              <label htmlFor="admin-login">Usuário</label>
              <input
                id="admin-login"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                autoComplete="username"
                required
              />
              <label htmlFor="admin-password">Senha</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                autoFocus
                required
              />
              <button type="submit" disabled={enviando}>
                {enviando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <>
              <div className={styles.cabecalhoLista}>
                <h2>Tenants cadastrados</h2>
                <button
                  type="button"
                  onClick={() => setModalTenantAberto(true)}
                >
                  Criar tenant
                </button>
              </div>

              {modalTenantAberto && (
                <Modal
                  titulo="Criar tenant"
                  onClose={() => {
                    if (!enviando) setModalTenantAberto(false);
                  }}
                >
                  <form
                    className={styles.novoTenant}
                    onSubmit={cadastrarTenant}
                  >
                    <div className={styles.camposNovoTenant}>
                      <div>
                        <label htmlFor="tenant-name">Organização</label>
                        <input
                          id="tenant-name"
                          value={novoTenant.name}
                          onChange={(event) =>
                            setNovoTenant((atual) => ({
                              ...atual,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Nome da organização"
                          autoFocus
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="tenant-login">
                          Login administrador
                        </label>
                        <input
                          id="tenant-login"
                          value={novoTenant.admin_login}
                          onChange={(event) =>
                            setNovoTenant((atual) => ({
                              ...atual,
                              admin_login: event.target.value,
                            }))
                          }
                          autoComplete="off"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="tenant-password">Senha inicial</label>
                        <input
                          id="tenant-password"
                          type="password"
                          minLength="8"
                          value={novoTenant.admin_password}
                          onChange={(event) =>
                            setNovoTenant((atual) => ({
                              ...atual,
                              admin_password: event.target.value,
                            }))
                          }
                          autoComplete="new-password"
                          placeholder="Mínimo de 8 caracteres"
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={enviando}>
                      {enviando ? 'Criando...' : 'Criar tenant'}
                    </button>
                  </form>
                </Modal>
              )}

              <div className={styles.lista}>
                {tenants.map((tenant) => (
                  <GerenciadorUsuariosTenant
                    key={tenant.id}
                    tenant={tenant}
                    onChanged={carregarTenants}
                    onMessage={mostrarSucesso}
                    onError={tratarErro}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
