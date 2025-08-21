/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand': {
          'cream': '#F3F3E0',      // 배경색
          'navy': '#133E87',       // 버튼색 (주요)
          'blue': '#608BC1',       // 강조색
          'light': '#CBDCEB',      // 은은한 색상
        }
      }
    }
  },
  plugins: [],
};
