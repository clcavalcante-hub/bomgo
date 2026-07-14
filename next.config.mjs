/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Stays serves listing photos from the account's own `*.stays.net`
    // domain (e.g. https://play.stays.net/image/...) — see
    // https://stays.net/external-api/. This covers every configured
    // connection without hardcoding a single account's subdomain.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.stays.net",
        pathname: "/image/**",
      },
    ],
  },
}

export default nextConfig
