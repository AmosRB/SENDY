// pages/broker.jsx
import { useState, useEffect } from 'react'; // וודא ש-useEffect מיובא
import { useRouter } from 'next/router';
import Head from 'next/head';

console.log('🔍 apiBase:', process.env.NEXT_PUBLIC_API_URL);

export default function BrokerLoginPage() {
  const [brokerInput, setBrokerInput] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('input'); // ברירת המחדל היא 'input'
  const [form, setForm] = useState({ name: '', company: '', taxId: '', phone: '', email: '' });
  const [newCode, setNewCode] = useState('');
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  //  חדש: useEffect לטיפול בפרמטר action
  useEffect(() => {
    if (router.isReady) { // וודא שהראוטר מוכן והפרמטרים נטענו
      const { action } = router.query;
      if (action === 'register') {
        setStep('register'); // שנה את הסטייט ל'register' אם הפרמטר קיים
        setError(''); // אופציונלי: נקה שגיאות קודמות
      }
    }
  }, [router.isReady, router.query.action]); // תלויות ב-router.isReady וב-action ב-query

  const isSixDigitCode = (str) => /^\d{6}$/.test(str);
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{9,10}$/.test(phone.replace(/[^0-9]/g, ''));

  // ... שאר הקוד של handleSubmit, handleRegisterSubmit וכו' ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const input = brokerInput.trim();

    if (!input) {
      setError('יש להזין קוד או מייל');
      return;
    }

    // הוסף ולידציה קלה למניעת שגיאות מיותרות בצד הלקוח
    if (!isSixDigitCode(input) && !validateEmail(input)) {
        setError('יש להזין קוד אישי בן 6 ספרות או אימייל תקין');
        return;
    }

    try {
      const res = await fetch(`${apiBase}/api/customs-brokers?code=${input}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('הקוד לא נמצא - אנא הרשם');
          setStep('register'); // אם הקוד לא נמצא, עבור למסך רישום
        } else {
          throw new Error('שגיאה בשרת, נסה שוב מאוחר יותר.');
        }
        return;
      }
      const data = await res.json();
      localStorage.setItem('brokerId', data._id);
      localStorage.setItem('brokerName', data.name);
      localStorage.setItem('brokerCode', data.code);
      router.push('/newproduct'); // או לכל עמוד אחר המיועד לעמילי מכס מחוברים
    } catch (err) {
      console.error('❌ שגיאה בכניסה:', err);
      setError(err.message || 'שגיאה כללית בכניסה.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'יש להזין שם מלא';
    if (!form.company.trim()) newErrors.company = 'יש להזין שם חברה';
    if (!form.taxId.trim()) newErrors.taxId = 'יש להזין ח.פ / עוסק מורשה';
    if (!validatePhone(form.phone)) newErrors.phone = 'מספר טלפון לא תקין';
    if (!validateEmail(form.email)) newErrors.email = 'אימייל לא תקין';

    if (Object.keys(newErrors).length > 0) {
      // אם היו שגיאות ולידציה בטופס הרישום
      setError(Object.values(newErrors).join(', ')); // הצג את כל השגיאות בהודעה אחת
      return;
    }

    try {
      // יצירת קוד ייחודי בצד השרת עבור עמיל המכס
      const res = await fetch(`${apiBase}/api/customs-brokers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // אין צורך לשלוח code, הוא ייווצר בשרת
        body: JSON.stringify({ ...form }),
      });

      const { ok, data } = await res.json().then(data => ({ ok: res.ok, data })); // קבלת ה-ok status מ-res

      if (!ok) {
        throw new Error(data.error || 'שגיאה כללית ברישום');
      }

      setNewCode(data.code); // שמור את הקוד החדש שהשרת יצר
      setStep('success');
    } catch (err) {
      console.error('❌ שגיאה ברישום עמיל מכס:', err);
      setError(err.message || 'שגיאה ברישום, נסה שוב.');
    }
  };


  const copyAndEnter = () => {
    if (newCode) {
      navigator.clipboard.writeText(newCode).then(() => {
        alert('הקוד הועתק בהצלחה!');
        // לאחר העתקה, נשלח אותו אוטומטית לעמוד המיועד לעמילי מכס
        localStorage.setItem('brokerCode', newCode); // שמור את הקוד בסשן/לוקאל סטורג'
        router.push('/newproduct'); // או לכל עמוד אחר
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('שגיאה בהעתקת הקוד.');
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative pb-20">
      <Head><title>כניסת עמילי מכס | Share A Container</title></Head>

      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[280px] h-[280px] object-contain mt-10" />

      <div className="w-full max-w-sm flex flex-col items-center mt-8 space-y-6">
        {error && <p className="text-red-600 text-center text-sm font-semibold">{error}</p>}

        {/* מסך כניסה (ברירת מחדל או אם אין פרמטר action=register) */}
        {step === 'input' && (
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-gray-800">כניסת עמילי מכס</h1>
            <input
              type="text"
              placeholder="הכנס קוד אישי או אימייל"
              className="w-full border border-gray-300 rounded-xl px-4 py-4 text-right text-black placeholder-amber-700"
              value={brokerInput}
              onChange={(e) => setBrokerInput(e.target.value)}
            />
            <button type="submit" className="w-full py-3 rounded-xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">
              כניסה
            </button>
            <p className="text-center text-[17px] font-semibold text-black mt-6">
              או <button type="button" onClick={() => { setStep('register'); setError(''); }} className="text-blue-700 hover:underline">הרשם</button>
            </p>
          </form>
        )}

        {/* מסך רישום עמיל מכס */}
        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-black">הרשמת עמיל מכס</h1>
            <input placeholder="שם מלא" className="w-full border px-3 py-2 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="שם חברה" className="w-full border px-3 py-2 rounded" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            <input placeholder="מספר ח.פ / עוסק מורשה" className="w-full border px-3 py-2 rounded" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} />
            <input placeholder="טלפון" className="w-full border px-3 py-2 rounded" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="אימייל" className="w-full border px-3 py-2 rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700">הרשמה</button>
          </form>
        )}

        {/* מסך הצלחה */}
        {step === 'success' && (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-black">מעכשיו זה קוד הכניסה שלך למערכת</h2>
            <p className="text-red-600 text-3xl font-mono tracking-widest">{newCode}</p>
            <button onClick={copyAndEnter} className="mt-4 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">📋 העתק את הקוד והכנס לאזור האישי שלך</button>
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