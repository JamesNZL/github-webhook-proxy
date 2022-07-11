/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://github.com/JamesNZL',
        permanent: false,
      },
      {
        source: '/:path((?!api/).*)',
        destination: 'https://github.com/JamesNZL',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
