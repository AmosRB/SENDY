// הרחבת index.js - דילוג על knownUser לעסקים
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LinkInputPage() {
  const [step, setStep] = useState('enterName');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('private');
  const [business, setBusiness] = useState('');
  const [taxIdNumber, setTaxIdNumber] = useState('');
  const [errors, setErrors] = useState({ phone: '', email: '' });
  const [link, setLink] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [clientName, setClientName] = useState('');

  const clearClientSession = () => {
    sessionStorage.removeItem('clientId');
    sessionStorage.removeItem('clientName');
    localStorage.removeItem('clientId');
    localStorage.removeItem('clientName');
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{9,10}$/.test(phone.replace(/[^0-9]/g, ''));

  const checkUserByPhoneOnly = async (isReturningUser = false) => {
    clearClientSession();

    const res = await fetch(`http://localhost:4135/api/users?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const user = data[0];
        sessionStorage.setItem('clientId', user._id);
        localStorage.setItem('clientId', user._id);
        sessionStorage.setItem('clientName', user.name);
        localStorage.setItem('clientName', user.name);
        sessionStorage.setItem('clientPhone', user.phone);
        sessionStorage.setItem('clientEmail', user.email || '');
        localStorage.setItem('clientEmail', user.email || '');
        sessionStorage.setItem('clientRole', user.role);
        sessionStorage.setItem('clientBusiness', user.business || '');
        sessionStorage.setItem('clientTaxIdNumber', user.taxIdNumber || '');


        if (isReturningUser) {
          router.push('/clientopenquotes');
        } else {
          if (user.role === 'store' || user.role === 'importer') {
            router.push('/newproduct');
          } else {
            setStep('knownUser');
          }
        }
      } else {
        setStep('register');
      }
    } else {
      setStep('register');
    }
  };

  const handlePhoneOnlySubmit = (e) => {
    e.preventDefault();
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    if (!/^\d{9,10}$/.test(digitsOnly)) {
      setErrors({ ...errors, phone: 'הכנס מספר טלפון תקין' });
      return;
    }
    checkUserByPhoneOnly(true);
  };

  const handleReturningNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) setStep('returningUser');
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) setStep('verifyPhone');
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const newErrors = { phone: '', email: '' };
    if (!validatePhone(phone)) newErrors.phone = 'הכנס מספר טלפון תקין';
    setErrors(newErrors);
    if (!newErrors.phone) {
      checkUserByPhoneOnly();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearClientSession();

    const newErrors = { phone: '', email: '' };
    if (!validatePhone(phone)) newErrors.phone = 'הכנס מספר טלפון תקין';
    if (!validateEmail(email)) newErrors.email = 'הכנס אימייל תקני';
    setErrors(newErrors);

    if (!newErrors.phone && !newErrors.email) {
      if (role === 'store' || role === 'importer') {
        setStep('businessDetails');
        return;
      }
      await registerUser();
    }
  };

  const registerUser = async () => {
    const res = await fetch('http://localhost:4135/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        email,
        role,
        business,
        taxIdNumber,
        createdAt: new Date()
      })
    });

    if (res.ok) {
      const newUser = await res.json();
      sessionStorage.setItem('clientId', newUser._id);
      localStorage.setItem('clientId', newUser._id);
      sessionStorage.setItem('clientName', newUser.name);
      localStorage.setItem('clientName', newUser.name);
      sessionStorage.setItem('clientPhone', newUser.phone);
      sessionStorage.setItem('clientRole', newUser.role);
      sessionStorage.setItem('clientBusiness', newUser.business || '');
      sessionStorage.setItem('clientTaxIdNumber', newUser.taxIdNumber || '');


      if (newUser.role === 'store' || newUser.role === 'importer') {
        router.push('/newproduct');
      } else {
        setStep('knownUser');
      }
    } else {
      alert('שגיאה ברישום המשתמש');
    }
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    if (!business.trim() || !taxIdNumber.trim()) {
      alert('יש למלא את כל שדות העסק');
      return;
    }
    await registerUser();
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem('productLink', link);
    router.push('/newproduct');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative">
      <Head><title>Sendy | Shipping Quote</title></Head>

      <div className="w-full max-w-sm flex flex-col items-center mt-48 space-y-6">
        {step === 'businessDetails' && (
          <form onSubmit={handleBusinessSubmit} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center">עסקים מקבלים אצלנו יחס מועדף</h1>
            <input type="text" placeholder="שם העסק" className="w-full border border-gray-300 rounded-2xl px-4 py-3" value={business} onChange={(e) => setBusiness(e.target.value)} />
            <input type="text" placeholder="מספר ח.פ / עוסק מורשה" className="w-full border border-gray-300 rounded-2xl px-4 py-3" value={taxIdNumber} onChange={(e) => setTaxIdNumber(e.target.value)} />
            <button type="submit" className="w-full py-2 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">בואו נעשה עסקים</button>
          </form>
        )}

  <div className="absolute top-4 right-4 z-50">
  {/* ☰ תפריט */}
  <button onClick={() => setMenuOpen(!menuOpen)} className="text-3xl">☰</button>

  {menuOpen && (
    <div className="absolute top-10 right-0 mt-2 bg-white border rounded-lg shadow-md text-right w-48">
 <button
  onClick={() => {
    setStep('returningName');
    setMenuOpen(false);
  }}
  className="block w-full px-4 py-2 hover:bg-gray-100 text-[18px] font-bold"
>
  כניסה לאזור האישי למנויים
</button>


      <button
        onClick={() => {
          router.push('/broker');
          setMenuOpen(false);
        }}
        className="block w-full px-4 py-2 hover:bg-gray-100"
      >
        כניסת עמילי מכס
      </button>
    </div>
  )}
</div>


      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[300px] h-[350px] object-contain absolute top-0 left-1/2 -translate-x-1/2" />

      <div className="w-full max-w-sm flex flex-col items-center mt-48 space-y-6">
        {step === 'enterName' && (
          <form onSubmit={handleNameSubmit} className="w-full space-y-4">
            <h1 className="text-2xl font-bold text-center text-black mb-10 " dir="rtl">רוצה הצעת מחיר למשלוח מחו"ל ?</h1>
     <input
  type="text"
  placeholder=" הכנס שם מלא  לכניסה"
  className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right text-black placeholder-amber-700"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>


            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">כניסה</button>
            <p onClick={() => setStep('returningName')} className="text-center text-blue-600 underline mt-2 cursor-pointer">כניסה לאזור האישי למנויים</p>
          </form>
        )}

        {step === 'returningName' && (
          <form onSubmit={handleReturningNameSubmit} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-black">הכנס את שמך כדי להמשיך</h1>
            <input type="text" placeholder="שם" className="w-full border border-gray-300 rounded-2xl px-4 py-3" value={name} onChange={(e) => setName(e.target.value)} />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">המשך</button>
          </form>
        )}

        {step === 'returningUser' && (
          <form onSubmit={handlePhoneOnlySubmit} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-black">הי {name}, נא להזין מספר טלפון</h1>
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            <input type="text" placeholder="מספר טלפון" className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right text-black placeholder-amber-700" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">כניסה</button>
          </form>
        )}

        {step === 'verifyPhone' && (
          <form onSubmit={handlePhoneSubmit} className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-black">הי {name}, נא לאמת מספר טלפון</h1>
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            <input type="text" placeholder="מספר טלפון" className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right text-black placeholder-amber-700" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">המשך</button>
          </form>
        )}



       {step === 'register' && (
  <form onSubmit={handleRegister} className="w-full space-y-4">
    <h1 className="text-xl font-bold text-center text-black">הי {name}, רק כמה פרטים שנוכל להתחבר</h1>

    {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
    <input
      type="text"
      placeholder="מספר טלפון"
      className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right text-black placeholder-amber-700"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
    />

    {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
    <input
      type="text"
      placeholder="אימייל"
      className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-right text-black placeholder-amber-700"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    {/* סוג משתמש */}
    <div className="flex justify-between text-sm font-semibold text-gray-700">
      <label className="flex items-center space-x-1 space-x-reverse">
        <input
          type="radio"
          name="role"
          value="importer"
          checked={role === 'importer'}
          onChange={() => setRole('importer')}
          className="accent-blue-600"
        />
        <span>יבואן</span>
      </label>
      <label className="flex items-center space-x-1 space-x-reverse">
        <input
          type="radio"
          name="role"
          value="store"
          checked={role === 'store'}
          onChange={() => setRole('store')}
          className="accent-blue-600"
        />
        <span>חנות</span>
      </label>
      <label className="flex items-center space-x-1 space-x-reverse">
        <input
          type="radio"
          name="role"
          value="private"
          checked={role === 'private'}
          onChange={() => setRole('private')}
          className="accent-blue-600"
        />
        <span>לקוח פרטי</span>
      </label>
    </div>

  

    <button
      type="submit"
      className="w-full py-2 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700"
    >
      מתחברים
    </button>
  </form>
)}



        {step === 'knownUser' && (
          <form onSubmit={handleLinkSubmit} className="w-full space-y-4">
            <p className="text-xl font-semibold text-center">שלום לך {name}</p>
            <h1 className="text-2xl font-bold text-center text-black mt-6">קבל הצעת מחיר למשלוח</h1>
            <p className="text-center text-gray-600 mb-2">העתק לפה את הקישור לדף המוצר</p>
            <input type="url" className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-base bg-white shadow-md text-center text-lg" placeholder="https://example.com/product" value={link} onChange={(e) => setLink(e.target.value)} />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">המשך</button>
          </form>
        )}
      </div>
<div className="absolute bottom-20 left-0 right-0 text-center text-[20px] text-gray-700">
  <p>
    עמיל מכס ורוצה להצטרף למערך נותני ההצעות?{' '}
    <span
      onClick={() => router.push('/broker')}
      className="text-blue-600 underline cursor-pointer font-semibold"
    >
      הכנס מכאן
    </span>
  </p>
</div>

<footer className="fixed bottom-0 left-0 w-full py-3 bg-black text-center text-sm text-white z-50 shadow-md">
  כל הזכויות שמורות ל־
  <span className="text-orange-500 font-semibold">Share A Container</span>
   <div className="absolute left-4 top-3 text-purple-400 text-sm"> D&A code design ©</div>
</footer>
    </div>
    </div>
  );
  
}
