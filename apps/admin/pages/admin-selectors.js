// apps/admin/pages/admin-selectors.js

import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function AdminSelectorsPage() {
  const [selectors, setSelectors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  fetch('http://localhost:4135/api/selectors') // ✅
    .then(res => res.json())
    .then(setSelectors)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, []);

const handleSave = async () => {
  try {
    const res = await fetch('http://localhost:4135/api/selectors', { // ✅
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectors),
    });

      if (!res.ok) throw new Error('Failed to save');
      alert('✅ Selectors saved successfully');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  if (loading) return <p className="p-4">טוען...</p>;
  if (error) return <p className="p-4 text-red-600">שגיאה: {error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Head>
        <title>ניהול סלקטורים</title>
      </Head>
      <h1 className="text-2xl font-bold mb-6">🔧 ניהול סלקטורים לפי דומיין</h1>

      {Object.entries(selectors).map(([domain, fields]) => (
        <div key={domain} className="mb-8 border rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">🌐 {domain}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['name', 'weight', 'dimensions', 'manufacturer', 'origin'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded text-sm"
                  value={fields[field] || ''}
                  onChange={(e) => handleChange(domain, field, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700"
      >
        💾 שמור שינויים
      </button>
    </div>
  );
}
