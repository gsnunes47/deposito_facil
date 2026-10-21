import { useEffect, useMemo, useState } from 'react';
import styles from '../styles/SelectPesquisavel.module.css';

function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export const PREFIXO_NOVO_ITEM = '__novo__:';

export default function SelectPesquisavel({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  searchPlaceholder = 'Digite para pesquisar',
  disabled = false,
  required = false,
  permitirNovo = false,
  rotuloNovo = (texto) => `Cadastrar novo: ${texto}`,
  limparAposSelecionar = false,
}) {
  const valorNovo =
    permitirNovo && String(value).startsWith(PREFIXO_NOVO_ITEM)
      ? String(value).slice(PREFIXO_NOVO_ITEM.length)
      : null;
  const selecionada =
    options.find((option) => String(option.value) === String(value)) ??
    (valorNovo !== null ? { value, label: valorNovo, novo: true } : undefined);
  const [consulta, setConsulta] = useState(selecionada?.label ?? '');
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  useEffect(() => {
    if (value || !aberto) {
      setConsulta(selecionada?.label ?? '');
    }
  }, [value]);

  const filtradas = useMemo(() => {
    const busca = normalizar(consulta);
    if (!busca || selecionada?.label === consulta) return options;

    return options.filter((option) => normalizar(option.label).includes(busca));
  }, [consulta, options, selecionada?.label]);

  const opcoesExibidas = useMemo(() => {
    const nomeNovo = consulta.trim();
    const existeOpcaoExata = options.some(
      (option) => normalizar(option.label) === normalizar(nomeNovo),
    );

    if (!permitirNovo || !nomeNovo || existeOpcaoExata || selecionada?.novo) {
      return filtradas;
    }

    return [
      ...filtradas,
      {
        value: `${PREFIXO_NOVO_ITEM}${nomeNovo}`,
        label: rotuloNovo(nomeNovo),
        textoSelecionado: nomeNovo,
        novo: true,
      },
    ];
  }, [
    consulta,
    filtradas,
    options,
    permitirNovo,
    rotuloNovo,
    selecionada?.novo,
  ]);

  function selecionar(option) {
    onChange(String(option.value));
    setConsulta(
      limparAposSelecionar ? '' : (option.textoSelecionado ?? option.label),
    );
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
        Math.min(indice + 1, Math.max(opcoesExibidas.length - 1, 0)),
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndiceAtivo((indice) => Math.max(indice - 1, 0));
      return;
    }

    if (event.key === 'Enter' && aberto && opcoesExibidas[indiceAtivo]) {
      event.preventDefault();
      selecionar(opcoesExibidas[indiceAtivo]);
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
          {opcoesExibidas.length === 0 ? (
            <p className={styles.vazio}>Nenhum resultado encontrado</p>
          ) : (
            opcoesExibidas.map((option, index) => (
              <button
                className={`${index === indiceAtivo ? styles.ativa : ''} ${option.novo ? styles.nova : ''}`}
                key={option.value}
                type="button"
                role="option"
                aria-selected={String(option.value) === String(value)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selecionar(option)}
                onMouseEnter={() => setIndiceAtivo(index)}
              >
                <span>{option.label}</span>
                {option.tipo && (
                  <span
                    className={`${styles.tipoOpcao} ${option.tipo === 'SERVICO' ? styles.tipoServico : styles.tipoProduto}`}
                    title={option.tipo === 'SERVICO' ? 'Serviço' : 'Produto'}
                    aria-label={
                      option.tipo === 'SERVICO' ? 'Serviço' : 'Produto'
                    }
                  >
                    {option.tipo === 'SERVICO' ? 'S' : 'P'}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
