import styles from '../styles/ComprovanteVenda.module.css';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function possuiTexto(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

function formatarCentavos(valor) {
  return formatadorMoeda.format(Number(valor ?? 0) / 100);
}

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(data));
}

function ConteudoComprovante({ comprovante }) {
  const { venda } = comprovante;

  return (
    <div className={styles.recibo}>
      <div className={styles.dadosVenda}>
        <p>Venda: #{venda.id}</p>
        <p>Cliente: {venda.cliente}</p>
        <p>Data: {formatarData(venda.data)}</p>
      </div>

      <div className={styles.separador} />

      <div className={styles.itens}>
        <p className={styles.titulos}>Produtos</p>

        {venda.itens.map((item, index) => (
          <div
            className={styles.linhaItem}
            key={`${item.produtoId}-${index}`}
          >
            <strong className={styles.nomeProduto}>{item.nome}</strong>
            <div className={styles.detalhesItem}>
              <span className={styles.dadoItem}>
                <small>Qtd.</small>
                {item.quantidade}
              </span>
              <span className={styles.dadoItem}>
                <small>Preço unit.</small>
                {formatarCentavos(item.valorUnitario)}
              </span>
              <span className={styles.dadoItem}>
                <small>Subtotal</small>
                {formatarCentavos(item.subtotal)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.separador} />

      <p className={styles.total}>
        <span>Total</span>
        <strong>{formatarCentavos(venda.total)}</strong>
      </p>
    </div>
  );
}

export default function ComprovanteVenda({
  comprovante,
  comprovantes,
  totalGeral,
  elementoId,
}) {
  const lista = comprovantes ?? (comprovante ? [comprovante] : []);

  if (lista.length === 0) return null;

  const configuracao = lista[0].configuracao;
  const possuiCabecalho = [
    configuracao.nomeEmpresa,
    configuracao.documento,
    configuracao.telefone,
    configuracao.endereco,
  ].some(possuiTexto);

  return (
    <section
      id={elementoId}
      className={styles.comprovante}
      aria-hidden="true"
    >
      {possuiCabecalho && (
        <header className={styles.cabecalho}>
          {possuiTexto(configuracao.nomeEmpresa) && (
            <strong>{configuracao.nomeEmpresa.trim()}</strong>
          )}
          {possuiTexto(configuracao.documento) && (
            <span>{configuracao.documento.trim()}</span>
          )}
          {possuiTexto(configuracao.telefone) && (
            <span>{configuracao.telefone.trim()}</span>
          )}
          {possuiTexto(configuracao.endereco) && (
            <span>{configuracao.endereco.trim()}</span>
          )}
        </header>
      )}

      {lista.map((item) => (
        <ConteudoComprovante key={item.venda.id} comprovante={item} />
      ))}

      {totalGeral != null && (
        <>
          <div className={styles.separadorGeral} />
          <p className={`${styles.total} ${styles.totalGeral}`}>
            <span>Total geral</span>
            <strong>{formatarCentavos(totalGeral)}</strong>
          </p>
        </>
      )}

      {possuiTexto(configuracao.mensagemRodape) && (
        <p className={styles.rodape}>{configuracao.mensagemRodape.trim()}</p>
      )}
    </section>
  );
}
