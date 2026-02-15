import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: false,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 파스텔 톤 컬러 팔레트
        'pastel-peach': {
          light: '#FEA38E',
          DEFAULT: '#F3B5A0',
          dark: '#FBA2AB',
        },
        'pastel-cream': {
          light: '#FFDFC3',
          DEFAULT: '#F6E6D0',
        },
        // 배경색
        'bg-warm': {
          DEFAULT: '#FFFBF7', // 매우 밝은 따뜻한 크림색
          light: '#FFFEFB',   // 거의 흰색
          soft: '#FFF8F0',    // 매우 밝은 복숭아 크림색
        },
      },
    },
  },
  plugins: [],
}
export default config

