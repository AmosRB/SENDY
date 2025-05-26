// pages/selectors-editor.js
import { useEffect, useState } from 'react';

export default function SelectorsEditor() {
  const [data, setData] = useState({});
  const [domain, setDomain] = useState('');
  const [newField, setNewField] = useState({ key: '', value: '' });
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    fetch('/api/fixed-selectors')
      .then(res => res.json())
      .then(setData);
  }, []);

  const saveData = () => {
    fetch('/api/fixed-selectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    .then(() => alert('שמור בהצלחה'));
  };

  const handleAddField = () => {
    if (!selectedDomain || !newField.key || !newField.value) return;
    const updated = { ...data };
    updated[selectedDomain] = {
      ...updated[selectedDomain],
      [newField.key]: newField.value
    };
    setData(updated);
    setNewField({ key: '', value: '' });
  };

  const handleDeleteDomain = (d) => {
    const updated = { ...data };
    delete updated[d];
    setData(updated);
    if (selectedDomain === d) setSelectedDomain(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ניהול סלקטורים</h1>

      <div className="mb-4">
        <input
          className="border p-2 rounded w-64 mr-2"
          placeholder="דומיין חדש (למשל: ebay.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            if (!domain) return;
            setData(prev => ({ ...prev, [domain]: {} }));
            setDomain('');
          }}
        >הוסף דומיין</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {Object.keys(data).map((d) => (
            <div key={d} className="mb-2">
              <button
                className="text-blue-700 underline mr-2"
                onClick={() => setSelectedDomain(d)}
              >{d}</button>
              <button
                className="text-red-500 text-sm"
                onClick={() => handleDeleteDomain(d)}
              >מחק</button>
            </div>
          ))}
        </div>

        <div>
          {selectedDomain && (
            <div>
              <h2 className="font-bold mb-2">שדות עבור: {selectedDomain}</h2>
              {Object.entries(data[selectedDomain] || {}).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <strong>{key}:</strong> {value}
                </div>
              ))}

              <div className="mt-4">
                <input
                  className="border p-1 rounded w-24 mr-2"
                  placeholder="שדה"
                  value={newField.key}
                  onChange={(e) => setNewField(f => ({ ...f, key: e.target.value }))}
                />
                <input
                  className="border p-1 rounded w-64 mr-2"
                  placeholder="סלקטור"
                  value={newField.value}
                  onChange={(e) => setNewField(f => ({ ...f, value: e.target.value }))}
                />
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={handleAddField}
                >הוסף</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          className="bg-black text-white px-6 py-2 rounded shadow"
          onClick={saveData}
        >💾 שמור שינויים</button>
      </div>
    </div>
  );
}
