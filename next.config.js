/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'lh3.googleusercontent.com'
    ],
  },
  env: {
    // Removed CUSTOM_KEY reference to fix missing environment variable warning
  },
}

module.exports = nextConfig