/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  safelist: [
    { pattern: /^(bg|text|border|from|to|via)-(coral|lavender|sky|sage|butter|peach|charcoal|cream|brown)(-deep)?(\/\d+)?$/ },
    "bg-coral", "bg-lavender", "bg-sky", "bg-sage", "bg-butter", "bg-peach", "bg-brown",
    "text-coral-deep", "text-lavender-deep", "text-sky-deep", "text-sage-deep", "text-butter-deep", "text-brown-deep",
  ],
  theme: {
  	extend: {
  		opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 4px)',
  			sm: 'calc(var(--radius) - 8px)',
        xl: 'calc(var(--radius) + 6px)',
        '2xl': 'calc(var(--radius) + 16px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
  			popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
  			primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
  			secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
  			muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
  			accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
  			destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			cream: { DEFAULT: 'hsl(var(--cream))', deep: 'hsl(var(--cream-deep))' },
  			charcoal: 'hsl(var(--charcoal))',
  			sky: { DEFAULT: 'hsl(var(--sky))', deep: 'hsl(var(--sky-deep))' },
  			lavender: { DEFAULT: 'hsl(var(--lavender))', deep: 'hsl(var(--lavender-deep))' },
  			coral: { DEFAULT: 'hsl(var(--coral))', deep: 'hsl(var(--coral-deep))' },
  			brown: { DEFAULT: 'hsl(var(--brown))', deep: 'hsl(var(--brown-deep))' },
  			peach: 'hsl(var(--peach))',
  			sage: { DEFAULT: 'hsl(var(--sage))', deep: 'hsl(var(--sage-deep))' },
  			butter: { DEFAULT: 'hsl(var(--butter))', deep: 'hsl(var(--butter-deep))' }
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  			'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
