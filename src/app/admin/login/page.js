"use client";
import React, { useState } from 'react';
import { auth } from "../../firebase"; // Provjeri putanju!
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
      try {
          await signInWithEmailAndPassword(auth, email, password);
          router.push("/admin"); // ako je sifra tocna, pustamo je 
        } catch (error) {
         alert("Zugriff verweigert. Bitte prüfen Sie Ihre Daten.");
         }
    };

    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-zinc-900 p-12 rounded-[40px] border border-zinc-800 shadow-2xl">
                <div className="text-center mb-10">
                    <span className="text-[#7b2cbf] text-[10px] font-black uppercase tracking-[0.5em]">Secure Access</span>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mt-2 text-zinc-900">Admin Login</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 text-zinc-900">
                    <input
                    type="email"
                    placeholder="E-MAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-800 border-none p-5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-white focus:ring-2 focus:ring-[#7b2cbf] outline-none transition-all italic"
                    /> 
                    <input
                     type="password"
                     placeholder="PASSWORT"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-zinc-800 border-none p-5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-white focus:ring-2 focus-[#7b2cbf] outline-none transition-all italic"
                     />
                     <button className="w-full bg-[#7b2cbf] text-white py-5 rounded-2xl font-black uppercase tracking-[]0.3em text-[10px] shadow-xl hover:bg-[#9d4edd] transition-all active:scale-95 mt-4">
                        Anmelden
                     </button>
                </form>
            </div>
        
        </main>
    );
}

