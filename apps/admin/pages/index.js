import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LinkInputPage() {
  const [step, setStep] = useState('enterName');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('private');
  const [errors, setErrors] = useState({ phone: '', email: '' });
  const [link, setLink] = useState('');
  const router = useRouter();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => {
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    return /^\d{9,10}$/.test(digitsOnly);
  };

  const checkUserByName = async () => {
    const res = await fetch(`http://localhost:4135/api/users?name=${encodeURIComponent(name)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        setStep('verifyPhone');
      } else {
        setStep('register');
      }
    } else {
      setStep('register');
    }
  };

  const checkUserByPhone = async () => {
    const res = await fetch(`http://localhost:4135/api/users?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        setStep('knownUser');
      } else {
        setStep('register');
      }
    } else {
      setStep('register');
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      checkUserByName();
    }
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const newErrors = { phone: '', email: '' };
    if (!validatePhone(phone)) newErrors.phone = 'הכנס מספר טלפון תקין';
    setErrors(newErrors);
    if (!newErrors.phone) {
      checkUserByPhone();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = { phone: '', email: '' };
    if (!validatePhone(phone)) newErrors.phone = 'הכנס מספר טלפון תקין';
    if (!validateEmail(email)) newErrors.email = 'הכנס אימייל תקני';
    setErrors(newErrors);
    if (!newErrors.phone && !newErrors.email) {
      await fetch('http://localhost:4135/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, role, createdAt: new Date() })
      });
      setStep('knownUser');
    }
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem('productLink', link);
    router.push('/newproduct');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative">
      <Head><title>Sendy | Shipping Quote</title></Head>
      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[300px] h-[350px] object-contain absolute top-0 left-1/2 -translate-x-1/2" />

      <div className="w-full max-w-sm flex flex-col items-center mt-48 space-y-6">
        {step === 'enterName' && (
          <form onSubmit={handleNameSubmit} noValidate className="w-full space-y-4">
            <h1 dir="rtl" className="text-2xl font-bold text-center text-black">רוצה הצעת מחיר למשלוח מחו"ל ? </h1>
            <input
              type="text"
              placeholder="שם"
              className="w-full border border-gray-300 rounded-2xl px-4 py-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">כניסה</button>
          </form>
        )}

        {step === 'verifyPhone' && (
          <form onSubmit={handlePhoneSubmit} noValidate className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-black">הי {name}, נא לאמת מספר טלפון</h1>
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            <input
              type="text"
              placeholder="מספר טלפון"
              className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-2xl px-4 py-3`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">המשך</button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} noValidate className="w-full space-y-4">
            <h1 className="text-xl font-bold text-center text-black">הי {name}, רק כמה פרטים שנוכל להתחבר</h1>
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            <input
              type="text"
              placeholder="מספר טלפון"
              className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-2xl px-4 py-3`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            <input
              type="text"
              placeholder="אימייל"
              className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-2xl px-4 py-3`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
            <button type="submit" className="w-full py-2 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">מתחברים</button>
          </form>
        )}

        {step === 'knownUser' && (
          <form onSubmit={handleLinkSubmit} className="w-full space-y-4">
            <p className="text-xl font-semibold text-center">שלום לך {name}</p>
            <h1 className="text-2xl font-bold text-center text-black mt-6">קבל הצעת מחיר למשלוח</h1>
            <p className="text-center text-gray-600 mb-2">העתק לפה את הקישור לדף המוצר</p>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-base bg-white shadow-md text-center text-lg"
              placeholder="https://example.com/product"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700">המשך</button>
          </form>
        )}
      </div>
    </div>
  );
}
