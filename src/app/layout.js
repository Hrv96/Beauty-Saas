import "./globals.css";

// Tvoji podaci za Google (SEO) u Austriji 🇦🇹
export const metadata = {
  title: "Studio Beauty | Luxus in Spittal",
  description: "Ihr exklusiver Moment der Erholung und Schönheit.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className="scroll-smooth">
      <body className="antialiased bg-[#fcfaff] text-zinc-900 font-sans min-h-screen">
        {/* TVOJ STAKLENI NAVBAR (BACKDROP BLUR) */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-white/40 py-5 px-10 flex justify-between items-center transition-all">
          <div className="font-black text-[#7b2cbf] text-2xl tracking-tighter uppercase italic">
            Studio <span className="text-zinc-900">Beauty</span>
          </div>
          
          <div className="hidden md:flex space-x-10 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            <a href="#services" className="hover:text-[#7b2cbf] transition-all">Services</a>
            <a href="#galerie" className="hover:text-[#7b2cbf] transition-all">Galerie</a>
            <a href="#kontakt" className="hover:text-[#7b2cbf] transition-all underline decoration-[#7b2cbf] decoration-2 underline-offset-4">Kontakt</a>
          </div>
        </nav>

        {/* SADRŽAJ STRANICE (page.js) */}
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
