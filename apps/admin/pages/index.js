import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LinkInputPage() {
  const [link, setLink] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem('productLink', link);
    router.push('/product');
  };

  const goNext = () => {
    sessionStorage.setItem('productLink', link);
    router.push('/product');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-t from-[#6c9fcf] via-white via-[75%] to-white relative">
      <Head>
        <title>Sendy | Shipping Quote</title>
      </Head>

      {/* חץ ← בצד שמאל למעלה */}
      <div
        className="absolute top-6 left-6 text-5xl text-blue-700 cursor-pointer"
        onClick={goNext}
        title="Continue to product screen"
      >
        ←
      </div>

      {/* לוגו */}
      <img
        src="/sendy-logo.png"
        alt="Sendy Logo"
        className="w-48 h-48 object-contain absolute top-10"
      />

      {/* תוכן מרכזי */}
      <div className="w-full max-w-sm flex flex-col items-center mt-48">
        <h1 className="text-2xl font-bold text-center text-black mb-2">Get a Shipping Quote</h1>
        <p className="text-center text-gray-600 mb-6">Enter the product link</p>

        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="url"
            className="w-full border border-gray-300 rounded-2xl px-4 py-4 mb-6 text-base bg-white shadow-md text-center text-lg"
            placeholder="https://example.com/product"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-white font-bold text-lg transition shadow-md bg-blue-600 hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
