/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['res.cloudinary.com'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          port: '',
          pathname: 'dwomj0f7i', // Replace with your cloud name
        },
      ],
    },
  }
  
  export default nextConfig;