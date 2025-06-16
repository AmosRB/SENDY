// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LinkInputPage() {
  const [clientCode, setClientCode] = useState('');
  const [error, setError] = useState(''); // שגיאות כלליות
  const [step, setStep] = useState('input'); // 'input', 'registerUserForm', 'knownUser', 'registrationSuccess'
  const [loading, setLoading] = useState(false);

  // שדות טופס הרישום
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [business, setBusiness] = useState('');
  const [taxIdNumber, setTaxIdNumber] = useState('');

  const [link, setLink] = useState('');
  const [errors, setErrors] = useState({ phone: '', email: '', name: '', business: '', taxIdNumber: '' }); // שגיאות ולידציה ספציפיות
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [copyMessage, setCopyMessage] = useState('');

  // 🚨 NEW STATE: להצגת הקוד לאחר רישום מוצלח
  const [registrationSuccessCode, setRegistrationSuccessCode] = useState('');

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

  const handleLinkSubmit = async (e) => {
  e.preventDefault();
  if (!link || !link.trim()) {
    setError("נא להזין קישור מוצר");
    return;
  }

  sessionStorage.setItem("productLink", link);
  router.push("/newproduct");
};



  // ... (שאר הקוד של handleClientCodeSubmit, handleRegisterSubmit, handleLinkSubmit, validateEmail, validatePhone)

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{9,10}$/.test(phone.replace(/[^0-9]/g, ''));


  setLoading(true);
  const isBroker = clientCode.startsWith('9');
  const endpoint = isBroker
    ? `/api/customs-brokers?code=${clientCode}`
    : `/api/users?code=${clientCode}`;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
    if (!res.ok) {
      setError('קוד לא קיים. אנא הירשם.');
      // כאן תוכל להפעיל רישום ייעודי אוטומטי אם תרצה
      return;
    }
    const data = await res.json();

    if (isBroker) {
      // ✦ לוגיקה לעמיל מכס
      localStorage.setItem('brokerId', data._id);
      localStorage.setItem('brokerName', data.name);
      localStorage.setItem('brokerCode', data.code);
      // מעבר לדשבורד/סטטוס עמיל
      router.push('/broker-dashboard'); // או '/brokerstatus'
    } else {
      // ✦ לוגיקה ללקוח
      localStorage.setItem('clientId', data._id);
      localStorage.setItem('clientName', data.name);
      localStorage.setItem('clientCode', data.code);
      router.push('/newproduct'); // או כל דף המשך שתרצה
    }
  } catch (err) {
    setError('שגיאה כללית באימות קוד.');
  } finally {
    setLoading(false);
  }
};


    const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError(''); // איפוס שגיאות כלליות

    const newErrors = {};
    if (!name.trim()) newErrors.name = 'שם הוא שדה חובה';
    if (!phone.trim() || !validatePhone(phone)) newErrors.phone = 'מספר טלפון לא תקין';
    if (!email.trim() || !validateEmail(email)) newErrors.email = 'כתובת אימייל לא תקינה';
    if (role === 'store' && !business.trim()) newErrors.business = 'שם העסק הוא שדה חובה לחנויות';
    if (role === 'store' && (!taxIdNumber.trim() || !/^\d{9}$/.test(taxIdNumber))) newErrors.taxIdNumber = 'מספר ח.פ / עוסק מורשה לא תקין';
    if (role === 'importer' && (!business.trim() || !taxIdNumber.trim() || !/^\d{9}$/.test(taxIdNumber))) {
      if (!business.trim()) newErrors.business = 'שם החברה/עסק הוא שדה חובה ליבואנים';
      if (!taxIdNumber.trim() || !/^\d{9}$/.test(taxIdNumber)) newErrors.taxIdNumber = 'מספר ח.פ / עוסק מורשה לא תקין ליבואנים';
    }


    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        phone,
        email,
        role,
        ...(business && { business }),
        ...(taxIdNumber && { taxIdNumber }),
      };

      console.log('Sending registration data:', payload);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data);
        setError(''); // איפוס שגיאה כללית
        const receivedCode = data.code;
        console.log('Received code from backend:', receivedCode);

        // 🚨 NO ALERT - שמור בסטייט והצג ב-UI
        setRegistrationSuccessCode(receivedCode);
        sessionStorage.setItem('clientCode', receivedCode);
        setClientCode(receivedCode);
        setStep('registrationSuccess'); // 🚨 NEW STEP

      } else {
        console.error('Registration failed:', data.error);
        setError(data.error || 'שגיאה ברישום');
      }
    } catch (err) {
      console.error('Network error during registration:', err);
      setError('שגיאת רשת. אנא נסה שוב.');
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
          <form onSubmit={handleUniversalCodeSubmit} className="w-full space-y-4 flex flex-col items-center">
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

        {step === 'registrationSuccess' && (
  <div className="w-full max-w-sm flex flex-col items-center mt-8 space-y-6">
    <h2 className="text-xl font-bold text-black text-center">
      נרשמת בהצלחה!  
      <br />זה הקוד האישי שלך במערכת
    </h2>
    <p className="text-red-600 text-3xl font-mono tracking-widest text-center select-all border-dashed border-2 border-orange-500 p-3 rounded-xl bg-orange-50 shadow-sm">
      {registrationSuccessCode}
    </p>
    <button
      className="w-4/5 mx-auto mt-4 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
      onClick={() => {
        navigator.clipboard.writeText(registrationSuccessCode);
        router.push('/newproduct'); // או כל דף המשך שתרצה
      }}>
      📋 העתק קוד והמשך
    </button>
    <p className="text-center text-black text-sm mt-2">
      שמור את הקוד — תזדקק לו לכניסה למערכת בעתיד
    </p>
  </div>
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