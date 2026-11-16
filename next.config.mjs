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
      // directions that no longer exist
      { source: '/catalog/dlya-terras', destination: '/catalog', permanent: true },
      { source: '/catalog/dlya-vannoy', destination: '/catalog', permanent: true },
      { source: '/catalog/dlya-kuhni', destination: '/catalog', permanent: true },
    ];
  },
  // the 3D planner (another origin) loads tile textures from here
  async headers() {
    // photos and videos are static files: let browsers and Cloudflare keep them for a week
    const keep = { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' };
    const cors = { key: 'Access-Control-Allow-Origin', value: '*' };
    return [
      { source: '/tiles/:path*', headers: [cors, keep] },
      { source: '/doors2/:path*', headers: [cors, keep] },
      { source: '/sofas/:path*', headers: [cors, keep] },
      { source: '/directions/:path*', headers: [keep] },
      { source: '/screws/:path*', headers: [keep] },
      { source: '/brands/:path*', headers: [keep] },
      { source: '/hero/:path*', headers: [keep] },
    ];
  },
  images: {
    // WebP only: AVIF is a little smaller but several times slower to produce on the server,
    // which is what made the first opening of every photo slow
    formats: ['image/webp'],
    // the resized copy of a photo never changes: keep it a year (browser + Cloudflare)
    minimumCacheTTL: 31536000,
    // fewer size variants = fewer copies to produce and to cache
    deviceSizes: [640, 828, 1080, 1280, 1600],
    imageSizes: [128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
