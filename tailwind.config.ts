import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        /*
         * Display headlines (English brand text and Bengali h1/h2)
         * resolve to Hind Siliguri 700 — same family as the body font,
         * so headlines paint the moment the body font is available.
         * Previously this was Noto Serif Bengali (a separate ~150 KB
         * download); removing it was the largest single LCP win.
         * Georgia is the system fallback for Latin glyphs.
         */
        display: [
          "var(--font-bangla)",
          "Georgia",
          "Cambria",
          "serif"
        ],
        "display-bn": [
          "var(--font-bangla)",
          "Georgia",
          "Cambria",
          "serif"
        ],
        // Body — Latin via Inter, Bengali via Hind Siliguri.
        sans: [
          "var(--font-sans)",
          "var(--font-bangla)",
          "system-ui",
          "sans-serif"
        ],
        bangla: ["var(--font-bangla)", "Hind Siliguri", "sans-serif"]
      },
      colors: {
        mango: {
          50: "#fff8e6",
          100: "#ffecb8",
          200: "#ffdc80",
          300: "#ffc94d",
          400: "#ffb01f",
          500: "#f59100",
          600: "#d97606",
          700: "#a8560a",
          800: "#7a3f0d",
          900: "#5a2e0a"
        },
        leaf: {
          400: "#5cb85c",
          500: "#3a9d3a",
          600: "#2a7d2a",
          700: "#1f5e1f"
        },
        cream: "#fff7e8",
        ink: "#1a0f00"
      },
      backgroundImage: {
        "mango-gradient":
          "linear-gradient(135deg,#f59100 0%,#ffb01f 40%,#ffdc80 100%)",
        "hero-radial":
          "radial-gradient(ellipse at top,#fff7e8 0%,#ffecb8 40%,#ffb01f 100%)"
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(245,145,0,0.55)",
        soft: "0 10px 40px -15px rgba(122,63,13,0.35)"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "fade-up": "fade-up 0.7s ease-out forwards"
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
