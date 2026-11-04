import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { navy: "#102A43", teal: { DEFAULT: "#0D9488", dark: "#0b7a70" }, sky: "#EAF4FF", soft: "#F7FAFC", ink: "#1E293B", muted: "#64748B" },
      fontFamily: { sans: ["var(--font-jakarta)", "system-ui", "sans-serif"], display: ["var(--font-display)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
