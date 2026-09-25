import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import cadastroProdutos from '../assets/landing/cadastro de produtos.png';
import controleDespesas from '../assets/landing/controle de despesas.png';
import controleEstoque from '../assets/landing/controle de estoque.png';
import entrada from '../assets/landing/entrada.png';
import mobile from '../assets/landing/mobile.png';
import whatsappIcone from '../assets/landing/whatsapp.svg';
import registroEncomendas from '../assets/landing/registro das encomendas.png';
import registroVendas from '../assets/landing/registro das vendas.png';
import relatorios from '../assets/landing/relatórios.png';
import saida from '../assets/landing/saida.png';
import compact from '../styles/LandingMobileCompact.module.css';
import styles from '../styles/LandingTutorial.module.css';

const canonicalUrl = 'https://depositofacil.app.br/';

const etapas = [
  {
    numero: '01',
    etiqueta: 'Prepare a operação',
    titulo: 'Cadastre seus produtos uma única vez',
    descricao:
      'Comece organizando o catálogo do depósito. Criação, consulta, edição e exclusão ficam em um fluxo direto, sem misturar cadastro com movimentação de estoque.',
    destaques: ['Cadastro centralizado', 'Lista sempre disponível', 'Edição simples'],
    imagem: cadastroProdutos,
    alt: 'Tela do Depósito Fácil para cadastrar e consultar produtos',
  },
  {
    numero: '02',
    etiqueta: 'Abasteça o estoque',
    titulo: 'Registre cada entrada com fornecedor e custo',
    descricao:
      'Informe as quantidades recebidas e o preço unitário de cada item. Confira o custo total da compra antes da confirmação e mantenha a origem da movimentação.',
    destaques: ['Quantidade por produto', 'Preço por unidade', 'Custo total calculado'],
    imagem: entrada,
    alt: 'Tela de entrada de produtos com quantidades, preços e fornecedor',
  },
  {
    numero: '03',
    etiqueta: 'Acompanhe tudo',
    titulo: 'Veja o estoque atual e as últimas movimentações',
    descricao:
      'Consulte produtos cadastrados, unidades disponíveis e itens esgotados em uma única visão. As últimas entradas e saídas mostram rapidamente o que aconteceu.',
    destaques: ['Saldo por produto', 'Alertas de esgotamento', 'Histórico recente'],
    imagem: controleEstoque,
    alt: 'Painel de estoque com saldos, últimas entradas e últimas saídas',
  },
  {
    numero: '04',
    etiqueta: 'Venda com clareza',
    titulo: 'Registre a saída e confira o total antes de concluir',
    descricao:
      'Selecione cliente, data, quantidades e preços. O total fica visível durante o preenchimento para reduzir erros na rotina do balcão.',
    destaques: ['Cliente vinculado', 'Total da venda', 'Baixa no estoque'],
    imagem: saida,
    alt: 'Tela de registro de venda com produtos, cliente e preço total',
  },
];

const recursos = [
  {
    titulo: 'Vendas e pagamentos',
    descricao:
      'Acompanhe débitos por cliente, registre pagamentos, quite vendas e imprima comprovantes.',
    imagem: registroVendas,
    alt: 'Registro de vendas abertas e pagamentos de um cliente',
  },
  {
    titulo: 'Encomendas',
    descricao:
      'Visualize valores em aberto, total de caixas, pagamentos realizados e pendências por fornecedor.',
    imagem: registroEncomendas,
    alt: 'Registro de encomendas abertas e pagamentos a fornecedores',
  },
  {
    titulo: 'Controle de despesas',
    descricao:
      'Registre gastos operacionais e consulte o total mensal com navegação por período.',
    imagem: controleDespesas,
    alt: 'Controle mensal de despesas do Depósito Fácil',
  },
  {
    titulo: 'Relatórios gerenciais',
    descricao:
      'Acesse contas em aberto, resultado do período, resumo de vendas e recebimentos.',
    imagem: relatorios,
    alt: 'Central de relatórios do Depósito Fácil',
  },
];

