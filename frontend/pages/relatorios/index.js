import Link from 'next/link';
import Navbar from '../../components/Navbar';
import TituloPagina from '../../components/TituloPagina';
import { RELATORIOS } from '../../config/relatorios';
import styles from '../../styles/Relatorios.module.css';

export default function Relatorios() {
  return (
    <>
      <Navbar />
      <main className={styles.pagina}>
        <TituloPagina>Relatórios</TituloPagina>

        <section className={styles.gradeRelatorios}>
          {RELATORIOS.map((relatorio) => (
            <Link
              className={styles.cartaoRelatorio}
              href={`/relatorios/${relatorio.slug}`}
              key={relatorio.slug}
            >
              <span className={styles.identificador}>Relatório</span>
              <h2>{relatorio.titulo}</h2>
              <p>{relatorio.descricao}</p>
              <strong>Abrir relatório →</strong>
            </Link>
          ))}
        </section>
      </main>
    </>
  );
}
