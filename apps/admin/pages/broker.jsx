// pages/broker.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function BrokerLoginPage() {
  const [brokerCode, setBrokerCode] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (brokerCode.trim()) {
      sessionStorage.setItem('brokerCode', brokerCode);
      router.push('/brokerstatus');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative">
      <Head>
        <title>Share A Container | כניסת עמילי מכס</title>
      </Head>

      <img
        src="/logo-sharecontainer-black.png"
        alt="Logo"
        className="w-[300px] h-[350px] object-contain absolute top-0 left-1/2 -translate-x-1/2"
      />

      <div className="w-full max-w-sm flex flex-col items-center mt-48 space-y-6">
        <form onSubmit={handleSubmit} noValidate className="w-full space-y-4">
          <h1 className="text-2xl font-bold text-center text-black">כניסת עמילי מכס</h1>
          <input
            type="text"
            placeholder="הכנס קוד משתמש"
            className="w-full border border-gray-300 rounded-2xl px-4 py-4"
            value={brokerCode}
            onChange={(e) => setBrokerCode(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700"
          >
            כניסה
          </button>
        </form>
      </div>
    </div>
  );
}
