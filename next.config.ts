import type { NextConfig } from "next";

// 👇 use require (this fixes the error)
const nextPWA = require("next-pwa");

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);