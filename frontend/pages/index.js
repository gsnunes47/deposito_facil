import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar.js';
import { useUsuarioAutenticado } from '../contexts/AuthContext';
import styles from '../styles/Home.module.css';

const etapas = [
  ['01', 'Prepare os cadastros', 'Cadastre produtos, clientes e fornecedores.', '/cadastro/produto', 'Cadastrar produtos'],
  ['02', 'Registre as entradas', 'Informe os produtos recebidos pelo depósito.', '/entrada', 'Registrar entrada'],
  ['03', 'Faça as saídas', 'Registre vendas e encomendas da operação.', '/venda', 'Registrar saída'],
  ['04', 'Acompanhe a operação', 'Consulte saldos e as últimas movimentações.', '/estoque', 'Ver estoque'],
];

const atalhos = [
  ['Cadastros', 'Produtos, clientes, fornecedores e despesas.', '/cadastro/produto'],
  ['Movimentações', 'Entradas, vendas e encomendas.', '/entrada'],
  ['Registros', 'Histórico de vendas e encomendas.', '/registro/vendas'],
  ['Estoque', 'Saldos, entradas e saídas recentes.', '/estoque'],
];

export default function Home() {
  const usuario = useUsuarioAutenticado();
  const podeVerRelatorios = ['admin', 'gerente'].includes(usuario?.accessLevel);
  const nome = usuario?.login?.split(' ')[0];

  return <>
    <Head><title>Início | Depósito Fácil</title></Head>
    <Navbar />
    <main className={styles.pagina}>
      <section className={styles.hero}>
        <div>
          <p className={styles.rotulo}>Visão geral</p>
          <h1>{nome ? 'Olá, ' + nome + '.' : 'Olá.'}<span> Por onde começamos?</span></h1>
          <p className={styles.intro}>Percorra o fluxo principal do depósito, do primeiro cadastro ao acompanhamento do estoque.</p>
          <div className={styles.acoes}>
            <Link href="/cadastro/produto">Começar pelos cadastros</Link>
            <a href="#fluxo">Ver passo a passo</a>
          </div>
        </div>
        <div className={styles.resumo}><b>Cadastros</b><i>↓</i><b>Entradas e saídas</b><i>↓</i><b>Estoque e registros</b></div>
      </section>

      {Number(usuario?.tenantId) === 2 && <aside className={styles.demo}><b>Ambiente de demonstração</b><span>Os dados são compartilhados com outros visitantes e podem mudar durante a avaliação.</span></aside>}

      <section className={styles.secao} id="fluxo">
        <header><p className={styles.rotulo}>Como funciona</p><h2>Um fluxo simples, do cadastro ao controle</h2></header>
        <ol className={styles.fluxo}>{etapas.map(([numero,titulo,texto,href,acao]) =>
          <li key={numero}><span>{numero}</span><div><h3>{titulo}</h3><p>{texto}</p><Link href={href}>{acao} →</Link></div></li>
        )}</ol>
      </section>

      <section className={styles.secao}>
        <header><p className={styles.rotulo}>Acesso rápido</p><h2>Continue de onde precisar</h2></header>
        <div className={styles.atalhos}>{atalhos.map(([titulo,texto,href]) =>
          <Link href={href} key={titulo}><strong>{titulo}</strong><small>{texto}</small><i>→</i></Link>
        )}
        {podeVerRelatorios && <Link href="/relatorios"><strong>Relatórios</strong><small>Resultados financeiros e operacionais.</small><i>→</i></Link>}</div>
      </section>
    </main>
  </>;
}
