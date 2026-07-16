import styles from '../styles/RegistroVendas.module.css';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const nomesFormaPagamento = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
};

function formatarCentavos(valor) {
  return formatadorMoeda.format(Number(valor ?? 0) / 100);
}

function formatarData(data) {
  if (!data) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(new Date(data))
    .toUpperCase();
}

export function calcularValorPendente(encomenda) {
  const totalPago = (encomenda.pagamentos ?? []).reduce(
    (total, pagamento) => total + Number(pagamento.valor ?? 0),
    0,
  );
  return Number(encomenda.total) - totalPago;
}

export function calcularCaixas(encomendas) {
  return encomendas.reduce(
    (total, encomenda) =>
      total +
      (Array.isArray(encomenda.produtos) ? encomenda.produtos : []).reduce(
        (subtotal, item) => subtotal + Number(item.quantidade ?? 0),
        0,
      ),
    0,
  );
}

export default function RegistroEncomendaCard({
  encomenda,
  produtosPorId,
  fornecedor,
  fechada = false,
  onAdicionarPagamento,
  onQuitarEncomenda,
  onExcluirPagamento,
}) {
  const itens = Array.isArray(encomenda.produtos) ? encomenda.produtos : [];
  const pagamentos = encomenda.pagamentos ?? [];
  const ultimoPagamento = pagamentos[pagamentos.length - 1];

  return (
    <article className={styles.venda}>
      <p className={styles.fornecedorCard}>
        Fornecedor:{' '}
        <strong>{fornecedor?.nome ?? `#${encomenda.fornecedor_id}`}</strong>
      </p>

      {fechada && (
        <p className={styles.dataPagamento}>
          Paga em:{' '}
          {formatarData(
            encomenda.data_quitacao ?? ultimoPagamento?.data_pagamento,
          )}
        </p>
      )}

      <h3>{formatarData(encomenda.data)}</h3>

      <div className={styles.itens}>
        {itens.map((item, index) => (
          <p key={`${item.id}-${index}`}>
            {item.quantidade}{' '}
            {produtosPorId[item.id]?.nome ?? `Produto #${item.id}`} —{' '}
            {formatarCentavos(item.valor_unitario)} por unidade
          </p>
        ))}
      </div>

      <p className={styles.valor}>
        Total: <strong>{formatarCentavos(encomenda.total)}</strong>
      </p>

      {!fechada && (
        <>
          <p className={styles.valor}>
            A pagar:{' '}
            <strong>{formatarCentavos(calcularValorPendente(encomenda))}</strong>
          </p>

          <div className={styles.acoes}>
            <button
              type="button"
              onClick={() => onAdicionarPagamento(encomenda)}
            >
              Registrar pagamento
            </button>
            <button
              className={styles.botaoQuitar}
              type="button"
              onClick={() => onQuitarEncomenda(encomenda)}
            >
              Quitar encomenda
            </button>
          </div>

          <div className={styles.pagamentos}>
            <h4>Pagamentos realizados</h4>
            {pagamentos.length === 0 ? (
              <p>Nenhum pagamento registrado.</p>
            ) : (
              <ul>
                {pagamentos.map((pagamento) => (
                  <li key={pagamento.id}>
                    <span>
                      {formatarCentavos(pagamento.valor)} —{' '}
                      {nomesFormaPagamento[pagamento.forma_pagamento] ??
                        pagamento.forma_pagamento}{' '}
                      — {formatarData(pagamento.data_pagamento)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onExcluirPagamento(pagamento)}
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </article>
  );
}
