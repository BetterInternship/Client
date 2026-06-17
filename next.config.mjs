const apiUrls = [
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_MOA_API_URL,
  process.env.NEXT_PUBLIC_API_SERVER_URL,
  process.env.NEXT_PUBLIC_ORCA_URL,
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

const imageOrigins = [
  ...apiUrls,
  "https://storage.googleapis.com",
]
  .map((url) => {
    try {
      return new URL(url).origin;
    } catch (e) {
      return "";
    }
  })
  .filter(Boolean)
  .join(" ");

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com;
  frame-src 'self' http://localhost:* ${connectOrigins};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: http://localhost:* ${imageOrigins};
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' http://localhost:* https://storage.googleapis.com ${connectOrigins};
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
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
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
