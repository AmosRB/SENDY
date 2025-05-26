// apps/admin/pages/train-mode.js
import { useState } from 'react';
import Head from 'next/head';
import TrainSelectorWindow from '../components/trainSelectorWindow';

export default function TrainModePage() {
  const [link, setLink] = useState('');
  const [submittedLink, setSubmittedLink] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (link.trim() !== '') setSubmittedLink(link);
  };

  const handleSave = async (selectors) => {
    const hostname = new URL(link).hostname.replace('www.', '');
    const payload = { [hostname]: selectors };
    try {
      const res = await fetch('/api/fixed-selectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save selectors');
      alert('✅ סלקטורים נשמרו בהצלחה');
    } catch (err) {
      alert('❌ שגיאה: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Head>
        <title>Train Mode | SENDY</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">🎓 מצב הכשרה למנוע החיפוש</h1>
      <p className="mb-4 text-gray-600">הזן קישור למוצר מתוך אתר מסחר, ולאחר מכן בחר את האלמנטים המתאימים לכל שדה.</p>

      <form onSubmit={handleSubmit} className="flex space-x-2 space-x-reverse mb-6">
        <input
          type="url"
          placeholder="https://example.com/product"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >🔍 טען דף</button>
      </form>

      {submittedLink && (
        <TrainSelectorWindow url={submittedLink} onSave={handleSave} />
      )}
    </div>
  );
}

