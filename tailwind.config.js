/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#E0F2FE',  // Very soft light blue for subtle accents/hover
          DEFAULT: '#0284C7', // Solid tech light blue for buttons, links, branding
          dark: '#0369A1',    // Darker blue for active states
        },
        smoke: {
          light: '#F8FAFC',  // Main background (Slate 50 vibe)
          DEFAULT: '#F1F5F9',// Slightly darker smoke white for cards/sections
        }
      },
    },
  },
  plugins: [],
};