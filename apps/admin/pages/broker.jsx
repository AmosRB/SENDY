// pages/broker.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

console.log('🔍 apiBase:', process.env.NEXT_PUBLIC_API_URL);

export default function BrokerLoginPage() {
  const [brokerInput, setBrokerInput] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('input');
  const [form, setForm] = useState({ name: '', company: '', taxId: '', phone: '', email: '' });
  const [newCode, setNewCode] = useState('');
  const router = useRouter();
  const apiBase = 'http://localhost:4135';

  const isSixDigitCode = (str) => /^\d{6}$/.test(str);
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{9,10}$/.test(phone.replace(/[^0-9]/g, ''));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const input = brokerInput.trim();

    if (!input) return;

    if (/^\d{1,5}$/.test(input)) {
      setError('הזן קוד בן 6 ספרות תקני');
      return;
    }

    if (/^\d{7,}$/.test(input)) {
      setError('הזן קוד תקני או הרשם');
      return;
    }

    if (isSixDigitCode(input)) {
      try {
        const res = await fetch(`${apiBase}/api/customs-brokers?code=${input}`);

        if (res.status === 404) {
          setError('קוד לא נכון - הכנס קוד תקין או הרשם');
          return;
        }
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API Error: ${res.status} ${errText}`);
        }

        const data = await res.json();
        sessionStorage.setItem('brokerCode', input);
        sessionStorage.setItem('brokerData', JSON.stringify(data));
        router.push('/brokerstatus');
      } catch (err) {
        console.error('❌ שגיאה בטעינת הקוד:', err.message);
        setError('שגיאה בטעינת הנתונים');
      }
    } else {
      setForm((prev) => ({ ...prev, name: input }));
      setStep('register');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, company, taxId, phone, email } = form;

    if (!name.trim() || !company.trim() || !taxId.trim() || !phone.trim() || !email.trim()) {
      setError('נא למלא את כל השדות');
      return;
    }
    if (!validatePhone(phone)) {
      setError('מספר טלפון לא תקין');
      return;
    }
    if (!validateEmail(email)) {
      setError('אימייל לא תקין');
      return;
    }

    try {
      const getUniqueCode = async () => {
        let code;
        let exists = true;
        while (exists) {
          code = Math.floor(100000 + Math.random() * 900000).toString();
          const check = await fetch(`${apiBase}/api/customs-brokers?code=${code}`);
          exists = check.ok;
        }
        return code;
      };

      const code = await getUniqueCode();

      console.log('📤 שולח רישום עמיל:', { ...form, code });

      const res = await fetch(`${apiBase}/api/customs-brokers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, code, createdAt: new Date() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'שגיאה כללית');

      console.log('✅ עמיל נוסף בהצלחה:', data);

      setNewCode(code);
      sessionStorage.setItem('brokerCode', code);
      setStep('success');
    } catch (err) {
      console.error('❌ שגיאה בשליחת הטופס:', err);
      setError(`שגיאה: ${err.message}`);
    }
  };

  const copyAndEnter = () => {
    navigator.clipboard.writeText(newCode);
    router.push('/brokerstatus');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative">
      <Head>
        <title>Share A Container | כניסת עמילי מכס</title>
      </Head>

      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[300px] h-[350px] object-contain absolute top-0 left-1/2 -translate-x-1/2" />

      <div className="w-full max-w-sm flex flex-col items-center mt-48 space-y-6">
        {step === 'input' && (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <h1 className="text-2xl font-bold text-center text-black">כניסת עמילי מכס</h1>
            {error && <p className="text-red-600 text-center text-sm font-semibold">{error}</p>}
            <input
              type="text"
              placeholder="הכנס קוד משתמש לכניסה או שם מלא להרשמה"
              className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right text-black placeholder-amber-700"
              value={brokerInput}
              onChange={(e) => setBrokerInput(e.target.value)}
            />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">כניסה</button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className="w-full space-y-3">
            <h2 className="text-xl font-bold text-center">הרשמת עמיל מכס חדש</h2>
            {error && <p className="text-red-600 text-center text-sm font-semibold">{error}</p>}
            <input placeholder="שם מלא" className="w-full border px-3 py-2 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="שם העסק" className="w-full border px-3 py-2 rounded" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            <input placeholder="מספר ח.פ / עוסק מורשה" className="w-full border px-3 py-2 rounded" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} />
            <input placeholder="טלפון" className="w-full border px-3 py-2 rounded" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="אימייל" className="w-full border px-3 py-2 rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700">הרשמה</button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-black">מעכשיו זה קוד הכניסה שלך למערכת</h2>
            <p className="text-red-600 text-3xl font-mono tracking-widest">{newCode}</p>
            <button onClick={copyAndEnter} className="mt-4 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">📋 העתק את הקוד והכנס לאזור האישי שלך</button>
          </div>
        )}
      </div>
      <footer className="fixed bottom-0 left-0 w-full py-3 bg-black text-center text-sm text-white z-50 shadow-md">
  כל הזכויות שמורות ל־
  <span className="text-orange-500 font-semibold">Share A Container</span>
   <div className="absolute left-4 top-3 text-purple-400 text-sm"> D&A code design ©</div>
</footer>
    </div>
  );
}
