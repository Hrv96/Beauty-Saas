"use client";
import React from 'react';
import { db } from "./firebase";
// 1. KIRURŠKI IMPORTI: Dodali smo onSnapshot i query alate
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  onSnapshot 
} from "firebase/firestore";

export default function Page() {
  // --- MOZAK (LOGIKA) ---
  const [selectedTime, setSelectedTime] = React.useState(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [reservedSlots, setReservedSlots] = React.useState([]);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  
  // 2. NOVO: SPREMNIK ZA DATUM (Default je današnji dan)
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);

  // 3. STRAŽAR (REALTIME): Gleda što je zauzeto za TOČNO ODABRANI datum
  React.useEffect(() => {
    const q = query(
      collection(db, "bookings"), 
      where("date", "==", selectedDate), 
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taken = snapshot.docs.map(doc => doc.data().time);
      setReservedSlots(taken); // Ovdje punimo listu nevidljivih termina
    });

    return () => unsubscribe();
  }, [selectedDate]); // Svaki put kad promijeniš datum, stražar se osvježava


  const settings = {
    bufferTime: 15,
    slotSize: 30,
    shifts: {
      morning: { start: "08:00", end: "14:00" },
      afternoon: { start: "13:00", end: "19:00" }
    }
  };

      const services = [
    { 
      id: 1, 
      name: "Haarschnitt & Finish", 
      price: "ab 55€",
      desc: "Präzision in jedem Schnitt. Inklusive Waschen & Styling.",
      img: "https://plus.unsplash.com/premium_photo-1661775777522-47c0185f4277?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    },
    { 
      id: 2, 
      name: "Balayage ", 
      price: "ab 140€",
      desc: "Natürliches Farbübergänge auf höchstem Niveau.",
      img: "https://media.istockphoto.com/id/891441626/photo/beautiful-female-with-balayage-hairstyle-back-view.jpg?s=1024x1024&w=is&k=20&c=S5_PVlxfvIniAGSvkKRryNGUt58lg2yzfcmZDO5Bb0I=" 
    },
    { 
      id: 3, 
      name: "Braut & Gala Styling", 
      price: "ab 180€",
      desc: "Ihr perfekter Auftritt für den schönsten Tag.",
      img: "https://media.istockphoto.com/id/1132634421/photo/wedding-hairstyle.jpg?s=1024x1024&w=is&k=20&c=RRP1ob28ykNYdNVXFhhvY5RyzZMuJLQd0cmy72aQMIw=" 
    }
  ];


  // NOVO STANJE: Da sustav zapamti što je klijentica odabrala
  const [selectedService, setSelectedService] = React.useState(null);


  const generateTimeSlots = (start, end, interval) => {
    let slots = [];
    let current = new Date(`2024-01-01T${start}:00`);
    const stop = new Date(`2024-01-01T${end}:00`);
    while (current < stop) {
      slots.push(current.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
      current.setMinutes(current.getMinutes() + interval);
    }
    return slots;
  };

  const availableSlots = generateTimeSlots(settings.shifts.morning.start, settings.shifts.morning.end, settings.slotSize);

  // 4. FUNKCIJA ZA REZERVACIJU (S DATUMOM I SIGURNOŠĆU)
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!name || !phone || !selectedTime) {
      alert("Bitte füllen Sie alle Felder aus. 🛑");
      return;
    }

    try {
      // PROVJERA: Da nam se netko ne "ušeta" u istu milisekundu
      const q = query(
        collection(db, "bookings"), 
        where("date", "==", selectedDate),
        where("time", "==", selectedTime),
        where("status", "==", "pending")
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.size > 0) { 
              // Brišemo alert i palimo naš luksuzni modal
      setShowSuccess(true); 
      setTimeout(() => setShowSuccess(false), 5000); 

        return;
      }

      // AKCIJA: Pišemo u ormar s datumom!
      await addDoc(collection(db, "bookings"), {
        customerName: name,
        customerPhone: phone,
        date: selectedDate, // NOVO: Sprema dan kad klijentica dolazi
        time: selectedTime,
        status: "pending",
        createdAt: serverTimestamp(),
      });

            // Brišemo alert i palimo naš luksuzni modal
      setShowSuccess(true); 
      setTimeout(() => setShowSuccess(false), 5000); 

      // RESET: Čistimo stol
      setName("");
      setPhone("");
      setSelectedTime(null);

    } catch (error) {
      console.error("Firebase Error: ", error);
      alert("Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es erneut. 🛑");
    }
  };

  return (
    <main className="relative flex flex-col items-center overflow-x-hidden">
      
      {/* 1. DIO: GLAVNI NASLOV + SLIKA (HERO) */}
      <section className="min-h-screen w-full max-w-7xl flex flex-col md:flex-row items-center justify-between px-10 gap-12 pt-32 pb-20">
        
        {/* LIJEVA STRANA: TEKST I GUMBI */}
        <div className="flex-1 flex flex-col items-start text-left space-y-10 z-10">
          <div className="flex items-center space-x-3">
            <div className="h-[1px] w-12 bg-[#7b2cbf]"></div>
            <span className="text-[#7b2cbf] text-xs font-black uppercase tracking-[0.5em]">Willkommen im Luxus</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-zinc-900 leading-[0.9] tracking-tighter uppercase italic">
            Zeitlose <br />
            <span className="text-[#7b2cbf]">Schönheit</span>
          </h1>

          <p className="max-w-md text-zinc-500 text-lg font-medium leading-relaxed italic">
            Exklusive Haar- und Hautpflege im Herzen von Spittal. <br />
            Erleben Sie Perfektion bei jeder Berührung.
          </p>

          {/* KONTEJNER ZA GUMBE I ZVJEZDICE */}
          <div className="flex flex-col items-start space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
               onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth'})}
              className="bg-[#7b2cbf] text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-900 transition-all shadow-2xl shadow-purple-200 active:scale-95">
                Termin Buchen
              </button>
              <button 
                onClick={() => document.getElementById('services').scrollIntoView({behavior: 'smooth'})}
              className="border border-zinc-200 text-zinc-900 px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-100 transition-all active:scale-95">
                Preise
              </button>
            </div>

            {/* TRUST BADGE - ZVJEZDICE ISPOD GUMBA */}
            <div className="flex items-center space-x-2 pl-2 opacity-80">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-[#7b2cbf] text-[10px]">★</span>
                ))}
              </div>
              <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] ml-2">
                5.0 Google Rezensionen
              </span>
            </div>
          </div>
        </div>

        {/* DESNA STRANA: SLIKA SALONA */}
        <div className="flex-1 w-full min-h-[400px] md:h-[650px] relative rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl group">
          <img 
            src="https://images.unsplash.com/photo-1695527082039-5f96003b97e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Luxus Salon" 
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#7b2cbf]/10 to-transparent"></div>
        </div>

      </section>

      {/* 2. DIO: USLUGE (SERVICES) */}
            {/* 2. DIO: USLUGE & CJENIK (SERVICES) */}
            {/* 2. DIO: LUKSUZNI CJENIK (IMAGE-FOCUS) */}
            {/* 2. DIO: LUKSUZNI KATALOG (SERVICES) */}
      <section id="services" className="w-full max-w-7xl py-32 px-10">
        <div className="flex flex-col items-center mb-24 space-y-4">
          <span className="text-[#7b2cbf] text-xs font-black uppercase tracking-[0.5em] opacity-60">Handwerkskunst</span>
          <h2 className="text-5xl md:text-7xl font-black text-zinc-900 uppercase italic tracking-tighter text-center leading-none">
            Unsere <br /> <span className="text-[#7b2cbf]">Expertise</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="group relative h-[650px] rounded-[60px] overflow-hidden shadow-2xl transition-all duration-1000 hover:-translate-y-4"
            >
              {/* SLIKA S LUKSUZNIM PRELAZOM */}
              <img 
                src={service.img} 
                alt={service.name} 
                className="absolute inset-0 w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2000ms]"
              />
              
              {/* GRADIENT - DA TEXT I GUMB BLJEŠTE */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700"></div>

              {/* SADRŽAJ (TEKST I GUMB) */}
              <div className="absolute inset-0 p-12 flex flex-col justify-end items-start space-y-4">
                <div className="flex flex-col mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#7b2cbf] mb-1">Investition</span>
                  <span className="text-3xl font-black text-white italic tracking-tighter">{service.price}</span>
                </div>
                
                <h3 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter group-hover:text-[#7b2cbf] transition-colors">
                  {service.name}
                </h3>
                
                <p className="text-zinc-400 text-sm italic font-medium leading-relaxed max-w-[200px] opacity-0 group-hover:opacity-100 transition-all duration-700">
                  {service.desc}
                </p>

                <button 
                  onClick={() => {
                    setSelectedService(service);
                    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-8 w-full bg-white text-zinc-900 py-6 rounded-[25px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#7b2cbf] hover:text-white transition-all shadow-2xl active:scale-95"
                >
                  Termin wählen
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* 5. DIO: REZERVACIJA (BOOKING SYSTEM) */}
            {/* 5. DIO: REZERVACIJA (PAMETNI SUSTAV) */}
      
              {/* 5. DIO: REZERVACIJA (PAMETNI SUSTAV) */}
            {/* 5. DIO: REZERVACIJA (PAMETNI SUSTAV S VIP TRETMANOM) */}
      <section id="booking" className="w-full max-w-4xl py-32 px-10 bg-[#7b2cbf]/5 rounded-[80px] my-20 border border-[#7b2cbf]/10 relative">
        
        <div className="text-center mb-16 space-y-4">
          <span className="text-[#7b2cbf] text-xs font-black uppercase tracking-[0.5em]">Termin Sichern</span>
          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 uppercase italic tracking-tighter">Wähle deine Zeit</h2>
          
          {/* 1. ODABIR DATUMA (LUKSUZNI INPUT) */}
          <div className="mt-8 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 underline decoration-[#7b2cbf]/30">Datum wählen</span>
            <input 
              type="date" 
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]} 
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime(null); // Resetiramo vrijeme ako se promijeni datum
              }}
              className="bg-white px-8 py-4 rounded-3xl border border-[#7b2cbf]/10 text-zinc-900 font-bold outline-none focus:ring-2 focus:ring-[#7b2cbf] transition-all shadow-sm cursor-pointer"
            />
          </div>
        </div>

        {/* 2. MREŽA TERMINA (HPC LOGIKA SKRIVANJA) */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {availableSlots.map((time) => {
            const isTaken = reservedSlots.includes(time);
            if (isTaken) return null; 

            return (
              <button 
                key={time} 
                onClick={() => setSelectedTime(time)}
                className={`py-5 rounded-3xl border transition-all duration-700 ease-in-out shadow-sm active:scale-95 text-[10px] font-black uppercase tracking-widest
                  ${selectedTime === time 
                    ? "bg-[#7b2cbf] text-white border-[#7b2cbf] scale-105 shadow-2xl shadow-purple-300" 
                    : "bg-white/40 backdrop-blur-md text-zinc-500 border-white/20 hover:bg-[#7b2cbf] hover:text-white"
                  }`}
              >
                {time}
              </button>
            );
          })}
        </div>

        {/* 3. VIP FORMA ZA POTVRDU (S DETALJIMA USLUGE) */}
        {selectedTime && (
          <div className="mt-20 p-12 bg-white rounded-[50px] shadow-2xl border border-purple-50 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-1000 ease-out max-w-lg mx-auto w-full">
            <div className="text-center mb-10">
              <span className="text-[#7b2cbf] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Ihre Reservierung</span>
              <h3 className="text-3xl font-black uppercase italic text-zinc-900 tracking-tighter leading-none">
                {selectedService?.name || "Premium Termin"}
              </h3>
              <div className="flex items-center justify-center space-x-3 mt-4 text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-widest">{selectedTime} Uhr</span>
                <div className="h-1 w-1 bg-zinc-300 rounded-full"></div>
                <span className="text-xs font-bold uppercase tracking-widest">
                  {new Date(selectedDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text" 
                placeholder="IHR NAME" 
                className="w-full bg-zinc-50 border-none p-6 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] focus:ring-2 focus:ring-[#7b2cbf] outline-none transition-all italic text-zinc-900"
              />
              <input 
                 type="text" 
                 inputMode="numeric"
                 pattern="[0-9]*"
                 value={phone} 
                 onChange={(e) => {
                   const val = e.target.value;
                   if (val === "" || /^[0-9\b]+$/.test(val)) {
                     setPhone(val);
                   }
                 }} 
                placeholder="TELEFONNUMMER" 
                className="w-full bg-zinc-50 border-none p-6 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] focus:ring-2 focus:ring-[#7b2cbf] outline-none transition-all italic text-zinc-900"
              />
             <button 
  onClick={handleBooking} 
  disabled={isSending}
  className="w-full bg-[#7b2cbf] text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-zinc-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
> 
  {isSending ? "Wird gesendet..." : "Buchung bestätigen"}
</button>

            </div>
          </div>
        )}

        <p className="mt-12 text-center text-zinc-400 text-[10px] uppercase tracking-widest font-bold opacity-50">
          * Alle Termine beinhalten 15 Min. Vorbereitung
        </p>
      </section>

      {/* DEKORATIVNI ELEMENT U POZADINI */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-purple-50 rounded-full blur-[150px] opacity-60"></div>

      {/* 4. MODALNI ALERT ZA USPJEH (ZLATNI FINIŠ) */}
      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
          <div className="bg-zinc-900 text-white px-10 py-6 rounded-[30px] shadow-2xl border border-white/10 flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#7b2cbf] rounded-full flex items-center justify-center text-xl">✨</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7b2cbf]">Erfolgreich</p>
              <p className="text-sm font-bold italic uppercase tracking-tighter">Ihr Termin wurde im System reserviert.</p>
            </div>
          </div>
        </div>
      )}
     <footer className="w-full bg-zinc-900 text-white py-24 px-10 rounded-t-[80px] md:rounded-t-[120px] mt-32 relative overflow-hidden">
  <div className="max-w-7xl mx-auto">
    
    {/* GORNJI DIO: 3 STUPCA LUKSUZA */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 mb-20">
      
      {/* BRAND */}
      <div className="space-y-8">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
          Studio <br /> <span className="text-[#7b2cbf]">Beauty</span>
        </h2>
        <p className="text-zinc-500 text-sm italic leading-relaxed max-w-[250px]">
          Perfektion ist kein Detail, sie ist das Fundament unserer Kunst. 
          Exzellenz in Spittal.
        </p>
      </div>

      {/* KONTAKT */}
      <div className="flex flex-col space-y-6">
        <span className="text-[#7b2cbf] text-[10px] font-black uppercase tracking-[0.5em]">Kontakt</span>
        <div className="space-y-2">
          <p className="text-sm font-bold text-zinc-300">Hauptplatz 1</p>
          <p className="text-sm font-bold text-zinc-300">9800 Spittal an der Drau</p>
          <p className="text-[#7b2cbf] text-sm font-black mt-4">+43 664 123 4567</p>
        </div>
      </div>

      {/* RADNO VRIJEME */}
      <div className="flex flex-col space-y-6">
        <span className="text-[#7b2cbf] text-[10px] font-black uppercase tracking-[0.5em]">Termine</span>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-zinc-500 text-[10px] uppercase font-bold">Mo - Fr</span>
            <span className="text-sm font-bold italic text-zinc-300">08:00 - 18:00</span>
          </div>
          <div className="flex justify-between items-center opacity-40">
            <span className="text-zinc-500 text-[10px] uppercase font-bold">Sa - So</span>
            <span className="text-sm font-bold italic text-zinc-300">Geschlossen</span>
          </div>
        </div>
      </div>

    </div>

    {/* DONJI DIO: PRAVNA SIGURNOST (ISPRAVLJENO I PORAVNATO) */}
    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
      <span className="text-zinc-600 text-[9px] uppercase tracking-[0.4em] font-black">
        © 2024 Studio Beauty Spittal
      </span>
      
      <div className="flex gap-12">
        <button className="text-zinc-500 hover:text-[#7b2cbf] text-[9px] uppercase tracking-[0.4em] font-black transition-all duration-500">
          Impressum
        </button>
        <button className="text-zinc-500 hover:text-[#7b2cbf] text-[9px] uppercase tracking-[0.4em] font-black transition-all duration-500">
          Datenschutz
        </button>
      </div>
    </div>

  </div>

  {/* SUPTILNI SJAJ U KUTU FOOTERA */}
  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#7b2cbf] rounded-full blur-[120px] opacity-10"></div>
</footer>



    </main>
  );
}
