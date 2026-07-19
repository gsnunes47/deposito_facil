import { useEffect } from 'react';
import styles from '../styles/Modal.module.css';

export default function Modal({ titulo, onClose, children }) {
  useEffect(() => {
    function fecharComEscape(event) {
      if (event.key === 'Escape') onClose();
    }

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', fecharComEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', fecharComEscape);
    };
  }, [onClose]);

  return (
    <div className={styles.fundo} onMouseDown={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.cabecalho}>
          <h2 id="modal-titulo">{titulo}</h2>
          <button
            className={styles.fechar}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
