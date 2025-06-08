/* ✅ גרסה רספונסיבית מלאה מעודכנת לפי טופס עמיל מכס */

import { useState } from 'react';
import Head from 'next/head';

export default function SubmitQuoteAsBroker() {
  const [form, setForm] = useState({});
  const [agree, setAgree] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('הצעה נשלחה');
  };

  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-gradient-to-t from-[#cfe7fa] via-white via-[75%] to-white relative px-4 py-10">
      <Head><title>Sendy | הגשת הצעת מחיר</title></Head>

      {/* רקע מילה ענקית */}
      <div className="fixed inset-x-0 bottom-0 z-0 pointer-events-none select-none leading-none">
        <p className="text-[700px] text-white font-lalezar absolute bottom-[-250px] left-1/2 -translate-x-1/2 opacity-60 whitespace-nowrap">CONTAINER</p>
      </div>

      <div className="relative z-10 max-w-[800px] mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 p-10">
        <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[300px] h-[350px] object-contain mx-auto mb-6" />

        <h1 className="text-center text-xl font-bold text-black mb-1">בקשה להצעת מחיר</h1>
        <p className="text-center font-bold text-[18px] mb-6">54625689</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="שם המוצר" className="input" />
            <input placeholder="היצרן" className="input" />
            <input placeholder="קישור לדף המוצר" className="input sm:col-span-2" />
            <input placeholder="נקודת מוצא" className="input" />
            <input placeholder="יעד משלוח" className="input" />
            <input placeholder="נפח כולל למשלוח" className="input" />
            <input placeholder="משקל כולל בק" className="input" />
            <input placeholder="מחסני חברת שילוח" className="input sm:col-span-2" />
          </div>

          <div>
            <p className="font-semibold">סוג משלוח *</p>
            <div className="flex gap-4 my-1">
              <label className="flex items-center gap-1"><input type="checkbox" /> EXW</label>
              <label className="flex items-center gap-1"><input type="checkbox" /> FOB</label>
            </div>
          </div>

          <textarea placeholder="פרטים והערות למשלוח" className="w-full h-24 rounded-xl border border-gray-300 p-2"></textarea>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="חובלה ימית" className="input" />
            <input placeholder="עמילות" className="input" />
            <input placeholder="טיפול מול מכון התקנים" className="input sm:col-span-2" />
            <input placeholder="ביטוח" className="input" />
            <input placeholder="חובלה בישראל" className="input" />
          </div>

          <div>
            <label className="font-bold">מחיר</label>
            <input placeholder="₪" className="input w-full" />
            <label className="block text-sm mt-1"><input type="checkbox" className="mr-1" /> לא כולל מסי נמל</label>
            <label className="block text-sm"><input type="checkbox" className="mr-1" /> לא כולל מע"מ</label>
          </div>

          <div>
            <label className="block text-sm">הצעת תוקף עד</label>
            <input type="date" className="input w-full" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span className="text-sm">אני מאשר שקראתי את תנאי השימוש באתר</span>
          </div>

          <button
            type="submit"
            disabled={!agree}
            className={`w-full py-3 mt-4 text-white font-bold rounded-xl shadow-md text-lg transition ${agree ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            הגשת הצעת מחיר
          </button>
        </form>

        <div className="text-sm text-gray-600 mt-6 space-y-2">
          <p><strong>FOB</strong> (Free On Board) – הספק אחראי לספק את הסחורה עד לנמל המוצא ולמסור אותה למשלח. המחיר כולל הובלה ימית בלבד.</p>
          <p><strong>EXW</strong> (Ex Works) – הסחורה תהיה לאיסוף במחסן הספק. כל ההובלות, העמלות והמיסים – באחריות הלקוח מרגע האיסוף.</p>
        </div>
      </div>
    </div>
  );
}

const inputClass = "w-full border border-gray-300 rounded-xl px-4 h-[40px] text-sm bg-white";
const input = `${inputClass}`;