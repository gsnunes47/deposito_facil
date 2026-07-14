import styles from '../styles/TituloPagina.module.css';

export default function TituloPagina({ children }) {
  return <h1 className={styles.titulo}>{children}</h1>;
}
