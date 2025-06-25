// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { signIn } from "next-auth/react";


export default function LinkInputPage() {
  // --- State Definitions ---
  // General UI state
  const [clientCode, setClientCode] = useState('');
  const [error, setError] = useState(''); // General errors
  // 'input', 'registerUserForm', 'knownUser', 'registrationSuccess'
  const [step, setStep] = useState('input');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState(''); // This state doesn't seem to be used anywhere. Consider removing if not needed.

  // Registration form fields
  const [currentUserData, setCurrentUserData] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // 'private', 'store', 'importer', 'broker'
  const [business, setBusiness] = useState('');
  const [taxIdNumber, setTaxIdNumber] = useState('');

  // Link input state
  const [link, setLink] = useState('');

  // Validation errors for form fields
  const [errors, setErrors] = useState({ phone: '', email: '', name: '', business: '', taxIdNumber: '' });

  // State for displaying code after successful registration
  const [registrationSuccessCode, setRegistrationSuccessCode] = useState('');

  // --- Hooks ---
  const router = useRouter();

  useEffect(() => {
    // This effect can be used for initial load logic if needed
  }, []);

  // --- Utility Functions ---
  const clearClientSession = () => {
    sessionStorage.clear();
    localStorage.clear();
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{9,10}$/.test(phone.replace(/[^0-9]/g, ''));

  // --- Event Handlers ---

  // Function to go back to previous step
  const goBack = () => {
  setError('');
  setErrors({});
  setCurrentUserData(null);
  setStep('input');
};


  // Function to handle menu item clicks (for registration roles)
  const handleMenuClick = (targetRole) => {
    setMenuOpen(false); // Close the menu
    setError(''); // Clear errors
    setErrors({}); // Clear validation errors

    if (targetRole === 'broker') {
      // Navigate directly to broker registration page
      router.push('/broker?action=register');
    } else {
      setStep('registerUserForm');
      setRole(targetRole);
    }
  };

  // Handle submission of the personal code
  const handleUniversalCodeSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true);

    if (!clientCode || !clientCode.trim()) {
      setError("נא להזין קוד אישי");
      setLoading(false);
      return;
    }

    // Determine if it's a broker code (starts with '9') or a user code
    const isBroker = clientCode.startsWith('9');
    const endpoint = isBroker
      ? `/api/customs-brokers?code=${clientCode}`
      : `/api/users?code=${clientCode}`;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);

      if (!res.ok) {
        setError('קוד לא קיים. אנא הרשם למטה.');
        // Optionally, could setStep('registerUserForm') here to prompt registration
        return;
      }

      const data = await res.json();

