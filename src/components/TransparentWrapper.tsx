'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface TransparentWrapperProps {
  children: React.ReactNode
}

export default function TransparentWrapper({ children }: TransparentWrapperProps) {
  const pathname = usePathname()
  const isRuletaPage = pathname === '/ruleta'

  useEffect(() => {
    if (isRuletaPage) {
      // Aplicar clases de transparencia
      document.documentElement.classList.add('transparent-html')
      document.body.classList.add('transparent-body')
      
      // Limpiar al desmontar
      return () => {
        document.documentElement.classList.remove('transparent-html')
        document.body.classList.remove('transparent-body')
      }
    }
  }, [isRuletaPage])

  if (isRuletaPage) {
    return <div className="ruleta-transparent-wrapper">{children}</div>
  }

  return <>{children}</>
}
