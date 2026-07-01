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
        // Solarized Light palette
        'sol-base03': '#002b36',   // darkest text / headings
        'sol-base02': '#073642',   // strong emphasis
        'sol-base01': '#586e75',   // emphasis / secondary text
        'sol-base00': '#657b83',   // body text
        'sol-base0': '#839496',    // (dark mode body – unused in light)
        'sol-base1': '#93a1a1',    // muted / placeholders / borders
        'sol-base2': '#eee8d5',    // panel / card background
        'sol-base3': '#fdf6e3',    // main background
        'sol-yellow': '#b58900',
        'sol-orange': '#cb4b16',
        'sol-red': '#dc322f',
        'sol-magenta': '#d33682',
        'sol-violet': '#6c71c4',
        'sol-blue': '#268bd2',
        'sol-cyan': '#2aa198',
        'sol-green': '#859900',

        // Legacy discord aliases mapped to solarized equivalents
        'discord-darkest': '#002b36',
        'discord-darker': '#073642',
        'discord-dark': '#eee8d5',
        'discord-medium': '#fdf6e3',
        'discord-light': '#002b36',
        'discord-muted': '#93a1a1',
        'discord-accent': '#268bd2',
        'discord-success': '#859900',
        'discord-warning': '#b58900',
        'discord-error': '#dc322f',
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