import Head from 'next/head';
import styles from '../../styles/Login.module.css';

export default function LoginSemTenant() {
  return (
    <>
      <Head>
        <title>Acesso inválido | Depósito Fácil</title>
      </Head>

      <main className={styles.pagina}>
        <section className={styles.aviso}>
          <span className={styles.simbolo}>DF</span>
          <h1>Organização não informada</h1>
          <p>
            Use o endereço de acesso fornecido pela sua organização para entrar
            no Depósito Fácil.
          </p>
        </section>
      </main>
    </>
  );
}
