import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section with Image */}
      <section className="w-full min-h-screen bg-marfim flex items-center justify-center">
        <div className="container mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center justify-between">
          <Image
            src="/logo-svg-27.svg"
            alt="Bemte.li"
            width={400}
            height={400}
            className="mb-8 md:mb-0"
          />
          <div className="md:ml-16 text-left">
            <h1 className="text-5xl font-bold mb-4">Uma alternativa de niusleter</h1>
            <p className="text-xl">100% brasileira, gratuita e de código aberto.</p>
          </div>
        </div>
      </section>

      {/* Yellow Section */}
      <section className="w-full py-16 bg-citrino">
        <div className="container mx-auto px-8 md:px-16">
          <h2 className="text-3xl font-bold mb-4">Saia do substack!</h2>
          <p className="text-lg max-w-2xl"> 
            Precisamos acreditar que mandar um simples email não pode depender dos negócios do Vale do Silício nem do dinheiro do petróleo.
          </p>
        </div>
      </section>

      {/* Dark Section */}
      <section className="w-full py-16 bg-sombra text-marfim">
        <div className="container mx-auto px-8 md:px-16">
        <h2 className="text-3xl font-bold mb-4">Para quem não aguenta mais o Instagram & não quer dar palco para outra bigueteque.</h2>
          <p className="text-lg max-w-2xl">
            O Bemte.li acredita que a internet deve ser feita pelas pessoas comuns, não pelas bigueteques.
          </p>
        </div>
      </section>

      {/* Light Section */}
      <section className="w-full py-16 bg-marfim">
        <div className="container mx-auto px-8 md:px-16">
        <h2 className="text-3xl font-bold mb-4">O Bemte.li envia emails e arquiva o conteúdo deles num endereço na internet.</h2> 
          <p className="text-lg max-w-2xl">
            Isso acontece gratuitamente, sem anúncios, com arrecadação coletiva, sem mediação das bigueteques.
          </p>
        </div>
      </section>
    </div>
  );
}
