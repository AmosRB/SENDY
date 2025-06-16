// index.js – גרסה אחידה עם עיצוב לקוח לפי קוד אישי (כולל שמירת פונקציות קיימות)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LinkInputPage() {
  const [clientCode, setClientCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('input');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('private'); // ברירת מחדל ללקוח פרטי
  const [business, setBusiness] = useState('');
  const [taxIdNumber, setTaxIdNumber] = useState('');
  const [link, setLink] = useState('');
  const [errors, setErrors] = useState({ phone: '', email: '', name: '', business: '', taxIdNumber: '' }); // הוספתי שדות לשגיאות
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const clearClientSession = () => {
    sessionStorage.clear();
    localStorage.clear();
  };

  // useEffect לטיפול בתפקיד כאשר משתמש לוחץ על כפתור רישום
  useEffect(() => {
    if (step === 'registerPrivate') setRole('private');
    else if (step === 'registerStore') setRole('store');
    else if (step === 'registerImporter') setRole('importer');
  }, [step]);


  const handleClientCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(clientCode)) {
      setError('יש להזין קוד אישי בן 6 ספרות');
      return;
    }

    try {
      setLoading(true);

      // נסה לאתר משתמש בקולקציית users
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?code=${clientCode}`);
      if (userRes.ok) {
        const user = await userRes.json();
        // שמירת פרטי המשתמש בסשן וב-localStorage
        const fields = [
          ['clientId', user._id],
          ['clientName', user.name],
          ['clientPhone', user.phone || ''],
          ['clientEmail', user.email || ''],
          ['clientRole', user.role || ''],
          ['clientBusiness', user.business || ''],
          ['clientTaxIdNumber', user.taxIdNumber || ''],
          ['clientCode', user.code] // שמירת הקוד האישי
        ];
        fields.forEach(([key, value]) => {
          sessionStorage.setItem(key, value);
          localStorage.setItem(key, value);
        });
        // ניתוב בהתאם לתפקיד המשתמש
        if (user.role === 'private' || user.role === 'store' || user.role === 'importer') {
          router.push('/newproduct'); // או עמוד ייעודי ללקוחות רגילים
        } else {
          // למקרה של תפקידים לא צפויים, ניתוב לעמוד ברירת מחדל
          router.push('/newproduct');
        }
        return;
      }

      // אם לא נמצא ב-users, נסה לאתר ב-customs-brokers
      const brokerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customs-brokers?code=${clientCode}`);
      if (brokerRes.ok) {
        const broker = await brokerRes.json();
        // שמירת פרטי עמיל המכס (ניתן לשפר את השדות בהתאם לצורך)
        sessionStorage.setItem('brokerId', broker._id);
        localStorage.setItem('brokerId', broker._id);
        sessionStorage.setItem('brokerName', broker.name);
        router.push('/broker'); // ניתוב לעמוד עמילי מכס
        return;
      }

      // אם הקוד לא נמצא באף אחת מהקולקציות
      setError('הקוד לא נמצא - נא להירשם');
      setStep('registerPrivate'); // מנתב לטופס רישום פרטי כברירת מחדל אם הקוד לא נמצא
      setRole('private');
    } catch (err) {
      console.error('❌ שגיאה בבדיקת קוד:', err);
      setError('שגיאה זמנית - נסה שוב');
    } finally {
      setLoading(false);
    }
  };


  const handleRegisterSubmit = async (e) => { // פונקציה אחידה לטיפול בכל טפסי הרישום
    e.preventDefault();
    clearClientSession(); // נקה סשן לפני רישום חדש

    const newErrors = {};
    // בדיקות ולידציה
    if (!name.trim()) newErrors.name = 'יש להזין שם מלא';
    if (!/^[0-9]{9,10}$/.test(phone.replace(/[^0-9]/g, ''))) newErrors.phone = 'מספר טלפון לא תקין';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'אימייל לא תקני';

    if (role === 'store' || role === 'importer') { // בדיקה עבור תפקידים עסקיים
      if (!business.trim()) newErrors.business = 'יש להזין שם עסק';
      if (!taxIdNumber.trim()) newErrors.taxIdNumber = 'יש להזין מספר ח.פ / עוסק מורשה';
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return; // אם יש שגיאות, עצור

    // שליחת הנתונים לשרת
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, business, taxIdNumber, role })
      });

      const { ok, data } = await res.json().then(data => ({ ok: res.ok, data }));

      if (!ok) throw new Error(data.error || 'שגיאה כללית ברישום');

      // שמירת הפרטים שחזרו מהשרת, כולל הקוד האישי
      sessionStorage.setItem('clientId', data._id);
      localStorage.setItem('clientId', data._id);
      sessionStorage.setItem('clientName', data.name);
      sessionStorage.setItem('clientCode', data.code); // שמירת הקוד האישי שהתקבל מהשרת
      localStorage.setItem('clientCode', data.code); // שמירת הקוד האישי שהתקבל מהשרת


      // הצגת הקוד למשתמש
      alert(`נרשמת בהצלחה! הקוד האישי שלך הוא: ${data.code}. אנא שמור אותו לכניסות עתידיות.`);

      router.push('/newproduct'); // ניתוב לעמוד הבא
    } catch (err) {
      setError(err.message);
      console.error('❌ שגיאה ברישום:', err);
    }
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem('productLink', link);
    router.push('/newproduct');
  };

  const [viewportWidth, setViewportWidth] = useState(100);
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const scaleClass = viewportWidth < 450 ? 'scale-[0.95]' : '';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start overflow-y-auto px-4 py-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative pb-[200px] ${scaleClass}`}>
      <Head><title>כניסת לקוחות | Share A Container</title></Head>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/70">
          <div className="flex flex-col items-center space-y-3">
            <div className="text-blue-700 text-lg font-semibold">מאמת קוד...</div>
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[280px] h-[280px] object-contain mt-10" />

      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-3xl">☰</button>
        {menuOpen && (
          <div className="absolute top-10 right-0 mt-2 bg-white border rounded-lg shadow-md text-right w-48">
            <button onClick={() => { setStep('input'); setMenuOpen(false); }} className="block w-full px-4 py-2 hover:bg-gray-100 text-[18px] font-bold">
              כניסת לקוחות
            </button>
            <button onClick={() => { router.push('/broker'); setMenuOpen(false); }} className="block w-full px-4 py-2 hover:bg-gray-100">
              כניסת עמילי מכס
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm flex flex-col items-center mt-8 space-y-6">
        {step === 'input' && (
          <form onSubmit={handleClientCodeSubmit} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-gray-800">כניסת לקוחות</h1>
            {error && <p className="text-red-600 text-center text-sm font-semibold">{error}</p>}
            <input
              type="text"
              placeholder="הכנס קוד אישי"
              className="w-full border border-gray-300 rounded-xl px-4 py-4 text-right text-black placeholder-amber-700"
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
            />
            <button type="submit" className="w-full py-3 rounded-xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">
              כניסה
            </button>
          </form>
        )}

        {/* שורת הכותרת וקישוריות הרישום - ממוקמים מחוץ לכל תנאי step */}
        <div>
          <p className="text-center text-[17px] font-semibold text-black mt-6">
            הרשמה לאתר לפי סוג משתמש
          </p>
          <div className="text-center text-[17px] font-semibold text-blue-700 flex flex-wrap justify-center items-center gap-2 mt-1">
            <button type="button" onClick={() => setStep('registerPrivate')} className="hover:underline">פרטי</button>
            <span className="text-orange-500">●</span>
            <button type="button" onClick={() => setStep('registerStore')} className="hover:underline">חנות / עסק</button>
            <span className="text-orange-500">●</span>
            <button type="button" onClick={() => setStep('registerImporter')} className="hover:underline">יבואן</button>
            <span className="text-orange-500">●</span>
            <button type="button" onClick={() => router.push('/broker')} className="hover:underline">עמיל מכס</button>
          </div>
        </div>

        {/* טופס רישום מאוחד */}
        {(['registerPrivate', 'registerStore', 'registerImporter'].includes(step)) && (
          <form
            onSubmit={handleRegisterSubmit} // משתמשים בפונקציה המאוחדת
            className="w-full max-w-sm space-y-4 mt-6"
          >
            <h1 className="text-xl font-bold text-center text-black">רישום משתמש חדש</h1>
            <input
              type="text"
              placeholder="שם מלא"
              className="w-full border px-4 py-3 rounded text-right"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
            <input
              type="text"
              placeholder="טלפון"
              className="w-full border px-4 py-3 rounded text-right"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            <input
              type="text"
              placeholder="אימייל"
              className="w-full border px-4 py-3 rounded text-right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

            {/* שדות עסק יופיעו רק אם נבחר תפקיד של חנות או יבואן */}
            {(role === 'store' || role === 'importer') && (
              <>
                <input
                  type="text"
                  placeholder="שם העסק"
                  className="w-full border px-4 py-3 rounded text-right"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                />
                {errors.business && <p className="text-red-600 text-sm">{errors.business}</p>}
                <input
                  type="text"
                  placeholder="מספר ח.פ / עוסק מורשה"
                  className="w-full border px-4 py-3 rounded text-right"
                  value={taxIdNumber}
                  onChange={(e) => setTaxIdNumber(e.target.value)}
                />
                {errors.taxIdNumber && <p className="text-red-600 text-sm">{errors.taxIdNumber}</p>}
              </>
            )}
            {error && <p className="text-red-600 text-center text-sm">{error}</p>}
            <button type="submit" className="w-full py-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700">
              הרשמה
            </button>
          </form>
        )}

        {/* הבלוקים הבאים מוסתרים או משמשים לוגיקה ישנה - **יש למחוק אותם** */}
        {/*
        {step === 'register' && ( // זהו בלוק רישום ישן שנדרש למחוק אם הולכים על השיטה החדשה
          <form onSubmit={handleRegister} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-black">רישום משתמש חדש</h1>
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            <input type="text" placeholder="מספר טלפון" className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            <input type="text" placeholder="אימייל" className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex justify-between text-sm font-semibold text-gray-700">
              <label className="flex items-center space-x-1 space-x-reverse">
                <input type="radio" name="role" value="importer" checked={role === 'importer'} onChange={() => setRole('importer')} className="accent-blue-600" />
                <span>יבואן</span>
              </label>
              <label className="flex items-center space-x-1 space-x-reverse">
                <input type="radio" name="role" value="store" checked={role === 'store'} onChange={() => setRole('store')} className="accent-blue-600" />
                <span>חנות</span>
              </label>
              <label className="flex items-center space-x-1 space-x-reverse">
                <input type="radio" name="role" value="private" checked={role === 'private'} onChange={() => setRole('private')} className="accent-blue-600" />
                <span>לקוח פרטי</span>
              </label>
            </div>
            <button type="submit" className="w-full py-2 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">
              המשך
            </button>
          </form>
        )}

        {step === 'businessDetails' && ( // זהו בלוק שיכול להיות מיותר אם הטופס הקודם מטפל בשדות העסק
          <form onSubmit={handleBusinessSubmit} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center">עסקים מקבלים אצלנו יחס מועדף</h1>
            <input type="text" placeholder="שם העסק" className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right" value={business} onChange={(e) => setBusiness(e.target.value)} />
            <input type="text" placeholder="מספר ח.פ / עוסק מורשה" className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right" value={taxIdNumber} onChange={(e) => setTaxIdNumber(e.target.value)} />
            <button type="submit" className="w-full py-2 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">בואו נעשה עסקים</button>
          </form>
        )}
        */}

        {step === 'knownUser' && ( // זהו בלוק שיופעל לאחר כניסה מוצלחת
          <form onSubmit={handleLinkSubmit} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-black">קבל הצעת מחיר למשלוח</h1>
            <p className="text-center text-gray-600">העתק לפה את הקישור לדף המוצר</p>
            <input type="url" className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right" placeholder="https://example.com/product" value={link} onChange={(e) => setLink(e.target.value)} />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">המשך</button>
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