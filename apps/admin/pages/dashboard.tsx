"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4135";


const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [loginCounts, setLoginCounts] = useState<number[]>([]);
  const [quoteCounts, setQuoteCounts] = useState<number[]>([]);

  const handleDelete = async (id: string) => {
    if (confirm("למחוק את המשתמש?")) {
      try {
        await axios.delete(`${BASE_URL}/api/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
      } catch (err) {
        alert("שגיאה במחיקה");
      }
    }
  };

  const handleDeleteBroker = async (id: string) => {
    if (confirm("למחוק את עמיל המכס?")) {
      try {
        await axios.delete(`${BASE_URL}/api/customs-brokers/${id}`);
        setBrokers(brokers.filter((b) => b._id !== id));
      } catch (err) {
        alert("שגיאה במחיקת עמיל מכס");
      }
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, usersRes, brokersRes, quotesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/summary`),
          axios.get(`${BASE_URL}/api/users/all`),
          axios.get(`${BASE_URL}/api/customs-brokers/all`),
          axios.get(`${BASE_URL}/api/quotes`)
        ]);
        setStats(summaryRes.data);
        setUsers(usersRes.data as any[])
      setBrokers(brokersRes.data as any[]);
setQuotes(quotesRes.data as any[]);
generateChart(usersRes.data as any[], quotesRes.data as any[]);

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
              <tr key={p._id} className="border-b">
                <td className="p-2">{p.paymentId}</td>
                <td className="p-2">₪{p.amountPaid}</td>
                <td className="p-2">{new Date(p.paidAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-right">משתמשים רשומים</h2>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">שם</th>
                <th className="p-2 border">אימייל</th>
                <th className="p-2 border">טלפון</th>
                <th className="p-2 border">תפקיד</th>
                <th className="p-2 border">תאריך הרשמה</th>
                <th className="p-2 border">מחיקה</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.phone}</td>
                  <td className="p-2 border">{user.role}</td>
                  <td className="p-2 border">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 border text-center">
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:underline">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2 text-right">עמילי מכס</h2>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">שם</th>
                <th className="p-2 border">אימייל</th>
                <th className="p-2 border">טלפון</th>
                <th className="p-2 border">אזור פעילות</th>
                <th className="p-2 border">מחיקה</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((broker) => (
                <tr key={broker._id} className="border-t">
                  <td className="p-2 border">{broker.name}</td>
                  <td className="p-2 border">{broker.email}</td>
                  <td className="p-2 border">{broker.phone}</td>
                  <td className="p-2 border">{broker.region}</td>
                  <td className="p-2 border text-center">
                    <button onClick={() => handleDeleteBroker(broker._id)} className="text-red-600 hover:underline">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
