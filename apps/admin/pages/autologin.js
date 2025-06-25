'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AutoLoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function verifyAndRedirect() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code')?.trim();

      if (!code) {
        router.push('/'); // קוד חסר
        return;
      }

      try {
        const res = await fetch(`https://sendy-2q8b.onrender.com/api/check-code?code=${code}`);
        const data = await res.json();

        if (!data || !data.type || !data.id) {
          router.push('/'); // קוד לא תקף
          return;
        }

        switch (data.type) {
          case 'client':
          case 'importer':
            localStorage.setItem('clientId', data.id);
            localStorage.setItem('clientName', data.name || '');
            router.push(data.type === 'client' ? '/clientopenquotes' : '/importeropenquotes');
            break;
          case 'broker':
            localStorage.setItem('brokerCode', code);
            localStorage.setItem('brokerName', data.name || '');
            router.push('/brokerstatus');
            break;
          default:
            router.push('/'); // סוג לא מזוהה
        }
      } catch (e) {
        console.error('שגיאה באימות הקוד:', e);
        router.push('/'); // שגיאה כללית
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
