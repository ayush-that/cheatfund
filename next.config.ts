import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },

  serverExternalPackages: ["@anon-aadhaar/core", "@anon-aadhaar/react"],

  turbopack: {
    root: "/Users/shydev/cheatfund",
    resolveAlias: {
      fs: "false",
      readline: "false",
      path: "false",
      crypto: "false",
      stream: "false",
      util: "false",
      buffer: "false",
      constants: "false",
      os: "false",
      net: "false",
      tls: "false",
      child_process: "false",
    },
  },
};

export default nextConfig;
