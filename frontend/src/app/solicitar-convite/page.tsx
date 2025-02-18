"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createConvite } from "@/lib/pocketbase";
import Footer from "@/components/Footer";

export default function SolicitarConvite() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    sobre: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createConvite(formData);
      setIsSubmitted(true);
    } catch (err) {
      setError('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
      console.error('Error submitting form:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-marfim flex flex-col items-center px-4">
      {/* Logo */}
      <div className="mt-8 mb-24">
        <Link href="/">
          <Image
            src="/Logo-Vertical.svg"
            alt="Bemte.li"
            width={120}
            height={40}
            priority
          />
        </Link>
      </div>

      <div className="relative w-full max-w-xl">
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            isSubmitted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <div className="text-center">
            <div className="w-32 mx-auto mb-12">
              <Image
                src="/Passaro-Convite.svg"
                alt="Pássaro com envelope"
                width={200}
                height={200}
                priority
              />
            </div>

            <h1 className="text-2xl mb-4 text-sombra font-bold">
              Recebemos a sua solicitação, {formData.nome}!
            </h1>
            
            <p className="text-lg text-sombra">
              Em breve entraremos em contato no e-mail<br />
              {formData.email}.
            </p>
          </div>
        </div>

        <div
          className={`transition-all duration-500 ease-in-out ${
            isSubmitted ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
          }`}
        >
          <h1 className="text-center mb-12 text-lg text-sombra">
            Explicação breve sobre porque precisa de convite.
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name and Email Inputs Container */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Name Input */}
              <div className="flex-1 flex items-center gap-2">
                <label className="text-sombra whitespace-nowrap">Nome:</label>
                <input
                  type="text"
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                  className="w-full border-b border-sombra bg-transparent pb-1 focus:outline-none focus:border-sombra transition-colors text-sombra"
                />
              </div>

              {/* Email Input */}
              <div className="flex-1 flex items-center gap-2">
                <label className="text-sombra whitespace-nowrap">E-mail:</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full border-b border-sombra bg-transparent pb-1 focus:outline-none focus:border-sombra transition-colors text-sombra"
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div className="relative">
              <textarea
                id="sobre"
                value={formData.sobre}
                onChange={(e) =>
                  setFormData({ ...formData, sobre: e.target.value })
                }
                rows={8}
                required
                placeholder="Conte sobre você e seu interesse em participar do Bemte.li"
                className="w-full border border-sombra bg-transparent p-4 focus:outline-none focus:border-sombra transition-colors resize-none text-sombra placeholder:text-sombra/60"
              />
            </div>

            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-citrino px-6 py-2 text-sm hover:bg-citrino/90 transition-colors text-sombra disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Solicitar convite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
