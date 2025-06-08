// pages/brokerstatus.jsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function BrokerStatusPage() {
  const [broker, setBroker] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const code = sessionStorage.getItem('brokerCode');
    if (!code) {
      setError('אין קוד גישה');
      return;
    }

    fetch(`/api/customs-brokers?code=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data && data._id) setBroker(data);
        else setError('עמיל מכס לא נמצא');
      })
      .catch(() => setError('שגיאה בטעינת הנתונים'));
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-t from-[#f0f8ff] via-white via-[80%] to-white">
      <Head>
        <title>Share A Container | סטטוס עמיל מכס</title>
      </Head>
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-6 text-right">
        {error && <p className="text-red-600 font-bold text-center">{error}</p>}

        {broker && (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center text-blue-800">שלום {broker.name}</h1>
            <p><strong>חברה:</strong> {broker.company}</p>
            <p><strong>מספר רישיון:</strong> {broker.licenseNumber}</p>
            <p><strong>אימייל:</strong> {broker.email}</p>
            <p><strong>טלפון:</strong> {broker.phone}</p>

            <div className="mt-6 border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">הצעות מחיר שטיפלת בהן:</h2>
              <p className="text-sm text-gray-600">(כאן יופיעו הצעות המחיר שנקשרו לעמיל המכס הזה – נשלב בהמשך)</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
