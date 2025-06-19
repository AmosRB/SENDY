// pages/importerask.jsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';



export default function ImporterAskPage() {
  const router = useRouter();
const [shippingType, setShippingType] = useState({ FOB: false, EXW: false });
  
const handleSubmit = async (e) => {
  e.preventDefault();

  // שליפת נתונים מהטופס
  const form = e.target;
  const origin = form.origin.value;
  const destination = form.destination.value;
  const departureDate = form.departureDate.value;
  const containerSize = form.containerSize.value;
  const quantity = form.quantity.value;
  

  // פרטי המשתמש מה-session/localStorage
  const clientId = sessionStorage.getItem('clientId') || localStorage.getItem('clientId');
  const clientName = sessionStorage.getItem('clientName') || '';
  const clientPhone = sessionStorage.getItem('clientPhone') || '';
  const clientBusiness = sessionStorage.getItem('clientBusiness') || '';
  const clientEmail = sessionStorage.getItem('clientEmail') || '';

  // הפקת quoteId עוקב מהשרת
  const quoteIdRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quotes/new-id`);
  const { quoteId } = await quoteIdRes.json();

  // בניית הרשומה לשמירה
  const data = {
    quoteId,
    status: 'submitted',
    createdAt: new Date(),
    clientId,
    clientName,
    clientPhone,
    clientBusiness,
    clientEmail,
    origin,
    destination,
    departureDate,
    containerSize,
    quantity,
    type: 'importer',
    shippingType,
  };

  // שליחה לשרת
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quotes`, {
  method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    router.push('/importeropenquotes');
  } else {
    alert('שגיאה בשמירת הבקשה');
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative pb-20">
      <Head>
        <title>בקשה להצעת מחיר להובלת מכולות</title>
      </Head>

      <div className="absolute top-5 right-6 text-4xl text-blue-700 hover:text-blue-900 cursor-pointer z-50"
     onClick={() => window.history.forward()} title="קדימה">
  →
</div>
<div className="absolute top-5 left-6 text-4xl text-blue-700 hover:text-blue-900 cursor-pointer z-50"
     onClick={() => window.history.back()} title="אחורה">
  ←
</div>


      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[280px] h-[280px] object-contain mt-0" />

     <div className="w-full max-w-sm flex flex-col items-center mt-0 space-y-2">

   <h1 className="text-3xl font-bold text-center text-black whitespace-nowrap mt-0 mb-8">
  בקשה להצעת מחיר להובלת מכולות
</h1>


       <form className="w-full flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
  <input
    type="text"
    placeholder="מאיפה (מדינה, עיר, נמל)"
    className="border border-gray-300 rounded-lg px-3 py-2 text-right"
    name="origin"
    required
  />
  <input
    type="text"
    placeholder="לאן (מדינה, עיר, נמל)"
    className="border border-gray-300 rounded-lg px-3 py-2 text-right"
    name="destination"
    required
  />
  <input
    type="date"
    placeholder="תאריך יציאה"
    className="border border-gray-300 rounded-lg px-3 py-2 text-right"
    name="departureDate"
    required
  />
  <select
    className="border border-gray-300 rounded-lg px-3 py-2 text-right"
    name="containerSize"
    required
    defaultValue=""
  >
    <option value="" disabled>בחר גודל מכולה</option>
    <option value="20FT">20FT</option>
    <option value="40FT">40FT</option>
    <option value="40FTHC">40FT High Cube</option>
  </select>
  <input
    type="number"
    min="1"
    placeholder="כמות מכולות"
    className="border border-gray-300 rounded-lg px-3 py-2 text-right"
    name="quantity"
    required
  />

  <div className="flex gap-8 items-center justify-center mt-2 mb-2">
  <label className="flex items-center gap-2">
    <span className="text-[16px]">FOB</span>
    <input
      type="checkbox"
      checked={shippingType.FOB}
      onChange={(e) => setShippingType({ ...shippingType, FOB: e.target.checked })}
      className="form-checkbox accent-blue-600 w-4 h-4"
    />
  </label>
  <label className="flex items-center gap-2">
    <span className="text-[16px]">EXW</span>
    <input
      type="checkbox"
      checked={shippingType.EXW}
      onChange={(e) => setShippingType({ ...shippingType, EXW: e.target.checked })}
      className="form-checkbox accent-blue-600 w-4 h-4"
    />
  </label>
</div>


  
    <button
          type="submit"
          className="w-full py-2 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700 mt-2"
        >
          שלח בקשה
        </button>

        
</form>

      </div>


      <footer className="fixed bottom-0 left-0 w-full py-3 bg-black text-center text-sm text-white z-50 shadow-md">
        כל הזכויות שמורות ל־<span className="text-orange-500 font-semibold">Share A Container</span>
        <div className="absolute left-4 top-3 text-purple-400 text-sm">D&A code design ©</div>
      </footer>
    </div>
  );
}
