// pages/broker.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

console.log('🔍 apiBase:', process.env.NEXT_PUBLIC_API_URL);

export default function BrokerLoginPage() {
  const [error, setError] = useState('');
  // נגדיר את הסטייט ההתחלתי כ-'register' מכיוון שדף זה נועד לרישום בלבד כעת.
  const [currentStep, setCurrentStep] = useState('register'); 
  const [form, setForm] = useState({ name: '', company: '', taxId: '', phone: '', email: '' });
  const [newCode, setNewCode] = useState('');
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  // פונקציות ולידציה
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{9,10}$/.test(phone.replace(/[^0-9]/g, ''));

  // נסיר את פונקציית handleSubmit הישנה ששימשה לכניסה עם קוד.
  // אין צורך בה יותר בדף זה.

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!form.name || !form.company || !form.taxId || !form.phone || !form.email) {
      setError('כל השדות חובה.');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('פורמט אימייל לא תקין.');
      return;
    }
    if (!validatePhone(form.phone)) {
      setError('פורמט טלפון לא תקין (9 או 10 ספרות).');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/customs-brokers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'שגיאה כללית ברישום');
      }

      setNewCode(data.code); // שמור את הקוד שנוצר
      setCurrentStep('success'); // עבור לשלב הצלחה
      localStorage.setItem('brokerId', data._id); // שמור את ה-ID לאחר הרישום המוצלח
      localStorage.setItem('brokerName', data.name);
      localStorage.setItem('brokerCode', data.code);

    } catch (err) {
      console.error('❌ שגיאה ברישום עמיל מכס:', err);
      setError(err.message || 'שגיאה כללית ברישום.');
    }
  };

  const copyAndEnter = () => {
  navigator.clipboard.writeText(newCode);
  router.push('/brokerstatus'); 
};


  // אין צורך ב-useEffect שמטפל בפרמטר 'action=register' 
  // מכיוון שהדף מתחיל תמיד במצב 'register' כעת.
  // אם נרצה בעתיד שיהיה לדף הזה גם מצב כניסה, נצטרך להוסיף בחזרה את ה-useEffect ואת הלוגיקה המתאימה.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative pb-20">
      <Head>
        <title>עמיל מכס</title>
      </Head>

      <div className="absolute top-4 right-4 z-10">
        <button onClick={() => router.push('/')} className="text-gray-800 text-3xl p-2 rounded-full hover:bg-gray-200">
          &#8594; {/* חץ ימינה */}
        </button>
      </div>

      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[280px] h-[280px] object-contain mt-10" />

      <div className="w-full max-w-sm flex flex-col items-center mt-8 space-y-6">
        {error && <p className="text-red-600 text-center text-sm font-semibold">{error}</p>}

        {/* נציג רק את טופס הרישום או את מסך ההצלחה */}
        {currentStep === 'register' && ( 
          <form onSubmit={handleRegisterSubmit} className="w-full space-y-4 flex flex-col items-center">
            <h1 className="text-xl font-bold text-center text-black">הרשמת עמיל מכס</h1>
            <input placeholder="שם מלא" className="w-4/5 mx-auto border px-3 py-2 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="שם חברה" className="w-4/5 mx-auto border px-3 py-2 rounded" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            <input placeholder="מספר ח.פ / עוסק מורשה" className="w-4/5 mx-auto border px-3 py-2 rounded" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} />
            <input placeholder="טלפון" className="w-4/5 mx-auto border px-3 py-2 rounded" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="אימייל" className="w-4/5 mx-auto border px-3 py-2 rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <button type="submit" className="w-4/5 mx-auto py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700">הרשמה</button>
          </form>
        )}

        {currentStep === 'success' && (
          <div className="text-center space-y-4 flex flex-col items-center">
            <h2 className="text-xl font-bold text-black">מעכשיו זה קוד הכניסה שלך למערכת</h2>
            <p className="text-red-600 text-3xl font-mono tracking-widest">{newCode}</p>
            <button onClick={copyAndEnter} className="w-4/5 mx-auto mt-4 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">📋 העתק את הקוד והכנס לאזור האישי שלך</button>
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 w-full py-3 bg-black text-center text-sm text-white z-50 shadow-md">
        כל הזכויות שמורות ל־<span className="text-orange-500 font-semibold">Share A Container</span>
        <div className="absolute left-4 top-3 text-purple-400 text-sm">D&A code design ©</div>
      </footer>
    </div>
  );
}