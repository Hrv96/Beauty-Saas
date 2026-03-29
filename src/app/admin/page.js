"use client";
import React, { useEffect, useState } from 'react';
import { db, auth } from "../firebase"; 
import { 
  collection, onSnapshot, query, orderBy, doc, updateDoc 
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth"; // 1. DODAJ onAuthStateChanged!
import { useRouter } from "next/navigation"; // 2. DODAJ useRouter!


export default function AdminPage() {
  const [bookings, setBookings] = useState([]);

  const [filter, setFilter] = useState("all"); // "all" ili "pending"

  const router = useRouter(); // Uvezi useRouter iz 'next/navigation'

useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/admin/login"); // AKO NEMA KORISNIKA -> VAN!
    }
  });
  return () => unsubscribeAuth();
}, []);



  useEffect(() => {
    // 1. STVARAMO ŽIVU VEZU S ORMAROM (FIREBASE)
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setBookings(docs);
      
      // Ovdje ćemo kasnije dodati onaj "PING" zvuk! 🔔
    });

    return () => unsubscribe(); // Kidamo vezu kad zatvorimo stranicu
  }, []);

  const markAsDone = async (id) => {
    const docRef = doc(db, "bookings", id);
    await updateDoc(docRef, { status: "completed" });
  };

  const handleLogout = async () => {
    try {
        await signOut(auth);
        window.location.href="/admin/login";
    } catch(error) {
        console.error("Logout error", error);
    }
  };


 return (
  <main className="min-h-screen bg-[#f8f9fa] p-8 md:p-16 text-zinc-900">
    <div className="max-w-6xl mx-auto">
      
      {/* HEADER PANELA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <button onClick={handleLogout} className="text-[#7b2cbf] text-[10px] font-black uppercase tracking-widest hover:underline italic mb-2 block">
            [ Sicher Abmelden ]
          </button>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Termin Übersicht</h1>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Status</span>
          <div className="bg-white px-8 py-4 rounded-3xl shadow-xl shadow-purple-100/50 border border-purple-50">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Aktiv: </span>
            <span className="text-[#7b2cbf] font-black text-xl">{bookings.filter(b => b.status === "pending").length}</span>
          </div>
        </div>
      </div>

      {/* FILTERI */}
      <div className="flex gap-3 mb-10">
        <button onClick={() => setFilter("all")} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-zinc-900 text-white shadow-xl' : 'bg-white text-zinc-400'}`}>Alle</button>
        <button onClick={() => setFilter("pending")} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-[#7b2cbf] text-white shadow-xl' : 'bg-white text-zinc-400'}`}>Offen</button>
      </div>

      {/* LISTA TERMINA - SADA S DATUMOM I USLUGOM */}
      <div className="grid gap-6">
        {bookings
          .filter(b => filter === "all" ? true : b.status === "pending")
          .map((b) => (
          <div key={b.id} className={`p-10 rounded-[45px] border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${b.status === 'completed' ? 'bg-zinc-100 opacity-40' : 'bg-white shadow-2xl shadow-purple-100/30 border-white'}`}>
            <div className="flex gap-8 items-center">
              <div className="bg-[#7b2cbf]/5 p-6 rounded-3xl text-center min-w-[100px]">
                <span className="text-[#7b2cbf] font-black text-xl block leading-none">{b.time}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 block">
                  {b.date ? new Date(b.date).toLocaleDateString('de-DE', {day:'2-digit', month:'short'}) : 'Danas'}
                </span>
              </div>
              <div>
                <span className="text-[#7b2cbf] text-[10px] font-black uppercase tracking-[0.3em] mb-1 block">
                  {b.serviceName || "Premium Service"}
                </span>
                <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic">{b.customerName}</h3>
                <p className="text-zinc-400 text-sm font-medium tracking-widest">{b.customerPhone}</p>
              </div>
            </div>
            
            {b.status === "pending" && (
              <button onClick={() => markAsDone(b.id)} className="bg-zinc-900 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#7b2cbf] transition-all active:scale-95 shadow-lg">
                Erledigt
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  </main>
);
}