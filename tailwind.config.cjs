/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      height: {
        screen: ["100vh /* fallback for Opera, IE and etc. */", "100dvh"],
      },
      backgroundImage: {
        achievers: ["url('/images/header.jpeg')"],
        lines: [
          "repeating-linear-gradient(45deg,hsl(var(--b1)),hsl(var(--b1)) 13px,hsl(var(--b2)) 13px,hsl(var(--b2)) 14px)",
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["bumblebee"],
  },
};
