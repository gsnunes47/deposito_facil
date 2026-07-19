import { useEffect, useMemo, useState } from 'react';
import styles from '../styles/SelectPesquisavel.module.css';

function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function SelectPesquisavel({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  searchPlaceholder = 'Digite para pesquisar',
  disabled = false,
  required = false,
}) {
  const selecionada = options.find(
    (option) => String(option.value) === String(value),
  );
  const [consulta, setConsulta] = useState(selecionada?.label ?? '');
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  useEffect(() => {
    setConsulta(selecionada?.label ?? '');
  }, [selecionada?.label]);

  const filtradas = useMemo(() => {
    const busca = normalizar(consulta);
    if (!busca || selecionada?.label === consulta) return options;

    return options.filter((option) => normalizar(option.label).includes(busca));
  }, [consulta, options, selecionada?.label]);

  function selecionar(option) {
    onChange(String(option.value));
    setConsulta(option.label);
    setAberto(false);
    setIndiceAtivo(0);
  }

  function alterarConsulta(event) {
    setConsulta(event.target.value);
    if (value) onChange('');
    setAberto(true);
    setIndiceAtivo(0);
  }

  function tratarTecla(event) {
    if (event.key === 'Escape') {
      setAberto(false);
      setConsulta(selecionada?.label ?? '');
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setAberto(true);
      setIndiceAtivo((indice) =>
        Math.min(indice + 1, Math.max(filtradas.length - 1, 0)),
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndiceAtivo((indice) => Math.max(indice - 1, 0));
      return;
    }

    if (event.key === 'Enter' && aberto && filtradas[indiceAtivo]) {
      event.preventDefault();
      selecionar(filtradas[indiceAtivo]);
    }
  }

  return (
    <div className={styles.container}>
      <input
        id={id}
        className={styles.input}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={aberto}
        aria-controls={`${id}-opcoes`}
        aria-required={required}
        value={consulta}
        onChange={alterarConsulta}
        onFocus={(event) => {
          event.target.select();
          setAberto(true);
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setAberto(false);
            setConsulta(selecionada?.label ?? '');
          }, 100);
        }}
        onKeyDown={tratarTecla}
        placeholder={value ? placeholder : searchPlaceholder}
        autoComplete="off"
        disabled={disabled}
      />
      <span className={styles.seta} aria-hidden="true">
        ⌄
      </span>

      {aberto && !disabled && (
        <div className={styles.opcoes} id={`${id}-opcoes`} role="listbox">
          {filtradas.length === 0 ? (
            <p className={styles.vazio}>Nenhum resultado encontrado</p>
          ) : (
            filtradas.map((option, index) => (
              <button
                className={index === indiceAtivo ? styles.ativa : ''}
                key={option.value}
                type="button"
                role="option"
                aria-selected={String(option.value) === String(value)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selecionar(option)}
                onMouseEnter={() => setIndiceAtivo(index)}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
