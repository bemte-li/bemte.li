import Image from "next/image";
import { Highlight } from "@/components/Highlight";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-marfim">
      {/* Hero Section with Logo and Tagline */}
      <section className="w-full py-16 flex flex-col items-center justify-center text-center">
        <Image
          src="/Logo-Vertical.svg"
          alt="Bemte.li"
          width={300}
          height={300}
          className="mb-8"
        />
        <div className="text-center mb-8">
          <h1 className="text-2xl font-mono mb-2">Uma alternativa de niusleter</h1>
          <p className="text-lg font-mono">100% brasileira, gratuita e<br />de código aberto.</p>
        </div>
        
        <Link href="/solicitar-convite" className="bg-citrino hover:bg-citrino/90 text-sombra font-bold py-3 px-6 w-64 text-center mb-16">
          SOLICITE UM CONVITE
        </Link>
      </section>

      <section className="w-full">
        <div className="container mx-auto px-8 md:px-16">
          <div className="max-w-2xl mx-auto space-y-6 text-base font-mono text-justify">
            <p>
              O Bemte.li não é uma plataforma, nem um aplicativo. Não tem anúncios, não tem empresários, não tem visão de lucro. Não é uma rede social algoritmizada e algoritmizável. Não é o desejo de ser um grande negócio.
            </p>
            
            <p>
              <strong>O Bemte.li envia e-mails e arquiva seus conteúdos num endereço na Internet.</strong> Isso acontece gratuitamente, repetimos, mas com arrecadação coletiva, sem anúncios e sem mediação das bigueteques. Ele é desenvolvido por três pessoas – uma designer, um programador e um escritor – com vontade de resgatar um canto da internet que foi desmantelado pelo capitalismo de plataforma. Resgatar um espaço digital e um modo de acessar a internet que, em quinze anos, praticamente desaparaceu.
            </p>
            
            <hr className="border-t border-sombra/20 my-8" />
            
            <p>
              Partimos de uma convicção (ingênua, porém convicção): a de <strong>fazer algo, na internet, que ruma na contramão do feudalismo digital.</strong> E resgatar a importância de um projeto — pessoal e coletivo — genuinamente criativo, em que não estamos apenas produzindo para os outros. Um ponto de partida? Acreditar que mandar um simples e-mail não pode depender dos negócios do Vale do Silício, nem do Fundo Árabe. Acreditar que a <strong>internet deve ser feita pelas pessoas comuns, não por grandes empresas privadas</strong>.
            </p>
            
            <p>
              Para dar nome aos bois: nossa revoada foi catalisada pelo desejo de publicar textos de niusleter fora do Substack. Porque <strong>Substack não é sinônimo de niusleter</strong>. E também motivada por uma certa angústia em assistir a muitas pessoas que continuam a migrar, por razões éticas e políticas, do Instagram para... o Substack. Mas o Substack é apenas mais uma rede social — um pequeno grande império de lucro californiano, cuja intenção de repensar os rumos da internet é zero, e a vontade de ganhar muito dinheiro é total.
            </p>
            
            <hr className="border-t border-sombra/20 my-8" />
            
            <p>
              Nossa empreitada é coletiva e transparente. Por isso nosso <Link href="https://github.com/bemte-li/bemte.li"><Highlight color="citrino"><strong>código é aberto</strong></Highlight></Link>, como quem te oferece um pedaço de bolo (mas sem <em>cookies</em>) e logo te dá a receita. Isso significa que qualquer um pode <strong>contribuir, inspecionar e copiar tudo que o Bemte.li faz.</strong> Aqui não existem os desejos e perversidades do algoritmo. Tudo que acontece enquanto você navega por nossas páginas – de ler este texto a enviar e-mails para as pessoas inscritas – foi previamente descrito em um editor de texto por um ser humano. Se imaginamos como uma carta chega ao seu destinatário, quando perdemos a noção de como esses processos acontecem na Internet?
            </p>
            
            <hr className="border-t border-sombra/20 my-8" />
            
            <p>
              No mais, o Bemte.li são algumas coisas um tanto estéticas: o apreço pelo texto, pela literatura, pelas palavras aportuguesadas, pelo debate político e filosófico, e por uma internet menos derretedora de cérebros.
            </p>
            
            <div className="mt-10 mb-16 flex justify-center">
              <Link href="/solicitar-convite" className="bg-citrino hover:bg-citrino/90 text-sombra font-bold py-3 px-6 w-64 text-center">
                SOLICITE UM CONVITE
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
