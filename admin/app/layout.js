import { Oswald, Open_Sans } from "next/font/google";
import "./globals.css";
import { ToastContainer, toast } from 'react-toastify';


const opensans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${opensans.variable} ${oswald.variable} antialiased`}
        >
            <ToastContainer />
      
        {children}
        
      </body>
    </html>
  );
}
