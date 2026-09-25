import { useState } from 'react';
import Link from 'next/link';
import { useUsuarioAutenticado } from '../contexts/AuthContext';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [submenuAberto, setSubmenuAberto] = useState(null);
  const usuario = useUsuarioAutenticado();
  const podeVerRelatorios = ['admin', 'gerente'].includes(
    usuario?.accessLevel,
  );

  function fecharMenu() {
    setMenuAberto(false);
    setSubmenuAberto(null);
  }

  function alternarSubmenu(nome) {
    setSubmenuAberto((atual) => (atual === nome ? null : nome));
  }

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <div className={styles.barraMobile}>
        <span className={styles.tituloMobile}>Depósito Fácil</span>
        <button
          type="button"
          className={styles.botaoMenu}
          aria-expanded={menuAberto}
          aria-controls="menu-principal"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <ul
        id="menu-principal"
        className={`${styles.menu} ${menuAberto ? styles.menuAberto : ''}`}
      >
        <li><Link href="/app" onClick={fecharMenu}>Início</Link></li>
        <li><Link href="/entrada" onClick={fecharMenu}>Entrada</Link></li>
        <li><Link href="/venda" onClick={fecharMenu}>Saída</Link></li>

        <li className={styles.itemComSubmenu}>
          <a
            href="#"
            className={styles.botaoSubmenu}
            aria-expanded={submenuAberto === 'cadastro'}
            onClick={(event) => {
              event.preventDefault();
              alternarSubmenu('cadastro');
            }}
          >
            Cadastro <span className={styles.seta} aria-hidden="true" />
          </a>
          <ul className={`${styles.dropdown} ${submenuAberto === 'cadastro' ? styles.dropdownAberto : ''}`}>
            <li><Link href="/cadastro/despesas" onClick={fecharMenu}>Despesas</Link></li>
            <li><Link href="/cadastro/cliente" onClick={fecharMenu}>Cliente</Link></li>
            <li><Link href="/cadastro/produto" onClick={fecharMenu}>Produto</Link></li>
            <li><Link href="/cadastro/fornecedor" onClick={fecharMenu}>Fornecedor</Link></li>
          </ul>
        </li>

        <li className={styles.itemComSubmenu}>
          <a
            href="#"
            className={styles.botaoSubmenu}
            aria-expanded={submenuAberto === 'registros'}
            onClick={(event) => {
              event.preventDefault();
              alternarSubmenu('registros');
            }}
          >
            Registros <span className={styles.seta} aria-hidden="true" />
          </a>
          <ul className={`${styles.dropdown} ${submenuAberto === 'registros' ? styles.dropdownAberto : ''}`}>
            <li><Link href="/registro/vendas" onClick={fecharMenu}>Vendas</Link></li>
            <li><Link href="/registro/encomendas" onClick={fecharMenu}>Encomendas</Link></li>
            <li><Link href="/estoque" onClick={fecharMenu}>Estoque</Link></li>
            {podeVerRelatorios && (
              <li>
                <Link href="/relatorios" onClick={fecharMenu}>
                  Relatórios
                </Link>
              </li>
            )}
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
