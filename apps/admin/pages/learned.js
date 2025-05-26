import { useEffect, useState } from 'react'; 
import Head from 'next/head';

export default function LearnedSelectorsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState('');
  const [filterField, setFilterField] = useState('');
  const [groupedData, setGroupedData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4135/api/train-selector/all');
    const json = await res.json();
    setData(json);
    groupData(json);
    setLoading(false);
  };

  const groupData = (items) => {
    const grouped = {};
    items.forEach(item => {
      const key = `${item.domain}|||${item.field}|||${item.selector}`;
      if (!grouped[key]) {
        grouped[key] = { ...item, count: 1 };
      } else {
        grouped[key].count++;
      }
    });
    setGroupedData(Object.values(grouped));
  };

  const handleDelete = async (item) => {
    await fetch('http://localhost:4135/api/train-selector/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: item.url, selector: item.selector, field: item.field })
    });
    fetchData();
  };

  const handleSave = async (item) => {
    await fetch('http://localhost:4135/api/fixed-selectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: item.url, selector: item.selector, field: item.field })
    });
    alert('✅ נשמר לסלקטורים קבועים');
  };

  const handleExportAndClear = async () => {
    const res = await fetch('http://localhost:4135/api/train-selector/export', {
      method: 'POST'
    });
    const result = await res.json();
    alert(`📦 נוצר קובץ ${result.path} (${result.totalDomains} דומיינים)`);
    // ננקה את הרשומות הגולמיות לאחר השמירה
    await fetch('http://localhost:4135/api/train-selector/clear', {
      method: 'POST'
    });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = groupedData.filter(item => {
    return (!filterDomain || item.domain.includes(filterDomain)) &&
           (!filterField || item.field.includes(filterField));
  });

  return (
    <div>
      <Head>
        <title>סלקטורים שנלמדו</title>
      </Head>
      <h1 style={{ color: 'crimson' }}>💾 סלקטורים שנלמדו (לפי מופעים)</h1>

      <div style={{ marginBottom: '1em' }}>
        <label>🔍 סינון לפי דומיין: </label>
        <input type="text" value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} />
        &nbsp;
        <label>📂 לפי שדה: </label>
        <input type="text" value={filterField} onChange={(e) => setFilterField(e.target.value)} />
        &nbsp;
        <button onClick={handleExportAndClear}>📤 ייצוא ואיפוס מאגר</button>
      </div>

      {loading ? <p>טוען...</p> : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>#</th>
              <th>שדה</th>
              <th>דומיין</th>
              <th>מופעים</th>
              <th>סלקטור</th>
              <th>שמור</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.field}</td>
                <td>{item.domain}</td>
                <td style={{ textAlign: 'center' }}>{item.count}</td>
                <td style={{ direction: 'ltr', fontSize: '0.8em' }}>{item.selector}</td>
                <td>
                  <button onClick={() => handleSave(item)}>💾</button>
                  <button onClick={() => handleDelete(item)}>✖</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