if (isBroker) {
  // שמירת פרטי עמיל מכס
  localStorage.setItem('brokerId', data._id);
  localStorage.setItem('brokerName', data.name);
  localStorage.setItem('brokerCode', data.code);
  localStorage.setItem('brokerPhone', data.phone);
  localStorage.setItem('brokerEmail', data.email);
  localStorage.setItem('brokerCompany', data.company);
  localStorage.setItem('brokerTaxId', data.taxId);

  sessionStorage.setItem('brokerId', data._id);
  sessionStorage.setItem('brokerName', data.name);
  sessionStorage.setItem('brokerCode', data.code);
  sessionStorage.setItem('brokerPhone', data.phone);
  sessionStorage.setItem('brokerEmail', data.email);
  sessionStorage.setItem('brokerCompany', data.company);
  sessionStorage.setItem('brokerTaxId', data.taxId);

  router.push('/brokerstatus');
} else {
  // שמירת פרטי לקוח/יבואן
  localStorage.setItem('clientId', data._id);
  localStorage.setItem('clientName', data.name);
  localStorage.setItem('clientCode', data.code);
  localStorage.setItem('clientPhone', data.phone);
  localStorage.setItem('clientEmail', data.email);
  if (data.business) localStorage.setItem('clientBusiness', data.business);

  sessionStorage.setItem('clientId', data._id);
  sessionStorage.setItem('clientName', data.name);
  sessionStorage.setItem('clientCode', data.code);
  sessionStorage.setItem('clientPhone', data.phone);
  sessionStorage.setItem('clientEmail', data.email);
  if (data.business) sessionStorage.setItem('clientBusiness', data.business);

setCurrentUserData(data);
setStep('userWelcome');

}
}  catch (err) {
      console.error('Error verifying code:', err);
      setError('שגיאה כללית באימות קוד.');
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of the registration form
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear specific validation errors
    setError(''); // Reset general errors

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
  setError('');
  const receivedCode = data.code;

  // שמירת כל הפרטים ב-localStorage וב-sessionStorage:
  localStorage.setItem('clientId', data._id);
  localStorage.setItem('clientName', name);
  localStorage.setItem('clientCode', receivedCode);
  localStorage.setItem('clientPhone', phone);
  localStorage.setItem('clientEmail', email);
  if (business) localStorage.setItem('clientBusiness', business);
  if (taxIdNumber) localStorage.setItem('clientTaxIdNumber', taxIdNumber);

  sessionStorage.setItem('clientId', data._id);
  sessionStorage.setItem('clientName', name);
  sessionStorage.setItem('clientCode', receivedCode);
  sessionStorage.setItem('clientPhone', phone);
  sessionStorage.setItem('clientEmail', email);
  if (business) sessionStorage.setItem('clientBusiness', business);
  if (taxIdNumber) sessionStorage.setItem('clientTaxIdNumber', taxIdNumber);

  setRegistrationSuccessCode(receivedCode);
  setClientCode(receivedCode);
  setStep('registrationSuccess');
}
 else {
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


  // --- Render Logic ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-6 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative pb-20">
 <Head>
  {/* SEO רגיל */}
  <title>השוואת הצעות לעמילות מכס | Share A Container</title>
  <meta name="description" content="השווה הצעות מחיר ממגוון עמילי מכס בקלות ובמהירות. בקשה אחת → מספר הצעות. חסוך זמן, כסף ודאגות." />
  <meta name="robots" content="index, follow" />

  {/* Open Graph (לשיתוף בפייסבוק, וואטסאפ, לינקדאין) */}
  <meta property="og:title" content="Share A Container - השוואת הצעות לעמילות מכס" />
  <meta property="og:description" content="מערכת חכמה ליבואנים, לקוחות פרטיים ועסקים לקבלת הצעות מחיר לשילוח בינלאומי ועמילות מכס." />
  <meta property="og:image" content="https://shareacontainer.app/logo-sharecontainer-black.png" />
  <meta property="og:url" content="https://shareacontainer.app/" />
  <meta property="og:type" content="website" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Share A Container - השוואת הצעות לעמילות מכס" />
  <meta name="twitter:description" content="בקשה אחת, מספר הצעות מחיר לעמילות מכס. שירות מקצועי ומהיר ללקוחות ויבואנים." />
  <meta name="twitter:image" content="https://shareacontainer.app/logo-sharecontainer-black.png" />
</Head>


      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        {/* Hamburger Menu */}
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 text-3xl p-2 rounded-full hover:bg-gray-200">
            ☰ {/* Hamburger icon */}
          </button>
          {menuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-right" style={{ transform: 'translateX(-85%)' }}>
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
              <button onClick={() => handleMenuClick('about')} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-right">
                איך זה עובד?
              </button>
              <button onClick={() => handleMenuClick('FAQ')} className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-right">
                שאלות נפוצות
              </button>
            <button
  onClick={() => {
    setMenuOpen(false);
    router.push('/terms');
  }}
  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-right"
>
  תנאי שימוש בשירות
</button>

            </div>
          )}
        </div>

        {/* Back Arrow - displayed only if not in the initial 'input' state */}
        {(step !== 'input' && step !== 'registrationSuccess') && (
          <button onClick={goBack} className="text-gray-800 text-3xl p-2 rounded-full hover:bg-gray-200">
            &#8594; {/* Right arrow */}
          </button>
        )}
      </div>

      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[280px] h-[280px] object-contain mt-2" />

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

        {/* Input Code Screen */}
   {step === 'input' && (
  <form onSubmit={handleUniversalCodeSubmit} className="w-full flex flex-col items-center">
    {/* כותרת ראשית */}
 <h1 className="text-3xl font-bold text-center text-black mt-8">
השוואת הצעות לשילוח מחו"ל ועמילות מכס 
</h1>
<p className="text-center text-lg text-gray-700 max-w-xl mt-4 mb-8">
המערכת מאפשרת ללקוחות פרטיים, בעלי עסקים ויבואנים לקבל בקלות הצעות מחיר ממספר עמילי מכס, ולשמור על מעקב פשוט ונוח.
</p>


    {/* כותרת שניה */}
    <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
      להרשם למטה ולהכנס עם קוד אישי       
    </h2>

    {/* אינפוט קוד אישי */}
    <div className="w-full flex flex-col items-center mb-5">
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="הכנס קוד אישי או הרשם למטה"
        className="w-4/5 mx-auto border border-gray-300 rounded-2xl px-3 py-2 text-right text-black placeholder-amber-700"
        value={clientCode}
        onChange={(e) => setClientCode(e.target.value)}
      />
    </div>

    {/* כפתור המשך */}
    <button
      type="submit"
      className="w-4/5 mx-auto py-2 rounded-2xl text-white font-bold text-base transition shadow-md bg-blue-600 hover:bg-blue-700"
    >
      המשך
    </button>

       <p className="text-center text-[20px] font-semibold text-black mb-4 mt-10">
      הרשמה לאתר לפי סוג משתמש
    </p>

    {/* כפתורי סוגי משתמש */}
    <div className="text-center text-[20px] font-semibold text-blue-700 flex flex-wrap justify-center items-center gap-2 mb-16">
      <button type="button" onClick={() => { setStep('registerUserForm'); setRole('private'); setError(''); setErrors({}); }} className="hover:underline">פרטי</button>
      <span className="text-orange-500">●</span>
      <button type="button" onClick={() => { setStep('registerUserForm'); setRole('store'); setError(''); setErrors({}); }} className="hover:underline">חנות / עסק</button>
      <span className="text-orange-500">●</span>
      <button type="button" onClick={() => { setStep('registerUserForm'); setRole('importer'); setError(''); setErrors({}); }} className="hover:underline">יבואן</button>
      <span className="text-orange-500">●</span>
      <button type="button" onClick={() => { router.push('/broker?action=register'); setError(''); setErrors({}); }} className="hover:underline">עמיל מכס</button>
    </div>
  </form>
)}


        {/* New User Registration Form */}
        {step === 'registerUserForm' && (
          <form onSubmit={handleRegisterSubmit} className="w-full space-y-4 flex flex-col items-center">
            {/* <button
  type="button"
  className="w-4/5 mx-auto py-2 rounded-2xl text-white font-bold text-base transition shadow-md bg-sky-500 hover:bg-sky-700 mb-4"
  onClick={() => signIn('google')}
>
  הרשם/התחבר עם Google
</button> */}

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

         {/* שלב ביניים: שלום שם, בחירת מסלול */}
 {/* שלב ביניים: שלום שם, בחירת מסלול */}
{step === 'userWelcome' && currentUserData && (
  <div className="w-full max-w-sm flex flex-col items-center mt-12 space-y-8">
    <h2 className="text-2xl font-bold text-black text-center mb-2">
  ?שלום {currentUserData.name} לאן אנחנו היום
</h2>

    <div className="w-full flex flex-col gap-4">
      <button
         className="w-4/5 mx-auto py-2 rounded-2xl text-white font-bold text-base transition shadow-md bg-green-600 hover:bg-green-700"
        onClick={() => {
          if (currentUserData.role === 'importer') {
            router.push('/importeropenquotes');
          } else {
            router.push('/clientopenquotes');
          }
        }}
      >
        עבור לדף האישי שלי
      </button>
      <button
         className="w-4/5 mx-auto py-2 rounded-2xl text-white font-bold text-base transition shadow-md bg-blue-600 hover:bg-blue-700"
        onClick={() => {
          if (currentUserData.role === 'importer') {
            router.push('/importerask');
          } else {
            router.push('/newproduct');
          }
        }}
      >
        בקשת הצעת מחיר חדשה
      </button>
    </div>
  </div>
)}

        {/* Registration Success Screen */}
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
  if (role === 'importer') {
    router.push('/importeropenquotes');
  } else {
    router.push('/newproduct');
  }

 

}}


>
              📋 העתק קוד והמשך
            </button>
            <p className="text-center text-black text-sm mt-2">
              שמור את הקוד — תזדקק לו לכניסה למערכת בעתיד
            </p>
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