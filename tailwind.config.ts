import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          DEFAULT: "#0D6EFD",
          dark: "#0A55C4",
          light: "#E8F2FF",
        },
        teal: "#0891B2",
        kelp: {
          DEFAULT: "#0F7743",
          light: "#E8F7EE",
        },
        coral: {
          DEFAULT: "#E8451A",
          light: "#FFF0EB",
        },
        gold: {
          DEFAULT: "#C48A1A",
          light: "#FFF8E8",
        },
        salt: "#F8FBFF",
        ice: "#EEF6FF",
        foam: "#E0F0FF",
        sky: "#C8E4FF",
        sand: "#FBF8F3",
        escama: {
          text: "#0D1B2A",
          "text-2": "#3D5166",
          "text-3": "#7A92A8",
          border: "#E0ECF8",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "12px",
        md: "18px",
        lg: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
};

export default config;
