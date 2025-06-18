"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function AdminDashboard() {
  // סטייטים רגילים
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [submittedQuotes, setSubmittedQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [loginCounts, setLoginCounts] = useState<number[]>([]);
  const [quoteCounts, setQuoteCounts] = useState<number[]>([]);

  // --- פג'ינציה לכל טבלה ---
  // משתמשים
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 20;
  const userPageCount = Math.ceil(users.length / usersPerPage);
  const usersToShow = users.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  // עמילי מכס
  const [brokerPage, setBrokerPage] = useState(1);
  const brokersPerPage = 20;
  const brokerPageCount = Math.ceil(brokers.length / brokersPerPage);
  const brokersToShow = brokers.slice((brokerPage - 1) * brokersPerPage, brokerPage * brokersPerPage);

  // הצעות מחיר
  const [quotePage, setQuotePage] = useState(1);
  const quotesPerPage = 20;
  const quotePageCount = Math.ceil(quotes.length / quotesPerPage);
  const quotesToShow = quotes.slice((quotePage - 1) * quotesPerPage, quotePage * quotesPerPage);

  // הצעות שהוגשו
  const [submittedPage, setSubmittedPage] = useState(1);
  const submittedPerPage = 20;
  const submittedPageCount = Math.ceil(submittedQuotes.length / submittedPerPage);
  const submittedToShow = submittedQuotes.slice((submittedPage - 1) * submittedPerPage, submittedPage * submittedPerPage);

  // מחיקת משתמש
const handleDeleteUser = async (id: string) => {
  if (confirm("למחוק את המשתמש?")) {
    try {
      await axios.delete(`${BASE_URL}/api/admin/user/${id}`);
      setUsers((users) => users.filter((u) => u._id !== id));
    } catch (err) {
      alert("שגיאה במחיקת משתמש");
    }
  }
};
// אותו עיקרון ל־broker, quote, submittedQuote

// מחיקת בקשת הצעה (quote)
const handleDeleteQuote = async (id: string) => {
  if (confirm("למחוק את הבקשה?")) {
    try {
      await axios.delete(`${BASE_URL}/api/admin/quote/${id}`);
      setQuotes((quotes) => quotes.filter((q) => q._id !== id));
    } catch (err) {
      alert("שגיאה במחיקת בקשה");
    }
  }
};

// מחיקת הצעה שהוגשה (submittedQuote)
const handleDeleteSubmitted = async (id: string) => {
  if (confirm("למחוק את ההצעה שהוגשה?")) {
    try {
      await axios.delete(`${BASE_URL}/api/admin/submitted-quote/${id}`);
      setSubmittedQuotes((arr) => arr.filter((q) => q._id !== id));
    } catch (err) {
      alert("שגיאה במחיקת הצעה שהוגשה");
    }
  }
};

// מחיקת עמיל מכס
const handleDeleteBroker = async (id: string) => {
  if (confirm("למחוק את עמיל המכס?")) {
    try {
      await axios.delete(`${BASE_URL}/api/admin/broker/${id}`);
      setBrokers((brokers) => brokers.filter((b) => b._id !== id));
    } catch (err) {
      alert("שגיאה במחיקת עמיל מכס");
    }
  }
};



useEffect(() => {
  async function fetchData() {
    try {
      const dashboardRes = await axios.get(`${BASE_URL}/api/admin/dashboard-data`);
      const data: any = dashboardRes.data; // הוספת :any כאן!
      setStats(data.summary);
      setUsers(data.users);
      setBrokers(data.brokers);
      setQuotes(data.quotes);
      setSubmittedQuotes(data.submittedQuotes);
      generateChart(data.users, data.quotes);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);


  const generateChart = (users: any[], quotes: any[]) => {
    const dateMap: Record<string, { users: number; quotes: number }> = {};
    users.forEach(u => {
      if (!u.createdAt) return;
      const date = new Date(u.createdAt).toISOString().split("T")[0];
      if (!dateMap[date]) dateMap[date] = { users: 0, quotes: 0 };
      dateMap[date].users++;
    });
    quotes.forEach(q => {
      if (!q.createdAt) return;
      const date = new Date(q.createdAt).toISOString().split("T")[0];
      if (!dateMap[date]) dateMap[date] = { users: 0, quotes: 0 };
      dateMap[date].quotes++;
    });
    const sortedDates = Object.keys(dateMap).sort();
    setChartLabels(sortedDates);
    setLoginCounts(sortedDates.map(date => dateMap[date]?.users || 0));
    setQuoteCounts(sortedDates.map(date => dateMap[date]?.quotes || 0));
  };

  if (loading) return <div>טוען נתונים...</div>;

  return (
    <div className="p-6 min-h-screen bg-indigo-200">
      <h1 className="text-2xl font-bold mb-4 text-center">לוח שליטה - אדמין</h1>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow text-right">סה"כ משתמשים: {stats.totalUsers}</div>
        <div className="p-4 bg-white rounded shadow text-right">סה"כ הצעות מחיר: {stats.totalQuotes}</div>
        <div className="p-4 bg-white rounded shadow text-right">סה"כ תשלומים: ₪{stats.totalPaid}</div>
        <div className="p-4 bg-white rounded shadow text-right">סה"כ חשבוניות: ₪{stats.totalInvoiced}</div>
      </div>

      {/* גרף */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2 text-right">📈 גרף כניסות והצעות לפי תאריך</h2>
        {chartLabels.length > 0 && (
          <Chart
            type="line"
            height={300}
            series={[
              { name: "כניסות", data: loginCounts },
              { name: "הצעות מחיר", data: quoteCounts }
            ]}
            options={{
              chart: { id: "activity-chart" },
              xaxis: { categories: chartLabels },
              colors: ["#3B82F6", "#F97316"]
            }}
          />
        )}
      </div>

      {/* 5 תשלומים אחרונים */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2 text-right">5 תשלומים אחרונים</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">מזהה</th>
              <th className="p-2">סכום</th>
              <th className="p-2">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentPayments?.map((p: any) => (
              <tr key={p._id}>
                <td className="p-2">{p.paymentId}</td>
                <td className="p-2">₪{p.amountPaid}</td>
                <td className="p-2">{new Date(p.paidAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* טבלת משתמשים */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-2 text-right">משתמשים רשומים</h2>
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">שם</th>
                <th className="p-2 border">אימייל</th>
                <th className="p-2 border">טלפון</th>
                <th className="p-2 border">עסק</th>
                <th className="p-2 border">קוד</th>
                <th className="p-2 border">תפקיד</th>
                <th className="p-2 border">תאריך הרשמה</th>
                 <th className="p-2 border">מחיקה</th>
              </tr>
            </thead>
            <tbody>
              {usersToShow.map((user) => (
                <tr key={user._id}>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.phone}</td>
                  <td className="p-2 border">{user.business}</td>
                  <td className="p-2 border">{user.code}</td>
                  <td className="p-2 border">{user.role}</td>
                  <td className="p-2 border">{new Date(user.createdAt).toLocaleDateString()}</td>
                   <td className="p-2 border text-center">
        <button
          onClick={() => handleDeleteUser(user._id)}
          className="text-red-600 hover:underline"
          title="מחק משתמש"
        >🗑</button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
        {/* כפתורי פג'ינציה */}
        <div className="flex justify-center items-center mt-2 gap-2">
          <button
            onClick={() => setUserPage((p) => Math.max(1, p - 1))}
            disabled={userPage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >קודם</button>
          <span>עמוד {userPage} מתוך {userPageCount}</span>
          <button
            onClick={() => setUserPage((p) => Math.min(userPageCount, p + 1))}
            disabled={userPage === userPageCount}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >הבא</button>
        </div>
      </div>

      {/* טבלת עמילי מכס */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-2 text-right">עמילי מכס</h2>
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm border">
           <thead className="bg-gray-100">
  <tr>
    <th className="p-2 border">שם</th>
    <th className="p-2 border">אימייל</th>
    <th className="p-2 border">טלפון</th>
    <th className="p-2 border">חברה</th>
    <th className="p-2 border">קוד</th>
    <th className="p-2 border">תאריך הרשמה</th>
    <th className="p-2 border">מחיקה</th>
  </tr>
</thead>
<tbody>
  {brokersToShow.map((broker) => (
    <tr key={broker._id}>
      <td className="p-2 border">{broker.name}</td>
      <td className="p-2 border">{broker.email}</td>
      <td className="p-2 border">{broker.phone}</td>
      <td className="p-2 border">{broker.company}</td>
      <td className="p-2 border">{broker.code}</td>
      <td className="p-2 border">{new Date(broker.createdAt).toLocaleDateString()}</td>
      <td className="p-2 border text-center">
        <button
          onClick={() => handleDeleteBroker(broker._id)}
          className="text-red-600 hover:underline"
          title="מחק עמיל מכס"
        >🗑</button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
        <div className="flex justify-center items-center mt-2 gap-2">
          <button
            onClick={() => setBrokerPage((p) => Math.max(1, p - 1))}
            disabled={brokerPage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >קודם</button>
          <span>עמוד {brokerPage} מתוך {brokerPageCount}</span>
          <button
            onClick={() => setBrokerPage((p) => Math.min(brokerPageCount, p + 1))}
            disabled={brokerPage === brokerPageCount}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >הבא</button>
        </div>
      </div>

      {/* טבלת quotes */}
      <div className="bg-white p-4 rounded shadow mt-8">
        <h2 className="text-xl font-semibold mb-2 text-right">כל הבקשות להצעת מחיר (Quotes)</h2>
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">מספר הצעה</th>
                <th className="p-2 border">שם מוצר</th>
                <th className="p-2 border">לקוח</th>
                <th className="p-2 border">סטטוס</th>
                <th className="p-2 border">תאריך</th>
               <th className="p-2 border">מחיקה</th>
  </tr>
</thead>
<tbody>
              {quotesToShow.map((q, i) => (
                <tr key={q._id || i}>
                  <td className="p-2 border">{q.quoteId}</td>
                  <td className="p-2 border">{q.productName}</td>
                  <td className="p-2 border">{q.clientName || q.clientId}</td>
                  <td className="p-2 border">{q.status}</td>
                  <td className="p-2 border">{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ""}</td>
                <td className="p-2 border text-center">
        <button
          onClick={() => handleDeleteQuote(q._id)}
          className="text-red-600 hover:underline"
          title="מחק בקשה"
        >🗑</button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
        <div className="flex justify-center items-center mt-2 gap-2">
          <button
            onClick={() => setQuotePage((p) => Math.max(1, p - 1))}
            disabled={quotePage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >קודם</button>
          <span>עמוד {quotePage} מתוך {quotePageCount}</span>
          <button
            onClick={() => setQuotePage((p) => Math.min(quotePageCount, p + 1))}
            disabled={quotePage === quotePageCount}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >הבא</button>
        </div>
      </div>

      {/* טבלת submitted-quotes */}
    <div className="bg-white p-4 rounded shadow mt-8">
  <h2 className="text-xl font-semibold mb-2 text-right">כל ההצעות שהוגשו (Submitted Quotes)</h2>
  <div className="overflow-x-auto max-h-[350px]">
    <table className="w-full text-sm border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">מספר הצעה</th>
          <th className="p-2 border">שם מוצר</th>
          <th className="p-2 border">עמיל מכס</th>
          <th className="p-2 border">סה"כ ב ש"ח</th>
          <th className="p-2 border">$  סה"כ  ב </th>
          <th className="p-2 border">תאריך</th>
           <th className="p-2 border">מחיקה</th>
        </tr>
      </thead>
      <tbody>
        {submittedToShow.map((q, i) => (
          <tr key={q._id || i}>
            <td className="p-2 border">{q.quoteId}</td>
            <td className="p-2 border">{q.productName}</td>
            <td className="p-2 border">{q.brokerName || q.brokerCode}</td>
            <td className="p-2 border">{q.totalShekel ?? ''}</td>
            <td className="p-2 border">{q.totalDollar ?? ''}</td>
            <td className="p-2 border">{q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : ""}</td>
           <td className="p-2 border text-center">
        <button
          onClick={() => handleDeleteSubmitted(q._id)}
          className="text-red-600 hover:underline"
          title="מחק הצעה שהוגשה"
        >🗑</button>
      </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
        <div className="flex justify-center items-center mt-2 gap-2">
          <button
            onClick={() => setSubmittedPage((p) => Math.max(1, p - 1))}
            disabled={submittedPage === 1}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >קודם</button>
          <span>עמוד {submittedPage} מתוך {submittedPageCount}</span>
          <button
            onClick={() => setSubmittedPage((p) => Math.min(submittedPageCount, p + 1))}
            disabled={submittedPage === submittedPageCount}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
          >הבא</button>
        </div>
      </div>
    </div>
  );
}
