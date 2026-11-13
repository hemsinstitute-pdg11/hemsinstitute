import type { Config } from "tailwindcss";
export default { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { brand: { orange: "#F28C28", navy: "#173B70" } }, fontFamily: { sans: ["var(--font-inter)", "sans-serif"], heading: ["var(--font-poppins)", "sans-serif"] } } }, plugins: [] } satisfies Config;
