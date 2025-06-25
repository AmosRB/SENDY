// pages/autologin.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AutoLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAndRedirect() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        alert('קוד חסר');
        router.push('/');
        return;
      }

      try {
        const res = await fetch(`https://sendy-2q8b.onrender.com/api/check-code?code=${code}`);

        const data = await res.json();

        if (!data || !data.type) {
          alert('הקוד לא תקף');
          router.push('/');
          return;
        }

        switch (data.type) {
          case 'client':
            localStorage.setItem('clientId', code);
            router.push('/clientopenquotes');
            break;
          case 'importer':
            localStorage.setItem('clientId', code);
            router.push('/importeropenquotes');
            break;
          case 'broker':
            localStorage.setItem('brokerCode', code);
            router.push('/broker');
            break;
          default:
            alert('סוג משתמש לא מוכר');
            router.push('/');
        }
      } catch (e) {
        console.error('שגיאה באימות הקוד:', e);
        router.push('/');
      }
    }

    verifyAndRedirect();
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen text-xl">
      מבצע כניסה אוטומטית...
    </main>
  );
}
