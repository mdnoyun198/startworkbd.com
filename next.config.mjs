/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },

  // Add this for cross-origin dev warning
  experimental: {
    allowedDevOrigins: ['http://192.168.0.102:3000'], // যেটা তুই local থেকে access করছিস
  },

  
};

export default nextConfig;
