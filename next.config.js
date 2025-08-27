/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilitar standalone para evitar problemas con servidor personalizado
  // output: 'standalone',
  
  // Deshabilitar ESLint y TypeScript checking durante build para Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuración para imágenes externas (para las URLs de imágenes)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
}

module.exports = nextConfig
