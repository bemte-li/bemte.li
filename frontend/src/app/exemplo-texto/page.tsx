import Image from 'next/image'
import Link from 'next/link'
import { Highlight } from '@/components/Highlight'

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

      <h1 className="mt-0 mb-8">
          fantasias de um brasil sem meta
      </h1>

      <Image 
        src="https://images.unsplash.com/photo-1578985545062-69928b1d9587"
        alt="Bolo de chocolate"
        width={800}
        height={400}
        className="rounded-lg mb-8"
      />

      <p>
        Fazer um bolo de chocolate perfeito é uma arte que combina técnica e amor pela culinária. 
        Neste post, vou compartilhar com você minha receita favorita e todas as dicas que aprendi 
        ao longo dos anos para conseguir um resultado extraordinário.
      </p>

      <h2>Ingredientes essenciais</h2>
      
      <p>
        A qualidade dos ingredientes faz toda a diferença. Use sempre chocolate em pó de boa 
        qualidade, ovos frescos e manteiga sem sal. A temperatura dos ingredientes também é 
        crucial - todos devem estar em temperatura ambiente antes de começar.
      </p>

      <h2>O segredo está no processo</h2>
      
      <p>
        Muita gente não sabe, mas a ordem de adição dos ingredientes e o tempo de batida 
        são fundamentais para conseguir uma massa aerada e uniforme. Comece peneirando os 
        ingredientes secos para evitar grumos e incorpore os líquidos gradualmente.
      </p>

      <blockquote>
        &ldquo;O segredo de um bolo perfeito está nos pequenos detalhes e no amor que colocamos 
        ao preparar cada ingrediente.&rdquo;
      </blockquote>

      <p>
        Este é apenas um exemplo de como podemos transformar uma simples receita em uma 
        experiência memorável. Continue acompanhando nosso blog para mais dicas e receitas 
        incríveis.
      </p>
    </article>
  )
} 