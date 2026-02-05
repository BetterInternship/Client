/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const routes = [
      {
        hosts: [
          "hire.betterinternship.com",
          "hire.dev.betterinternship.com",
          "hire.localhost",
        ],
        destination: "hire",
      },
      {
        hosts: [
          "betterinternship.com",
          "dev.betterinternship.com",
          "localhost",
        ],
        destination: "student",
      },
    ];

    const beforeFiles = [];

    routes.forEach(({ hosts, destination }) => {
      hosts.forEach((host) => {
        // Root path
        beforeFiles.push({
          source: "/",
          has: [{ type: "host", value: host }],
          destination: `/${destination}`,
        });
        // All other paths (excluding static assets)
        beforeFiles.push({
          source: "/:path((?!_next|api|favicon.ico|.*\\..*).*)",
          has: [{ type: "host", value: host }],
          destination: `/${destination}/:path*`,
        });
      });
    });

    return { beforeFiles };
  },
};

export default nextConfig;
