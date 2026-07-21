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
      size: A4 ${orientacao};
      margin: 14mm;
    }

    @media print {
      body.${CLASSE_IMPRESSAO} * {
        visibility: hidden !important;
      }

      body.${CLASSE_IMPRESSAO} .${CLASSE_AREA},
      body.${CLASSE_IMPRESSAO} .${CLASSE_AREA} * {
        visibility: visible !important;
      }

      body.${CLASSE_IMPRESSAO} .${CLASSE_AREA} {
        position: absolute !important;
        inset: 0 auto auto 0 !important;
        width: 100% !important;
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
