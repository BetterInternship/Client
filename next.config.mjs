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
          "www.betterinternship.com",
          "dev.betterinternship.com",
          "localhost",
        ],
        destination: "student",
      },
    ];

    const rewrites = [];

    routes.forEach(({ hosts, destination }) => {
      hosts.forEach((host) => {
        // Rewrite everything except _next and root-level common files
        rewrites.push({
          source:
            "/:path((?!_next|BetterInternshipLogo|resume-loader|PrivacyPolicy|TermsConditions|Student_MOA|Company_Information|student-preview|hire-preview).*)*",
          has: [{ type: "host", value: host }],
          destination: `/${destination}/:path*`,
        });
      });
    });

    return {
      beforeFiles: rewrites,
    };
  },
};

export default nextConfig;
