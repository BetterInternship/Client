const apiUrls = [
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_MOA_API_URL,
  process.env.NEXT_PUBLIC_API_SERVER_URL,
  process.env.NEXT_PUBLIC_SUPABASE_URL,
].filter(Boolean);

const connectOrigins = apiUrls
  .map((url) => {
    try {
      const parsed = new URL(url);
      const origin = parsed.origin;
      if (origin.startsWith("https://")) {
        return `${origin} ${origin.replace("https://", "wss://")}`;
      }
      if (origin.startsWith("http://")) {
        return `${origin} ${origin.replace("http://", "ws://")}`;
      }
      return origin;
    } catch (e) {
      return "";
    }
  })
  .filter(Boolean)
  .join(" ");

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' http://localhost:* ${connectOrigins};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, "");

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

  // content security policy headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
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
            "/:path((?!_next|fonts|BetterInternshipLogo|og|resume-loader|maintenance|PrivacyPolicy|TermsConditions|Student_MOA|Company_Information|student-preview|hire-preview|miro-preview|super-listings|student/ph-topojson).*)*",
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
