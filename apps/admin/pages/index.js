// index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LinkInputPage() {
  const [clientCode, setClientCode] = useState('');
  const [error, setError] = useState('');
  // סטייט לניהול השלבים: 'input' (ברירת מחדל), 'registerUserForm', 'knownUser'
  const [step, setStep] = useState('input');
  const [loading, setLoading] = useState(false);
  
  // שדות טופס הרישום
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // ייקבע לפי הבחירה של המשתמש
  const [business, setBusiness] = useState('');
  const [taxIdNumber, setTaxIdNumber] = useState('');
  
  const [link, setLink] = useState(''); // לשימוש ב-knownUser step
  const [errors, setErrors] = useState({ phone: '', email: '', name: '', business: '', taxIdNumber: '' });
  const [menuOpen, setMenuOpen] = useState(false); // סטייט לניהול מצב תפריט ההמבורגר
  const router = useRouter();

  const clearClientSession = () => {
    sessionStorage.clear();
    localStorage.clear();
  };

  // פונקציית חזרה אחורה
  const goBack = () => {
    setError(''); // נקה שגיאות כשחוזרים אחורה
    setErrors({}); // נקה שגיאות ולידציה

    if (step === 'registerUserForm') {
      setStep('input'); // חזור למסך כניסת קוד
    } else if (step === 'knownUser') {
      // אם משתמש קיים, יכול להיות שהוא הגיע מההתחברות הראשית
      setStep('input'); 
    }
  };

  // פונקציה לטיפול בלחיצה על קישור בתפריט
  const handleMenuClick = (targetRole) => {
    setMenuOpen(false); // סגור את התפריט
    setError(''); // נקה שגיאות
    setErrors({}); // נקה שגיאות ולידציה
    if (targetRole === 'broker') {
      router.push('/broker?action=register'); // **שינוי כאן: וודא שזה מנווט לרישום ישירות**
    } else {
      setStep('registerUserForm');
      setRole(targetRole);
    }
  };


  // ... (שאר הקוד של handleClientCodeSubmit, handleRegisterSubmit, handleLinkSubmit, validateEmail, validatePhone)

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{9,10}$/.test(phone.replace(/[^0-9]/g, ''));


  const handleClientCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(clientCode)) {
      setError('יש להזין קוד אישי בן 6 ספרות');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?code=${clientCode}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('קוד לא קיים. אנא הירשם.');
          setStep('registerUserForm'); // אם הקוד לא נמצא, עבור לטופס הרשמה
        } else {
          throw new Error('שגיאה באימות קוד.');
        }
        return;
      }
      const data = await res.json();
      localStorage.setItem('clientId', data._id);
      localStorage.setItem('clientName', data.name);
      localStorage.setItem('clientCode', data.code);
      setStep('knownUser'); // עבור לסטייט של משתמש קיים
    } catch (err) {
      console.error('❌ שגיאה באימות קוד:', err);
      setError(err.message || 'שגיאה כללית באימות קוד.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearClientSession();

    const newErrors = {};
    if (!name.trim()) newErrors.name = 'יש להזין שם מלא';
    if (!phone.trim() || !validatePhone(phone)) newErrors.phone = 'יש להזין מספר טלפון תקין';
    if (!email.trim() || !validateEmail(email)) newErrors.email = 'יש להזין אימייל תקין';

    if (role === 'store' || role === 'importer') {
      if (!business.trim()) newErrors.business = 'יש להזין שם עסק';
      if (!taxIdNumber.trim()) newErrors.taxIdNumber = 'יש להזין ח.פ / עוסק מורשה';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).some(key => newErrors[key])) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, business, taxIdNumber, role })
      });

      const { ok, data } = await res.json().then(data => ({ ok: res.ok, data }));

      if (!ok) throw new Error(data.error || 'שגיאה כללית ברישום');

      sessionStorage.setItem('clientId', data._id);
      localStorage.setItem('clientId', data._id);
      sessionStorage.setItem('clientName', data.name);
      sessionStorage.setItem('clientCode', data.code);
      localStorage.setItem('clientCode', data.code);

      router.push('/newproduct'); 
    } catch (err) {
      setError(err.message);
      console.error('❌ שגיאה ברישום:', err);
    }
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!link.trim()) {
      setError('יש להזין קישור');
      return;
    }

    setLoading(true);
    try {
      sessionStorage.setItem('productLink', link); 
      router.push('/show-link'); 
    } catch (err) {
      console.error('❌ שגיאה בהעברת קישור:', err);
      setError(err.message || 'שגיאה כללית בהעברת קישור.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative pb-20">
      <Head>
        <title>Share A Container</title>
      </Head>

      {/* כותרת עליונה - ממוקם מימין */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        {/* תפריט המבורגר - יוצג בכל המסכים */}
        <div className="relative"> {/* עוטף את כפתור ההמבורגר ואת התפריט הנפתח */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 text-3xl p-2 rounded-full hover:bg-gray-200">
              ☰ {/* אייקון המבורגר */}
          </button>
          {menuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-right" style={{ transform: 'translateX(-85%)' }}> {/* מיקום התפריט מימין לכפתור, עם הזזה קלה */}
              <button onClick={() => handleMenuClick('private')} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-right">
                הרשמת לקוח פרטי
              </button>
              <button onClick={() => handleMenuClick('importer')} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-right">
                הרשמת יבואן
              </button>
              <button onClick={() => handleMenuClick('store')} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-right">
                הרשמת חנות / עסק
              </button>
              <button onClick={() => handleMenuClick('broker')} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-right">
                הרשמת עמיל מכס
              </button>
            </div>
          )}
        </div>
        
        {/* חץ חזרה - יוצג רק אם זה לא הסטייט הראשוני ('input') */}
        {(step !== 'input') && (
          <button onClick={goBack} className="text-gray-800 text-3xl p-2 rounded-full hover:bg-gray-200">
            &#8594; {/* חץ ימינה */}
          </button>
        )}
      </div>

      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[280px] h-[280px] object-contain mt-10" />

      {/* העטיפה של הטפסים צריכה להיות גמישה כדי למרכז אלמנטים שאינם w-full */}
      <div className="w-full max-w-sm flex flex-col items-center mt-8 space-y-6">
        {loading && (
          <div className="flex items-center space-x-2 text-gray-700">
            <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>מאמת קוד...</span>
          </div>
        )}
        {error && <p className="text-red-600 text-center text-sm font-semibold">{error}</p>}

        {step === 'input' && (
          <form onSubmit={handleClientCodeSubmit} className="w-full space-y-4 flex flex-col items-center">
            <h1 className="text-xl font-bold text-center text-gray-800">הכנס קוד אישי</h1>
            <input
              type="text"
              placeholder="הכנס קוד אישי"
              className="w-4/5 mx-auto border border-gray-300 rounded-2xl px-3 py-2 text-right text-black placeholder-amber-700"
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
            />
            <button type="submit" className="w-4/5 mx-auto py-2 rounded-2xl text-white font-bold text-base transition shadow-md bg-blue-600 hover:bg-blue-700">
              המשך
            </button>
            <p className="text-center text-[17px] font-semibold text-black mt-6">
              הרשמה לאתר לפי סוג משתמש
            </p>
            <div className="text-center text-[17px] font-semibold text-blue-700 flex flex-wrap justify-center items-center gap-2 mt-1">
              <button type="button" onClick={() => { setStep('registerUserForm'); setRole('private'); setError(''); setErrors({}); }} className="hover:underline">פרטי</button>
              <span className="text-orange-500">●</span>
              <button type="button" onClick={() => { setStep('registerUserForm'); setRole('store'); setError(''); setErrors({}); }} className="hover:underline">חנות / עסק</button>
              <span className="text-orange-500">●</span>
              <button type="button" onClick={() => { setStep('registerUserForm'); setRole('importer'); setError(''); setErrors({}); }} className="hover:underline">יבואן</button>
              <span className="text-orange-500">●</span>
              <button type="button" onClick={() => { router.push('/broker?action=register'); setError(''); setErrors({}); }} className="hover:underline">עמיל מכס</button> {/* **שינוי כאן: ניווט ישיר ל-`/broker?action=register`** */}
            </div>
          </form>
        )}

        {/* מסך רישום משתמש חדש */}
        {step === 'registerUserForm' && (
          <form onSubmit={handleRegisterSubmit} className="w-full space-y-4 flex flex-col items-center">
            <h1 className="text-xl font-bold text-center text-black">הרשמת {role === 'private' ? 'לקוח פרטי' : role === 'store' ? 'חנות / עסק' : 'יבואן'}</h1>
            <input type="text" placeholder="שם מלא" className="w-4/5 mx-auto border border-gray-300 rounded-2xl px-3 py-2 text-right" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-red-500 text-right text-xs">**{errors.name}**</p>}
            <input type="text" placeholder="טלפון" className="w-4/5 mx-auto border border-gray-300 rounded-2xl px-3 py-2 text-right" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {errors.phone && <p className="text-red-500 text-right text-xs">**{errors.phone}**</p>}
            <input type="email" placeholder="אימייל" className="w-4/5 mx-auto border border-gray-300 rounded-2xl px-3 py-2 text-right" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="text-red-500 text-right text-xs">**{errors.email}**</p>}
            {(role === 'store' || role === 'importer') && (
              <>
                <input type="text" placeholder="שם העסק" className="w-4/5 mx-auto border border-gray-300 rounded-2xl px-3 py-2 text-right" value={business} onChange={(e) => setBusiness(e.target.value)} />
                {errors.business && <p className="text-red-500 text-right text-xs">**{errors.business}**</p>}
                <input type="text" placeholder="מספר ח.פ / עוסק מורשה" className="w-4/5 mx-auto border border-gray-300 rounded-2xl px-3 py-2 text-right" value={taxIdNumber} onChange={(e) => setTaxIdNumber(e.target.value)} />
                {errors.taxIdNumber && <p className="text-red-500 text-right text-xs">**{errors.taxIdNumber}**</p>}
              </>
            )}
            {error && <p className="text-red-600 text-center text-sm">{error}</p>}
            <button type="submit" className="w-4/5 mx-auto py-2 rounded-2xl text-white font-bold text-base transition shadow-md bg-blue-600 hover:bg-blue-700">בואו נעשה עסקים</button>
          </form>
        )}

        {step === 'knownUser' && ( 
          <form onSubmit={handleLinkSubmit} className="w-full space-y-4 flex flex-col items-center">
            <h1 className="text-xl font-bold text-center text-black">קבל הצעת מחיר למשלוח</h1>
            <p className="text-center text-gray-600">העתק לפה את הקישור לדף המוצר</p>
            <input type="url" className="w-4/5 mx-auto border border-gray-300 rounded-2xl px-3 py-2 text-right" placeholder="https://example.com/product" value={link} onChange={(e) => setLink(e.target.value)} />
            <button type="submit" className="w-4/5 mx-auto py-2 rounded-2xl text-white font-bold text-base transition shadow-md bg-blue-600 hover:bg-blue-700">המשך</button>
          </form>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 w-full py-3 bg-black text-center text-sm text-white z-50 shadow-md">
        כל הזכויות שמורות ל־<span className="text-orange-500 font-semibold">Share A Container</span>
        <div className="absolute left-4 top-3 text-purple-400 text-sm">D&A code design ©</div>
      </footer>
    </div>
  );
}