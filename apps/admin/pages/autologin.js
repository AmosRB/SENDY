// pages/autologin.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AutoLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        alert('קוד חסר');
        router.push('/');
        return;
      }

      // שמור את הקוד בלוקאל סטורג'
      localStorage.setItem('code', code);

      // ננסה לזהות את סוג המשתמש לפי אורך הקוד או קריאת API בעתיד
      if (code.length === 6 && /^\d+$/.test(code)) {
        // קוד של עמיל מכס
        localStorage.setItem('brokerCode', code);
        router.push('/broker');
      } else {
        // קוד של לקוח
        localStorage.setItem('clientId', code);
        router.push('/clientopenquotes');
      }
    }
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen text-xl">
      מבצע כניסה אוטומטית...
    </main>
  );
}
