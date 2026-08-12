const CLASSE_IMPRESSAO = 'impressao-documento-ativa';
const CLASSE_AREA = 'area-impressao-ativa';
const STYLE_ID = 'estilos-impressao-documento';

function removerPreparacao(elemento, tituloOriginal) {
  document.body.classList.remove(CLASSE_IMPRESSAO);
  elemento.classList.remove(CLASSE_AREA);
  document.getElementById(STYLE_ID)?.remove();
  document.title = tituloOriginal;
}

export function imprimirArea({
  elementoId,
  titulo,
  orientacao = 'portrait',
  larguraPapelMm,
  margemMm = 3,
}) {
  if (typeof window === 'undefined') return;

  const elemento = document.getElementById(elementoId);

  if (!elemento) {
    throw new Error(`Área de impressão não encontrada: ${elementoId}`);
  }

  const tituloOriginal = document.title;
  const estilos = document.createElement('style');
  estilos.id = STYLE_ID;
  estilos.textContent = `
    @page {
      size: ${larguraPapelMm ? 'auto' : `A4 ${orientacao}`};
      margin: ${larguraPapelMm ? 0 : '14mm'};
    }

    @media print {
      body.${CLASSE_IMPRESSAO} * {
        visibility: hidden !important;
      }

      body.${CLASSE_IMPRESSAO} {
        min-height: 0 !important;
        height: auto !important;
        margin: 0 !important;
        background: none !important;
      }

      body.${CLASSE_IMPRESSAO} *:not(.${CLASSE_AREA}):not(.${CLASSE_AREA} *):not(:has(.${CLASSE_AREA})) {
        display: none !important;
      }

      body.${CLASSE_IMPRESSAO} *:has(.${CLASSE_AREA}) {
        display: contents !important;
      }

      body.${CLASSE_IMPRESSAO} .${CLASSE_AREA},
      body.${CLASSE_IMPRESSAO} .${CLASSE_AREA} * {
        visibility: visible !important;
      }

      body.${CLASSE_IMPRESSAO} .${CLASSE_AREA} {
        position: ${larguraPapelMm ? 'static' : 'absolute'} !important;
        inset: ${larguraPapelMm ? 'auto' : '0 auto auto 0'} !important;
        width: ${larguraPapelMm ? `${larguraPapelMm}mm` : '100%'} !important;
        padding: ${larguraPapelMm ? `${margemMm}mm` : '0'} !important;
        box-sizing: border-box !important;
      }

      body.${CLASSE_IMPRESSAO} [data-nao-imprimir] {
        display: none !important;
      }
    }
  `;

  document.head.appendChild(estilos);
  document.body.classList.add(CLASSE_IMPRESSAO);
  elemento.classList.add(CLASSE_AREA);
  document.title = titulo;

  try {
    window.print();
  } finally {
    removerPreparacao(elemento, tituloOriginal);
  }
}

export function imprimirComprovantesVenda(comprovantes, elementoId) {
  if (!comprovantes.length) return;

  imprimirArea({
    elementoId,
    titulo:
      comprovantes.length === 1
        ? `Venda ${comprovantes[0].venda.id}`
        : `${comprovantes.length} vendas`,
    larguraPapelMm: comprovantes[0].configuracao.larguraPapelMm,
    margemMm: 3,
  });
}

export function imprimirComprovanteVenda(comprovante, elementoId) {
  imprimirComprovantesVenda([comprovante], elementoId);
}
