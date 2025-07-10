'use client';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative pb-20">
      <Head>
        <title>הוזילו את עלויות היבוא שלכם | Share A Container</title>
        <meta name="description" content="השוו הצעות מחיר לשילוח ועמילות מכס בלחיצת כפתור – חסכו זמן וכסף בעזרת מערכת השוואת הצעות ייחודית." />
      </Head>

      {/* לוגו */}
      <img src="/logo-sharecontainer-black.png" alt="Logo" className="w-[280px] h-[280px] object-contain mt-4" />

{/* כותרות שיווקיות בחלק העליון */}
{/* כותרות שיווקיות בולטות בראש הדף */}
{/* כותרות מונפשות בגדלים וצבעים שונים */}
<style jsx>{`
  @keyframes pulse1 {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.08); opacity: 0.85; }
  }
  @keyframes pulse2 {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
  }
  @keyframes pulse3 {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.12); opacity: 0.8; }
  }

  .pulse-blue {
    animation: pulse1 2.5s ease-in-out infinite;
    color: #055cb3;
  }
  .pulse-green {
    animation: pulse2 3.5s ease-in-out infinite;
    color: #04983c;
  }
  .pulse-orange {
    animation: pulse3 4.5s ease-in-out infinite;
    color: #f59836;
  }
`}</style>

<div className="w-full max-w-3xl px-6 text-center mt-6 space-y-6">
  <h2 className="text-3xl font-bold pulse-blue">
     מייבאים מוצרים לעסק או באופן פרטי?
  </h2>
  <h2 className="text-3xl font-bold pulse-green">
    לא בטוחים שמחיר השילוח שקיבלתם הוגן?
  </h2>
  <h2 className="text-3xl font-bold pulse-orange">
    מרגישים שאתם משלמים "סתם" בלי לדעת למה?
  </h2>
</div>



      <div className="w-full max-w-2xl text-right px-6 mt-2 space-y-5 text-black">
<div className="w-full text-center mt-16">
  <div
    onClick={() => router.push('/')}
    className="inline-block bg-[#5a078c] py-2 px-4 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
  >
    <h1 className="text-2xl font-bold text-[#f59836] text-center">
      הוזילו את עלויות היבוא שלכם
    </h1>
  </div>
</div>





     <p className="text-lg leading-7 mb-1">
  השוו הצעות מחיר לשילוח, טיפול במכסים, ביטוח והתנהלות מול מכון התקנים – בלחיצת כפתור!
</p>
<p className="text-lg font-bold text-bkack mt-1 text-right">
  יותר שליטה, יותר שקיפות, פחות עלויות.
</p>


        <p>קבלו עד 5 הצעות מחיר מעמילי מכס אמינים – במהירות וללא עלות!</p>


        <h2 className="text-xl font-semibold mt-6">עם Share a Container אתם מקבלים:</h2>
        <ul className="list-disc mr-5 space-y-1">
          <li>עד 5 הצעות מחיר מספקים מאומתים – במקום אחד.</li>
          <li>פירוט מלא ושקוף של כל העלויות: שילוח, עמילות, מכון התקנים, ביטוח והובלה.</li>
          <li>השוואה מהירה וחיסכון מיידי של עד מאות ₪ בכל משלוח.</li>
          <li>בלי שיחות, בלי מיילים מיותרים ובלי מחויבות.</li>
        </ul>


<div className="mt-6 text-right">
  <h2 className="text-xl font-semibold mb-1">איך זה עובד?</h2>
  <ol className="list-decimal mr-5 space-y-1 text-right">
          <li>נרשמים לאפליקציה – בחינם.</li>
          <li>ממלאים פרטי משלוח בסיסיים.</li>
          <li>מקבלים הצעות מחיר מותאמות.</li>
          <li>בוחרים את ההצעה שהכי מתאימה לכם.</li>
        </ol>
</div>

  <div className="mt-6 text-right">
  <h2 className="text-xl font-semibold mb-1">למה כדאי להצטרף?</h2>
  <ul className="list-disc mr-5 space-y-1 text-right">
          <li>שקיפות מלאה – בלי אותיות קטנות.</li>
          <li>שליטה בהוצאות – אתם מחליטים.</li>
          <li>זמינות דיגיטלית – מכל מכשיר.</li>
          <li>עמילי מכס מאומתים בלבד.</li>
        </ul>
      </div>

      </div>

      <button
  onClick={() => router.push('/')}
  className="fixed bottom-20 center py-2 px-5 rounded-lg text-white font-bold text-base bg-blue-600 hover:bg-blue-700 shadow-xl z-50"
>
  פה מתחילים
</button>

      {/* פוטר */}
      <footer className="fixed bottom-0 left-0 w-full py-3 bg-black text-center text-sm text-white z-50 shadow-md">
        כל הזכויות שמורות ל־<span className="text-orange-500 font-semibold">Share A Container</span>
        <div className="absolute left-4 top-3 text-purple-400 text-sm">D&A code design ©</div>
      </footer>
    </div>
  );
}
