import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function StatsPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/train-selector/selectors-learned`)

      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const renderTable = () => {
    const rows = [];
    let i = 1;
    const domainsToRender = selectedDomain ? [selectedDomain] : Object.keys(data);

    for (const domain of domainsToRender) {
      for (const field in data[domain]) {
        const sorted = data[domain][field].sort((a, b) => b.score - a.score);
       const top = sorted[0];
rows.push(
  <tr key={`${domain}-${field}`}>
    <td>{i++}</td>
    <td>{field}</td>
    <td>{domain}</td>
    <td>{top ? top.score : '—'}</td>
    <td style={{
      direction: 'ltr',
      fontSize: '0.8em',
      color: top && top.score === 0 ? 'red' : 'black'
    }}>
      {top ? top.selector : '—'}
    </td>
  </tr>
);

      }
    }
    return rows;
  };

  const renderChart = () => {
    const fieldCounts = {};
    const domainsToRender = selectedDomain ? [selectedDomain] : Object.keys(data);

    for (const domain of domainsToRender) {
      for (const field in data[domain]) {
        fieldCounts[field] = (fieldCounts[field] || 0) + data[domain][field].length;
      }
    }

    const fields = Object.keys(fieldCounts);
    const counts = fields.map(f => fieldCounts[f]);

    return (
      <Chart
        type="bar"
        series={[{ name: 'כמות סלקטורים', data: counts }]}
        options={{
          chart: { id: 'selectors' },
          xaxis: { categories: fields },
          title: {
            text: selectedDomain
              ? `📊 כמות סלקטורים לפי שדה (${selectedDomain})`
              : '📊 כמות סלקטורים לפי שדה'
          },
          colors: ['#FF5733']
        }}
        width="100%"
        height="350"
      />
    );
  };

  const renderDomainSummary = () => {
    const domainCounts = {};
    for (const domain in data) {
      let count = 0;
      for (const field in data[domain]) {
        count += data[domain][field].length;
      }
      domainCounts[domain] = count;
    }

    return (
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <strong>📂 סיכום לפי דומיין:</strong>
        <span
          onClick={() => setSelectedDomain(null)}
          style={{
            cursor: 'pointer',
            fontWeight: selectedDomain === null ? 'bold' : 'normal',
            color: selectedDomain === null ? '#0070f3' : '#555',
            textDecoration: 'underline'
          }}
        >
          הכל
        </span>
        {Object.entries(domainCounts).map(([domain, count]) => (
          <span
            key={domain}
            onClick={() => setSelectedDomain(domain)}
            style={{
              cursor: 'pointer',
              fontWeight: selectedDomain === domain ? 'bold' : 'normal',
              color: selectedDomain === domain ? '#0070f3' : '#333',
              textDecoration: 'underline'
            }}
          >
            {domain}: {count} סלקטורים
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <Head>
        <title>סטטיסטיקת סלקטורים שנלמדו</title>
      </Head>

      <h1 style={{ color: '#9a031e' }}>📊 סטטיסטיקה</h1>
      <p style={{ marginBottom: '2rem' }}>טבלת סיכום לפי סלקטור מוביל בכל דומיין/שדה.</p>

      {renderDomainSummary()}

      {loading ? <p>טוען...</p> : (
        <>
          <table border="1" cellPadding="6" style={{ width: '100%', marginBottom: '3rem' }}>
            <thead style={{ background: '#f0f0f0' }}>
              <tr>
                <th>#</th>
                <th>שדה</th>
                <th>דומיין</th>
                <th>score</th>
                <th>סלקטור מוביל</th>
              </tr>
            </thead>
            <tbody>
              {renderTable()}
            </tbody>
          </table>

          {renderChart()}
        </>
      )}
    </div>
  );
}
