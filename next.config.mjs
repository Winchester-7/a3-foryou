/** @type {import('next').NextConfig} */
const PLANNER_URL = process.env.NEXT_PUBLIC_PLANNER_URL ?? 'https://a3-foryou-3d.netlify.app';

const nextConfig = {
  reactStrictMode: true,
  // Docker image: self-contained server (see Dockerfile). Netlify keeps its own runtime.
  output: process.env.BUILD_TARGET === 'docker' ? 'standalone' : undefined,
  // the old flat configurator now lives as a standalone 3D planner on its own domain
  async redirects() {
    return [
      { source: '/configurator', destination: PLANNER_URL, permanent: false },
      { source: '/news', destination: '/portfolio', permanent: true },
      { source: '/news/:slug*', destination: '/portfolio', permanent: true },
      { source: '/interior', destination: '/catalog', permanent: true },
      { source: '/interior/:category*', destination: '/catalog', permanent: true },
      { source: '/catalog-almaty', destination: '/catalog', permanent: true },
    ];
  },
  // the 3D planner (another origin) loads tile textures from here
  async headers() {
    return [
      { source: '/tiles/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] },
      { source: '/doors2/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] },
      { source: '/sofas/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
