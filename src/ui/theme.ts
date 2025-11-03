// Theme Tokens: Discord-inspired design system tokens
// Centralized color tokens, spacing, motion presets aligned with Tailwind

export const theme = {
  // Discord-inspired color palette
  colors: {
    // Background colors (darkest to lightest)
    background: {
      darkest: '#1e1f22',    // Main background
      darker: '#202225',     // Sidebar background
      dark: '#2f3136',       // Card/panel background
      medium: '#36393f',     // Hover states
      light: '#40444b',      // Active states
    },
    
    // Text colors
    text: {
      primary: '#dcddde',    // Primary text
      secondary: '#b9bbbe',  // Secondary text
      muted: '#72767d',      // Muted text
      disabled: '#4f545c',   // Disabled text
    },
    
    // Accent colors
    accent: {
      primary: '#5865f2',    // Discord blue
      secondary: '#4f545c',  // Discord gray
      success: '#3ba55c',    // Green
      warning: '#faa61a',    // Orange
      error: '#ed4245',      // Red
      info: '#00b0f4',       // Light blue
    },
    
    // Border colors
    border: {
      default: '#4f545c',
      hover: '#72767d',
      focus: '#5865f2',
      error: '#ed4245',
    },
    
    // Achievement tier colors
    achievement: {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
      diamond: '#b9f2ff',
      legendary: '#ff6b6b',
    },
  },
  
  // Spacing scale (aligned with Tailwind)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
  },
  
  // Border radius
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  // Typography scale
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Motion presets
  motion: {
    // Duration
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    
    // Easing functions
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      // Custom Discord-like easing
      discord: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    // Animation presets
    animations: {
      fadeIn: {
        from: { opacity: '0' },
        to: { opacity: '1' },
        duration: '250ms',
        easing: 'ease-out',
      },
      slideIn: {
        from: { transform: 'translateX(-10px)', opacity: '0' },
        to: { transform: 'translateX(0)', opacity: '1' },
        duration: '250ms',
        easing: 'ease-out',
      },
      slideUp: {
        from: { transform: 'translateY(10px)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
        duration: '250ms',
        easing: 'ease-out',
      },
      scaleIn: {
        from: { transform: 'scale(0.95)', opacity: '0' },
        to: { transform: 'scale(1)', opacity: '1' },
        duration: '200ms',
        easing: 'ease-out',
      },
      bounce: {
        from: { transform: 'scale(0.95)' },
        to: { transform: 'scale(1)' },
        duration: '300ms',
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  
  // Component-specific tokens
  components: {
    // Button variants
    button: {
      primary: {
        background: '#5865f2',
        backgroundHover: '#4752c4',
        text: '#ffffff',
        border: 'transparent',
      },
      secondary: {
        background: '#4f545c',
        backgroundHover: '#5d6269',
        text: '#ffffff',
        border: 'transparent',
      },
      subtle: {
        background: 'transparent',
        backgroundHover: '#4f545c',
        text: '#dcddde',
        border: 'transparent',
      },
      danger: {
        background: '#ed4245',
        backgroundHover: '#c03e3f',
        text: '#ffffff',
        border: 'transparent',
      },
    },
    
    // Input variants
    input: {
      default: {
        background: '#2f3136',
        border: '#4f545c',
        borderFocus: '#5865f2',
        text: '#dcddde',
        placeholder: '#72767d',
      },
      error: {
        background: '#2f3136',
        border: '#ed4245',
        borderFocus: '#ed4245',
        text: '#dcddde',
        placeholder: '#72767d',
      },
    },
    
    // Card variants
    card: {
      default: {
        background: '#2f3136',
        border: '#4f545c',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      hover: {
        background: '#36393f',
        border: '#72767d',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      active: {
        background: '#40444b',
        border: '#5865f2',
        shadow: '0 0 0 1px #5865f2',
      },
    },
  },
} as const

// Type exports for TypeScript
export type Theme = typeof theme
export type ThemeColors = typeof theme.colors
export type ThemeSpacing = typeof theme.spacing
export type ThemeMotion = typeof theme.motion

// Utility functions for theme usage
export function getColorToken(colorPath: string): string {
  const keys = colorPath.split('.')
  let value: any = theme.colors
  
  for (const key of keys) {
    value = value?.[key]
    if (value === undefined) {
      console.warn(`Color token not found: ${colorPath}`)
      return '#000000'
    }
  }
  
  return value
}

export function getSpacingToken(size: keyof ThemeSpacing): string {
  return theme.spacing[size]
}

export function getMotionPreset(preset: keyof typeof theme.motion.animations) {
  return theme.motion.animations[preset]
}
