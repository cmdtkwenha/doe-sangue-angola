const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  turbopack: {
    root: path.join(__dirname, "../..")
  },
  transpilePackages: [
    "@doe-sangue-angola/shared-types",
    "@doe-sangue-angola/shared-services",
    "@doe-sangue-angola/agents"
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
