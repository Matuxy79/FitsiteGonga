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
        // Clean Light — canonical (design anchor: dashboard sidebar shell)
        'clean-bg': '#f5f5f7',     // App canvas / page background
        'clean-sidebar': '#ffffff',// Sidebar + raised surfaces
        'clean-accent': '#E8453C', // Primary accent (coral)
        'clean-text': '#1a1a1a',   // Primary text
        'clean-muted': '#6b7280',  // Secondary text / inactive icons / placeholders
        'clean-border': '#e5e7eb', // Hairline borders / dividers
        'clean-hover': '#f3f4f6',  // Neutral hover fill

        // Clean Light — extension (app reskin)
        'clean-surface': '#ffffff',    // cards, panels, popovers
        'clean-surface-2': '#fafafa',  // inset wells (composer footer, table headers)
        'clean-accent-hover': '#D93A31',   // primary hover
        'clean-accent-pressed': '#BE3329', // primary active/pressed
        'clean-accent-soft': '#FDECEA',    // coral 8% tint — selected rows, mention chips
        'clean-accent-softer': '#FEF5F4',  // coral 4% tint — own-message wash, pinned accents
        'warm-sand': '#FFFBEB',        // celebration / system cards
        'warm-sand-border': '#FDE68A', // celebration hairline
        'warm-sand-text': '#92400E',   // celebration body text

        // Status scale (harmonized with coral — warm + desaturated)
        'status-success': '#10B981',
        'status-success-text': '#047857',
        'status-success-soft': '#ECFDF5',
        'status-warning': '#F59E0B',
        'status-warning-text': '#B45309',
        'status-warning-soft': '#FFFBEB',
        'status-info': '#2A9D8F',      // muted teal — the ONLY secondary hue
        'status-info-text': '#1F7A70',
        'status-info-soft': '#E7F5F3',
        'status-danger': '#E8453C',    // = accent; errors reuse coral
        'status-danger-text': '#BE3329',
        'status-danger-soft': '#FDECEA',
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
