    // src/app/layout.tsx
    import type { Metadata } from "next";
    import { Manrope } from "next/font/google"; // Import Manrope font
    import "./globals.css";

    // Configure the Manrope font
    const manrope = Manrope({
      subsets: ["latin"],
      variable: "--font-manrope", // Define a CSS variable for Manrope
      display: 'swap', // Optimize font loading for better performance
    });

    export const metadata: Metadata = {
      title: "Task Manager App", // Updated title
      description: "A simple task management application built with Next.js and MongoDB.", // Updated description
    };

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) {
      return (
        <html lang="en">
          <body
            // Apply the Manrope font variable to the body
            className={`${manrope.variable} font-sans antialiased`} // 'font-sans' is a Tailwind utility that defaults to --font-manrope now
          >
            {children}
          </body>
        </html>
      );
    }
    