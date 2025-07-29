import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // On server-side, dont use wasm
      // Could not make it work
      config.resolve.alias = {
        ...config.resolve.alias,
        'fast-utils': false,
      };
    } else {
      // Client-side WASM processing
      // Required for webpack to build with wasm
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
    }
    
    return config;
  },
};

export default nextConfig;
