'use client'

import { useState, useEffect } from 'react'
import { createInscricao } from '@/lib/pocketbase'
import Image from 'next/image'

interface SubscriptionFormProps {
  niusleterId: string
}

export function SubscriptionForm({ niusleterId }: SubscriptionFormProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [subscriptionMessage, setSubscriptionMessage] = useState<string>('')
  const [email, setEmail] = useState('')
  const [nota, setNota] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Check localStorage on component mount
  useEffect(() => {
    const subscriptionKey = `subscription_${niusleterId}`
    const savedSubscription = localStorage.getItem(subscriptionKey)
    if (savedSubscription) {
      const subscriptionData = JSON.parse(savedSubscription)
      setIsSubscribed(true)
      setEmail(subscriptionData.email)
      setSubscriptionStatus('success')
    }
  }, [niusleterId])

  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSubscriptionStatus('loading')
    setSubscriptionMessage('')
    
    try {
      await createInscricao({
        email,
        nota: nota.trim() || undefined,
        niusleter: niusleterId
      })
      
      // Save subscription to localStorage
      const subscriptionKey = `subscription_${niusleterId}`
      localStorage.setItem(subscriptionKey, JSON.stringify({
        email,
        subscribedAt: new Date().toISOString()
      }))
      
      setSubscriptionStatus('success')
      setIsSubscribed(true)
      setNota('')
    } catch (error: any) {
      setSubscriptionStatus('error')
      if (error.data?.data?.email?.code === 'validation_not_unique') {
        setSubscriptionMessage('Este e-mail já está inscrito nesta niusleter.')
        
        // Save to localStorage even if already subscribed
        const subscriptionKey = `subscription_${niusleterId}`
        localStorage.setItem(subscriptionKey, JSON.stringify({
          email,
          subscribedAt: new Date().toISOString()
        }))
        setIsSubscribed(true)
        setSubscriptionStatus('success')
      } else {
        setSubscriptionMessage('Erro ao realizar inscrição. Tente novamente mais tarde ou entre em contato.')
      }
      console.error('Subscription error:', error)
    }
  }

  // Success state - similar to solicitar-convite
  if (subscriptionStatus === 'success' && isSubscribed) {
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-sombra mb-6 text-center px-4">
          Você se inscreveu!
        </h2>
                <div className="text-center transition-all duration-500 ease-in-out w-full max-w-lg px-4">
          <div className="w-24 mx-auto mb-6">
            <Image
              src="/Passaro-Convite.svg"
              alt="Pássaro com envelope"
              width={150}
              height={150}
              priority
            />
          </div>
           
          <p className="text-sombra mb-2 text-sm sm:text-base">
            E receberá os próximos textos no seu e-mail:
          </p>
          <p className="text-sombra font-mono text-sm break-all">
            {email}
          </p>
          <p className="text-sombra mt-4 text-sm">
            Obrigado por fazer parte!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-sombra mb-6 text-center px-4">
          Receba os textos por e-mail
        </h2>
      <div className="w-full max-w-md">
        <form onSubmit={handleSubscriptionSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col">
          <label htmlFor="email" className="font-mono">E-mail:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-b border-sombra focus:outline-none py-1"
            required
            disabled={subscriptionStatus === 'loading'}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="nota" className="font-mono">Por que você quer se inscrever? (opcional):</label>
          <textarea
            id="nota"
            rows={3}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="bg-transparent border border-sombra focus:outline-none py-2 px-2 resize-none placeholder:text-sombra/60"
            placeholder="Conte um pouco sobre por que esta niusleter te interessa..."
            disabled={subscriptionStatus === 'loading'}
          />
        </div>
        {subscriptionStatus === 'error' && subscriptionMessage && (
          <div className="text-center text-sm text-sombra">
            {subscriptionMessage}
          </div>
        )}
        <button
          type="submit"
          disabled={subscriptionStatus === 'loading'}
          className="bg-marfim text-sombra px-8 py-2 self-center hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {subscriptionStatus === 'loading' ? 'Inscrevendo...' : 'Inscrever-se'}
        </button>
        </form>
      </div>
    </div>
  )
}
