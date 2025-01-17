import Image from 'next/image'
import Link from 'next/link'
import { Highlight } from '@/components/Highlight'
import { AuthorBio } from '@/components/AuthorBio'

export default function ExemploTexto() {
  return (
    <article className="prose lg:prose-xl">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-black no-underline">
          <Highlight color="citrino" className="text-4xl">←</Highlight>
        </Link>
      </div>

      <div className="text-sm text-gray-600 mb-4 font-mono">
        17/jan/24 às 19:45
      </div>

      <h1 className="mt-0 mb-8 text-sombra">
        fantasias de um brasil sem meta
      </h1>

      <div className="font-serif text-sombra">
        <p>
        Entrei numa espécie de crise existencial recentemente quando percebi que minha
doppelgänger digital atingiu a maioridade. Com isso eu quero dizer que já tem dezoito
anos desde que criei meu primeiro perfil numa rede social – Orkut, depois Fotolog,
Twitter, Facebook. E, de lá pra cá, a última vez que eu usei tão pouco esses espaços
digitais foi pré-2009, antes de ter acesso à internet banda larga em casa e muito antes do
smartphone virar uma extensão do meu corpo.
        </p>

        <p>
Esse papo de redes sociais tem preenchido meus dias. Parece que quanto mais eu me
esforço pra ficar longe das plataformas, mais eu penso sobre elas. E como não? Quando
o Twitter virou X, excluí meu perfil justamente porque ele passaria a servir aos interesses
de Elon Musk (a partir de 20 de janeiro, Musk-Trump). Agora, desde o anúncio de Mark
Zuckerberg sobre o fim da checagem de dados nas plataformas da Meta nos Estados
Unidos (também alinhado à agenda de Trump) e sua menção aos &quot;tribunais secretos&quot;
latinoamericanos, eu me sinto numa sinuca de bico.
        </p>

        <p>
Nos últimos anos, eu testei uma série de estratégias para reduzir meu tempo no Instagram.
Primeiro tirei as notificações, fiz inúmeros períodos de &quot;detox&quot;, depois ativei o bloqueio
automático do app após 30 minutos de uso e, atualmente, não tenho o aplicativo no
celular e acesso só pelo computador. Mas eu nunca desativei a conta. Em certa medida é
porque meu trabalho vai parar no Instagram. Me esqueço disso com facilidade porque eu
não trabalho na plataforma, mas crio imagens que são publicadas lá e eu preciso checar
os perfis de quem me contrata eventualmente. E eu não sei se você já entrou no Instagram
sem estar logado, mas é praticamente impossível ver qualquer coisa sem uma conta ativa.
        </p>

        <p>
Piora: está quase todo mundo ali, as pessoas, as marcas e as pessoas-marcas: da amiga
que compartilha memes ao restaurante que eu gostaria de ir. No fundo, eu sei que não
preciso dos memes e posso pesquisar no Google sobre o restaurante, mas existe um
modus operandi de existir e interagir com as pessoas e as coisas que coloca o perfil no
centro. É o que aponta Naomi Klein, em seu livro Doppelgänger: uma viagem através do
Mundo-Espelho, com palavras muito mais bonitas que as minhas: &quot;o processo de
cercamento e cerceamento, de restrição da possibilidade de realização de nossas
atividades dentro dos limites dessas plataformas privativas, acaba por nos mudar,
incluindo a forma como nos relacionamos uns com os outros e o propósito subjacente
dessas relações.&quot;
        </p>

        <p>
Após o vídeo do Zuckerberg, que eu não assisti, mas acompanhei toda a repercussão – na
GloboNews e nos veículos que eu sigo no Feedly, duas novas fontes de informação que
eu passei a acompanhar depois que diminui o uso das mídias sociais – eu comecei a
fantasiar sobre um Brasil onde a Meta não opera. Mandei mensagens para alguns grupos
perguntando por onde a gente se falaria se não tivesse mais WhatsApp no Brasil. Teria
uma migração em massa para o Telegram, provavelmente. Minha mãe aprenderia a usar
um novo aplicativo ou a gente se ligaria mais, quem sabe? Os planos de internet móvel
teriam que mudar já que hoje oferecem pacotes que beneficiam as plataformas da Meta.
Haveria crises de abstinência, ghostings involuntários. Seria um caos, mas um caos
maravilhoso. No trabalho, todo mundo ia voltar a se comunicar por e-mail, depois migrar
pro Slack ou outro similar. Mas o deleite terminou aqui: percebi que eu ia ficar
praticamente sem trabalho. Muita gente ia ficar completamente sem trabalho. O que
acabou com o meu entusiasmo, porém, não foi pensar na massa de desempregados e
&quot;desempregados&quot; que um Brasil sem Instagram, WhatsApp e Facebook produziria, mas
como a gente chegou até aqui. Como a gente deixou que poucas empresas controladas por
homens ultrarricos moldassem a materialidade a esse ponto? As redes sociais tornam a
qualidade de vida precária, mas se essas mesmas plataformas fossem proibidas de operar
seríamos submetidos a um outro tipo de precarização. &quot;É o que acontece quando
permitimos que muitas das nossas ações antes privadas sejam engolidas por plataformas
tecnológicas corporativas cujos fundadores juraram de pés juntos que o objetivo era nos
conectar, mas na verdade sua intenção sempre foi extrair coisas de nós.&quot; (Klein, 2024)
        </p>

        <p>
É nesse ponto que bate uma desesperança. E se não tiver mesmo como melhorar? E se os
revolucionários do passado, com suas palavras e ações que produzem faíscas de
esperança, viveram numa época onde ainda era possível construir algo diferente e agora
não é mais? E se a gente tiver frente a uma realidade irreversível? Aqui eu poderia estar
falando da crise climática, mas é dessa ditadura digital promovida pelos donos das
bigueteques – que, com cada vez mais frequência, aparecem como eles mesmos, sem
precisar se esconder atrás da institucionalidade de suas corporações. A sensação que eu
tenho é que eles controlam o mundo, que nos controlam. Nesses momentos, penso no
rapaz que assassinou o CEO da UnitedHealthcare. Fico imaginando manchetes que
dizem: Zuckerberg morto, Musk morto, Bezos morto. Não tenho vergonha de admitir que
me emociono com a ideia, esses homens são responsáveis pelo sofrimento de bilhões de
pessoas. Mas essa é a nossa melhor aposta? Ficar de braços cruzados – ou descruzados,
rolando linhas do tempo infinitas – aguardando o próximo Luigi Mangione e ver o que
acontece?
        </p>

        <p>
O meu campo de atuação política (e me sinto até mal de usar a palavra &quot;atuação&quot;, pois não
acho que posso chamar o que faço, o que a maioria de nós na esquerda faz, de atuar) segue
perdendo na disputa dos espaços digitais. Tentar combater as teorias da conspiração
apenas com checagem de fatos já se mostrou ineficaz, pois o primeiro encanta e o
segundo é chato e elitista (Demuru, 2024). Recentemente, ouvi uma entrevista com o
Felipe Neto, no podcast Fio da Meada, e, para ele, que trabalha na internet desde os anos
2010 e passou por uma raríssima guinada à esquerda do espectro político, a esquerda
nunca vai ganhar essa disputa sem regulamentação, ou seja, sem leis que as bigueteques
sejam obrigadas a cumprir, pois os algoritmos são desenhados para disseminar o discurso
que faz a extrema direita ser a extrema direita. Mas eu me pergunto se é possível, se o
nosso Estado é realmente mais forte que esses ditadores ultrarricos. E, se for o suficiente
para barrá-los no Brasil, é forte e inteligente o bastante para bancar as pressões e crises
que vão desencadear se a Meta deixar de operar no país?
        </p>

        <p>
A pequena parte de mim que luta contra o fatalismo acha que, a longo prazo, seria
positivo. Grandes transformações não acontecem sem sacrifícios. Nossa sociedade
capitalista neoliberal hiperindivualizada também só existe porque sacrificamos humanos
e não-humanos todos os segundos. Quando paro de olhar só pro meu umbigo, ficar sem
trabalho porque a Meta parou de operar no Brasil parece um problema que vale enfrentar.
Não sei se isso vai acontecer e, se acontecer, não acredito que se mantenha por muito
tempo, como aconteceu com o X. Mas acho importante manter o sonho – uma sociedade
livre dos monopólios das bigueteques – no horizonte pra que caminhos até ele sejam
pensados, traçados e percorridos.
        </p>
      </div>

      <div className="mt-16">
        <AuthorBio 
          name="Luana Adriano"
          bio="Luana constrói o Bemte.li, lê pensa & escreve sobre internet, política, trabalho e o colapso civilizatório em curso."
          imageUrl="https://placehold.co/300x400"
        />
      </div>
    </article>
  )
} 