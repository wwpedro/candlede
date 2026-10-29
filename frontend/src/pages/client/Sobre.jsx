import Container from '../../components/ui/Container.jsx'

// ============================================================
// TEXTOS E IMAGENS ESTÁTICAS
// ============================================================
const DADOS_SOBRE = {
  andreNome: 'André Dantas',
  andreCargo: 'Biomédico e Perfumista',
  andreTexto: 'Bom conhecedor dos mistérios da vida sob o microscópio, Dé sempre teve uma mente analítica e rigorosa. Formado como biomédico, ele encontrou na precisão dos laboratórios a base perfeita para explorar um universo completamente fascinante: a perfumaria. Mais do que misturar essências, entender a volatilidade das notas, a densidade dos óleos e a harmonia dos acordes olfativos exigia a exatidão de um cientista e a sensibilidade de um artista. Essa paixão o levou a cruzar fronteiras. Em uma viagem inesquecível a Houston, no Texas, mergulhou de cabeça em cursos de aprimoramento de aromas e técnicas avançadas de perfumaria, absorvendo cada detalhe para elevar sua arte a um patamar internacional.',
  andreImagem: '/images/andre.png',

  manifestoP1: 'Mas o verdadeiro coração da marca nasceu de um momento de profunda emoção. Durante o período em que sua mãe esteve internada lutando contra a leucemia, os corredores do hospital guardavam histórias silenciosas. Em um dos momentos mais difíceis, colocaram o desenho de uma borboleta na cama dela — um código discreto que indicava que ela havia entrado na fase de cuidados paliativos, um sinal de despedida. Aquele símbolo, que para muitos seria o fim, transformou-se no exato oposto no coração de Dé. A borboleta passou a representar a metamorfose definitiva: a alma que se liberta, a beleza que transcende a matéria e o amor maternal que continua a habitar cada espaço.',
  manifestoP2: 'Quando decidiu fundar sua marca de velas artesanais e perfumaria fina, o nome não poderia ser outro: Candlede. Uma união perfeita entre o brilho da vela (candle) e a homenagem eterna à sua mãe.',

  pessoalImagem:  '/images/pessoal1.png',
  pessoalCaption: 'A Essência em Forma de Chama',
  pessoalTexto:   'Hoje, cada frasco, cada cera derretida e cada acorde olfativo criado por Dé carrega essa história. Amante da vida, das viagens, da família e de proporcionar momentos únicos através dos sentidos, ele transformou a memória da borboleta em um manifesto de acolhimento. A Candlede é, em essência, isso: a ciência exata da perfumaria unida à sensibilidade de quem sabe que o amor verdadeiro, assim como uma chama bem cuidada, nunca se apaga — ele apenas se expande e ilumina tudo ao redor.',
}

export default function Sobre() {
  const c = DADOS_SOBRE

  return (
    <Container>
      <div className="about">

        {/* ---------- 1. APRESENTAÇÃO DO FUNDADOR ---------- */}
        <section className="about-intro">
          <div className="about-intro__media">
            <img
              src={c.andreImagem}
              alt={`${c.andreNome}, fundador da Candlede`}
            />
          </div>

          <div className="about-intro__text">
            <h1 className="about-intro__name">{c.andreNome}</h1>
            <p className="about-intro__role">{c.andreCargo}</p>
            <p className="about-intro__paragraph">{c.andreTexto}</p>
          </div>
        </section>

        {/* ---------- 2. SELO DA MARCA (BORBOLETA) ---------- */}
        <section className="about-seal">
          <img
            src="/images/borboleta.png"
            alt="Candlede - O símbolo da borboleta"
            className="about-seal__mark"
          />
        </section>

        {/* ---------- 3. DIVISOR ---------- */}
        <hr className="about-divider" />

        {/* ---------- 4. TEXTO INSTITUCIONAL (A HISTÓRIA DA BORBOLETA) ---------- */}
        <section className="about-manifesto">
          <p>{c.manifestoP1}</p>
          <p>{c.manifestoP2}</p>
        </section>

        {/* ---------- 5. DEPOIMENTO PESSOAL ---------- */}
        <section className="about-personal">
          <div className="about-personal__media">
            <img src={c.pessoalImagem} alt="Homenagem pessoal" />
          </div>
          <p className="about-personal__caption">{c.pessoalCaption}</p>
          <p className="about-personal__text">{c.pessoalTexto}</p>
        </section>

        {/* ---------- FECHAMENTO ---------- */}

      </div>
    </Container>
  )
}