export default function LandingPage() {
  const dadosEstruturados = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Depósito Fácil',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: canonicalUrl,
    description:
      'Sistema para gestão de estoque, controle de vendas e gestão financeira de depósitos e pequenos negócios.',
  };

  return (
    <>
      <Head>
        <title>Depósito Fácil | Gestão de estoque e vendas</title>
        <meta
          name="description"
          content="Conheça o Depósito Fácil: sistema para depósitos e pequenos negócios com controle de estoque, vendas, clientes, fornecedores, despesas, pagamentos, encomendas e relatórios."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Depósito Fácil" />
        <meta
          property="og:title"
          content="Depósito Fácil | Seu depósito organizado em um só lugar"
        />
        <meta
          property="og:description"
          content="Veja como organizar produtos, estoque, vendas e finanças em um fluxo simples."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }}
        />
      </Head>

      <div className={styles.pagina}>
        <header className={styles.cabecalho}>
          <div className={styles.limiteCabecalho}>
            <Link className={styles.marca} href="/" aria-label="Depósito Fácil — início">
              <span>DF</span>
              <strong>Depósito Fácil</strong>
            </Link>
            <nav className={styles.navegacao} aria-label="Navegação da apresentação">
              <a href="#como-funciona">Como funciona</a>
              <a href="#recursos">Recursos</a>
            </nav>
            <Link className={styles.botaoCabecalho} href="/login/2">
              Ver demonstração
            </Link>
          </div>
        </header>

        <main>
          <section className={styles.hero}>
            <div className={styles.limiteHero}>
              <div className={styles.conteudoHero}>
                <p className={styles.sobretitulo}>Gestão descomplicada</p>
                <h1>Seu depósito organizado em um só lugar.</h1>
                <p className={styles.textoHero}>
                  Controle produtos, movimentações, vendas e finanças com uma
                  visão simples da sua operação — do cadastro ao relatório.
                </p>
                <div className={styles.acoesHero}>
                  <Link className={styles.botaoPrimario} href="/login/2">
                    Explorar demonstração <span aria-hidden="true">→</span>
                  </Link>
                  <a className={styles.botaoSecundario} href="#como-funciona">
                    Ver como funciona
                  </a>
                </div>
                <ul className={styles.resumoHero}>
                  <li>Estoque atualizado</li>
                  <li>Vendas organizadas</li>
                  <li>Financeiro visível</li>
                </ul>
              </div>

              <div className={styles.capturaHero}>
                <div className={styles.moldura}>
                  <div className={styles.barraMoldura}>
                    <span /><span /><span />
                    <small>depositofacil.app.br</small>
                  </div>
                  <Image
                    src={controleEstoque}
                    alt="Visão geral do controle de estoque no Depósito Fácil"
                    priority
                    sizes="(max-width: 900px) 92vw, 56vw"
                  />
                </div>
                <div className={styles.legendaHero}>
                  <span>Visão real do sistema</span>
                  <strong>Estoque em uma única tela</strong>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.prova}>
            <p>Um fluxo completo para a rotina do depósito</p>
            <div>
              <span>Produtos</span><i /><span>Entradas</span><i />
              <span>Estoque</span><i /><span>Vendas</span><i /><span>Financeiro</span>
            </div>
          </section>

          <section className={styles.introducao} id="como-funciona">
            <p className={styles.sobretitulo}>Veja o produto em ação</p>
            <h2>Da chegada do produto à venda, passo a passo</h2>
            <p>
              As telas abaixo são do ambiente real de demonstração. Percorra o
              fluxo e veja como cada etapa se conecta à próxima.
            </p>
          </section>

          <section className={styles.tutorial}>
            {etapas.map((etapa, indice) => (
              <article
                className={[
                  styles.etapa,
                  indice % 2 ? styles.etapaInvertida : '',
                ].join(' ')}
                key={etapa.numero}
              >
                <div className={styles.textoEtapa}>
                  <div className={styles.numeroEtapa}>{etapa.numero}</div>
                  <p className={styles.etiquetaEtapa}>{etapa.etiqueta}</p>
                  <h3>{etapa.titulo}</h3>
                  <p className={styles.descricaoEtapa}>{etapa.descricao}</p>
                  <ul>
                    {etapa.destaques.map((destaque) => (
                      <li key={destaque}>
                        <span aria-hidden="true">✓</span>{destaque}
                      </li>
                    ))}
                  </ul>
                </div>
                <figure className={styles.capturaEtapa}>
                  <div className={styles.topoCaptura}>
                    <span /><span /><span /><small>Depósito Fácil</small>
                  </div>
                  <Image src={etapa.imagem} alt={etapa.alt} sizes="(max-width: 900px) 94vw, 58vw" />
                </figure>
              </article>
            ))}
          </section>

          <section className={styles.mobile}>
            <div className={styles.conteudoMobile}>
              <p className={styles.sobretitulo}>Acesso onde você estiver</p>
              <h2>Mantenha o controle mesmo longe do computador.</h2>
              <p>
                O Depósito Fácil funciona direto no navegador do celular.
                Consulte resultados e acompanhe as informações do negócio
                quando estiver no depósito, em uma entrega ou fora da empresa.
              </p>
              <ul>
                <li><span aria-hidden="true">✓</span>Consulte estoque e movimentações</li>
                <li><span aria-hidden="true">✓</span>Acompanhe vendas e pagamentos</li>
                <li><span aria-hidden="true">✓</span>Visualize relatórios financeiros</li>
              </ul>
              <Link className={styles.linkMobile} href="/login/2">
                Testar pelo celular <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className={`${styles.aparelho} ${compact.aparelho}`}>
              <div className={styles.altoFalante} aria-hidden="true" />
              <Image
                src={mobile}
                alt="Relatório financeiro do Depósito Fácil acessado pelo celular"
                sizes="(max-width: 760px) 76vw, 340px"
              />
            </div>
          </section>

          <section className={styles.recursos} id="recursos">
            <div className={styles.cabecalhoRecursos}>
              <div>
                <p className={styles.sobretitulo}>Depois da venda</p>
                <h2>Continue no controle</h2>
              </div>
              <p>
                O trabalho não termina no balcão. Pagamentos, encomendas,
                despesas e relatórios permanecem conectados à operação.
              </p>
            </div>
            <div className={styles.gradeRecursos}>
              {recursos.map((recurso) => (
                <article className={styles.recurso} key={recurso.titulo}>
                  <div className={styles.imagemRecurso}>
                    <Image src={recurso.imagem} alt={recurso.alt} sizes="(max-width: 700px) 92vw, 46vw" />
                  </div>
                  <div className={styles.textoRecurso}>
                    <h3>{recurso.titulo}</h3>
                    <p>{recurso.descricao}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.cta}>
            <div>
              <p className={styles.sobretitulo}>Conheça na prática</p>
              <h2>Explore o ambiente de demonstração.</h2>
              <p>
                Navegue pelas telas, teste os fluxos e veja como o Depósito
                Fácil pode organizar a rotina do seu negócio.
              </p>
            </div>
            <Link className={styles.botaoClaro} href="/login/2">
              Abrir demonstração <span aria-hidden="true">→</span>
            </Link>
          </section>

          <section className={styles.contato}>
            <div>
              <p className={styles.sobretitulo}>Fale comigo</p>
              <h2>Quer saber se o Depósito Fácil serve para o seu negócio?</h2>
              <p>
                Converse diretamente comigo. Posso apresentar o sistema,
                entender sua rotina e responder suas dúvidas.
              </p>
            </div>
            <a
              className={styles.botaoWhatsapp}
              href="https://wa.me/5511951178396?text=Ol%C3%A1%2C%20Gustavo!%20Conheci%20o%20Dep%C3%B3sito%20F%C3%A1cil%20pelo%20site%20e%20gostaria%20de%20saber%20mais."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src={whatsappIcone} alt="" aria-hidden="true" />
              Conversar pelo WhatsApp
            </a>
          </section>
        </main>

        <footer className={styles.rodape}>
          <div className={styles.limiteRodape}>
            <Link className={styles.marca} href="/">
              <span>DF</span><strong>Depósito Fácil</strong>
            </Link>
            <p>Gestão de estoque, vendas e finanças para pequenos negócios.</p>
            <div>
              <Link href="/login/2">Demonstração</Link>
            </div>
          </div>
          <div className={styles.baseRodape}>
            <small>© {new Date().getFullYear()} Depósito Fácil.</small>
            <small>
              Desenvolvido por{' '}
              <a
                href="https://www.linkedin.com/in/gsnunes47/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Gustavo Nunes
              </a>
            </small>
          </div>
        </footer>
      </div>
    </>
  );
}
