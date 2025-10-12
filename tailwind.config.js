/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Discord-inspired colors
        'discord-darkest': '#1e1f22',
        'discord-darker': '#202225', 
        'discord-dark': '#2f3136',
        'discord-medium': '#36393f',
        'discord-light': '#dcddde',
        'discord-muted': '#72767d',
        'discord-accent': '#5865f2',
        'discord-success': '#3ba55c',
        'discord-warning': '#faa61a',
        'discord-error': '#ed4245',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-in-out',
        'slide-in': 'slideIn 0.25s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}