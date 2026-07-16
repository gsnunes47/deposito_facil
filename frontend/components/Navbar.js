import Link from 'next/link';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <Link href="/">Início</Link>
        </li>

        <li>
          <Link href="/entrada">Entrada</Link>
        </li>

        <li>
          <Link href="/venda">Saída</Link>
        </li>

        <li>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Cadastro
          </a>

          <ul className={styles.dropdown}>
            <li>
              <Link href="/cadastro/despesas">Despesas</Link>
            </li>

            <li>
              <Link href="/cadastro/cliente">Cliente</Link>
            </li>

            <li>
              <Link href="/cadastro/produto">Produto</Link>
            </li>

            <li>
              <Link href="/cadastro/fornecedor">Fornecedor</Link>
            </li>
          </ul>
        </li>

        <li>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Registros
          </a>

          <ul className={styles.dropdown}>
            <li>
              <Link href="/registro/vendas">Vendas</Link>
            </li>

            <li>
              <Link href="/registro/encomendas">Encomendas</Link>
            </li>

            <li>
              <Link href="/estoque">Estoque</Link>
            </li>

            <li>
              <Link href="/relatorios">Relatórios</Link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
