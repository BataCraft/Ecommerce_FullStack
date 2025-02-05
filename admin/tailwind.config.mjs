/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		
  		colors:{
			primaryColor : {
				DEFAULT : "#df4a4a",
			},
			secondaryColor : "#fafafa",
			assentColor: "283138",
			textColor: "#283138",
			textNormal : "#b3b3b3"
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
