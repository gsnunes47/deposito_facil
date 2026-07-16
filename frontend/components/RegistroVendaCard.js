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

export function calcularDebito(venda) {
  const totalPago = (venda.pagamentos ?? []).reduce(
    (total, pagamento) => total + Number(pagamento.valor ?? 0),
    0,
  );

  return Number(venda.total) - totalPago;
}

export default function RegistroVendaCard({
  venda,
  produtosPorId,
  fechada = false,
  selecionada = false,
  onSelecionar,
  onAdicionarPagamento,
  onQuitarVenda,
  onExcluirPagamento,
  onExcluirVenda,
}) {
  const itens = Array.isArray(venda.produtos) ? venda.produtos : [];
  const pagamentos = venda.pagamentos ?? [];
  const ultimoPagamento = pagamentos[pagamentos.length - 1];

  return (
    <article
      className={`${styles.venda} ${selecionada ? styles.vendaSelecionada : ''}`}
    >
      {!fechada && (
        <label className={styles.seletorVenda}>
          <input
            type="checkbox"
            checked={selecionada}
            onChange={() => onSelecionar(venda.id)}
          />
          Selecionar venda
        </label>
      )}
      {fechada && (
        <p className={styles.dataPagamento}>
          Pago em: {formatarData(ultimoPagamento?.data_pagamento ?? venda.data_quitacao)}
        </p>
      )}

      <h3>{formatarData(venda.data)}</h3>

      <div className={styles.itens}>
        {itens.map((item, index) => (
          <p key={`${item.id}-${index}`}>
            {item.quantidade} {produtosPorId[item.id]?.nome ?? `Produto #${item.id}`}{' '}
            — {formatarCentavos(item.valor_unitario)}
          </p>
        ))}
      </div>

      <p className={styles.valor}>
        Total: <strong>{formatarCentavos(venda.total)}</strong>
      </p>

      {!fechada && (
        <>
          <p className={styles.valor}>
            A pagar: <strong>{formatarCentavos(calcularDebito(venda))}</strong>
          </p>

          <div className={styles.acoes}>
            <button type="button" onClick={() => onAdicionarPagamento(venda)}>
              Adicionar pagamento
            </button>
            <button
              className={styles.botaoQuitar}
              type="button"
              onClick={() => onQuitarVenda(venda)}
            >
              Quitar venda
            </button>
            <button
              className={styles.botaoPerigo}
              type="button"
              onClick={() => onExcluirVenda(venda)}
            >
              Deletar venda
            </button>
          </div>

          <div className={styles.pagamentos}>
            <h4>Pagamentos</h4>

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
