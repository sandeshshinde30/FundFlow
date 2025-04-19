/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        epilogue: ["Epilogue", ...defaultTheme.fontFamily.serif],
      },
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          200: "#bcd0ff",
          300: "#8db1ff",
          400: "#5a8bff",
          500: "#3c6cf9",
          600: "#2651ef",
          700: "#1f3fdb",
          800: "#2035b1",
          900: "#21318c",
          950: "#162055",
        },
        secondary: {
          50: "#f4f7fb",
          100: "#e9eff5",
          200: "#cedee9",
          300: "#a4c3d8",
          400: "#73a2c1",
          500: "#5084aa",
          600: "#3f6b8f",
          700: "#345574",
          800: "#2f4962",
          900: "#2a3e53",
          950: "#1c293a",
        },
        light: {
          100: "#ffffff",
          200: "#f9fafb",
          300: "#f3f4f6",
          400: "#e5e7eb",
          500: "#d1d5db",
          600: "#9ca3af",
          900: "#111827",
        },
        success: {
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#22c55e",
          700: "#15803d",
        },
        error: {
          100: "#fee2e2",
          200: "#fecaca",
          500: "#ef4444",
          700: "#b91c1c",
        },
        warning: {
          100: "#fef3c7",
          200: "#fde68a",
          500: "#f59e0b",
          700: "#b45309",
        },
      },
      boxShadow: {
        card: "0px 1px 3px rgba(0, 0, 0, 0.1)",
        "card-hover": "0px 4px 8px rgba(0, 0, 0, 0.05)",
        sidebar: "0px 1px 6px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
