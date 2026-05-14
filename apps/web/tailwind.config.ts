import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../packages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        angola: {
          red: "#b10f1f",
          black: "#141414",
          gold: "#d7aa3f",
          cream: "#faf7f2"
        }
      },
      borderRadius: {
        panel: "8px"
      }
    }
  },
  plugins: []
};

export default config;
