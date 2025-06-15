// apps/admin/pages/admin-selectors.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
const apiBase = process.env.NEXT_PUBLIC_API_URL;


export default function AdminSelectorsPage() {
  const [selectors, setSelectors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSelectors = () => {
    setLoading(true);
    fetch(`${apiBase}/api/selectors`)

      .then(res => res.json())
      .then((data) => {
        console.log('✅ Selectors loaded:', data);
        setSelectors(data);
      })
      .catch(err => {
        console.error('❌ Error loading selectors:', err.message);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSelectors();
  }, []);

  const handleChange = (domain, field, value) => {
    setSelectors(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await fetch(`${apiBase}/api/selectors`, {

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🔧 ניהול סלקטורים לפי דומיין</h1>
        <button
          onClick={fetchSelectors}
          className="bg-gray-200 text-sm px-4 py-2 rounded hover:bg-gray-300"
        >
          🔄 רענן
        </button>
      </div>

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
                  value={fields?.[field] || ''}
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
