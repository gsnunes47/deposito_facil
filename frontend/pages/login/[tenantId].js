import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { autenticar } from '../../services/authService';
import styles from '../../styles/Login.module.css';

export default function Login() {
  const router = useRouter();
  const { tenantId } = router.query;

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const tenantValido = /^\d+$/.test(tenantId ?? '') && Number(tenantId) > 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem('');

    if (!tenantValido) {
      setMensagem('O endereço de login possui um tenant inválido.');
      return;
    }

    try {
      setEnviando(true);
      await autenticar(tenantId, { login, password });
      router.push('/');
    } catch (error) {
      setMensagem(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Entrar | Depósito Fácil</title>
      </Head>

      <main className={styles.pagina}>
        <section className={styles.cartao}>
          <div className={styles.apresentacao}>
            <div className={styles.marca}>
              <span className={styles.simbolo}>DF</span>
              <span>Depósito Fácil</span>
            </div>

            <div>
              <p className={styles.sobretitulo}>Gestão descomplicada</p>
              <h1>Seu depósito organizado em um só lugar.</h1>
              <p className={styles.descricao}>
                Controle produtos, movimentações e vendas com uma visão simples
                da sua operação.
              </p>
            </div>

          </div>

          <div className={styles.acesso}>
            <div className={styles.cabecalho}>
              <p className={styles.sobretitulo}>Área de acesso</p>
              <h2>Bem-vindo de volta</h2>
              <p>Entre com seu usuário e senha para continuar.</p>
            </div>

            <form className={styles.formulario} onSubmit={handleSubmit}>
              <div className={styles.campo}>
                <label htmlFor="login">Usuário</label>
                <input
                  id="login"
                  type="text"
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                  autoComplete="username"
                  placeholder="Digite seu usuário"
                  autoFocus
                  required
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="password">Senha</label>
                <div className={styles.campoSenha}>
                  <input
                    id="password"
                    type={senhaVisivel ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    className={styles.botaoSenha}
                    type="button"
                    onClick={() => setSenhaVisivel((visivel) => !visivel)}
                    aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={senhaVisivel}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M2.1 12s3.6-6 9.9-6 9.9 6 9.9 6-3.6 6-9.9 6-9.9-6-9.9-6Z" />
                      <circle cx="12" cy="12" r="2.8" />
                      {!senhaVisivel && <path d="m4 4 16 16" />}
                    </svg>
                  </button>
                </div>
              </div>

              {mensagem && (
                <p className={styles.erro} role="alert">
                  {mensagem}
                </p>
              )}

              <button
                className={styles.botao}
                type="submit"
                disabled={!router.isReady || !tenantValido || enviando}
              >
                {enviando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {router.isReady && tenantValido && (
              <p className={styles.tenant}>Organização #{tenantId}</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
