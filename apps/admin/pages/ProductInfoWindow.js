import { useEffect, useRef, useState } from 'react';

export default function ProductInfoWindow({ data, link, onRetry }) {
  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 80, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('loading');
  const [currentLink, setCurrentLink] = useState(link || '');
  const offsetRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const handleMouseDown = (e) => {
    setDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  useEffect(() => {
    const requiredFields = ['name', 'manufacturer', 'weight', 'dimensions', 'cbm', 'origin'];
    if (!data || requiredFields.every(key => !data[key] || data[key] === 'N/A' || data[key].trim?.() === '')) {
      setStatus('error');
    } else if (requiredFields.every(key => data[key] && data[key] !== 'N/A' && data[key].trim?.() !== '')) {
      setStatus('success');
    } else {
      setStatus('partial');
    }
  }, [data]);

  const handleRetryClick = () => {
    if (currentLink && typeof onRetry === 'function') {
      setStatus('loading');
      onRetry(currentLink);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={windowRef}
      className={`fixed z-50 w-[300px] ${minimized ? 'h-[40px]' : 'auto'} bg-white rounded-xl shadow-xl border text-right`}
      style={{ top: position.y, left: position.x, transition: 'all 0.2s ease-in-out' }}
    >
      <div
        className="bg-blue-600 text-white flex items-center justify-between px-4 py-2 rounded-t-xl cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="font-bold">פרטי המוצר</span>
          <span
            className={`w-3 h-3 rounded-full ${
              status === 'loading'
                ? 'bg-orange-400 animate-ping'
                : status === 'success'
                ? 'bg-green-500'
                : status === 'partial'
                ? 'bg-purple-500'
                : 'bg-red-500'
            }`}
          />
        </div>
        <div className="space-x-2 space-x-reverse">
          <button onClick={() => setMinimized(!minimized)} className="hover:text-gray-200">−</button>
          <button onClick={() => setVisible(false)} className="hover:text-gray-200">✕</button>
        </div>
      </div>

      {!minimized && (
        <div className="p-4 space-y-2">
          <Detail label="Name" value={data.name} />
          <Detail label="Manufacturer" value={data.manufacturer} />
          <Detail label="Weight" value={data.weight} />
          <Detail label="Dimensions" value={data.dimensions} />
          <Detail label="CBM" value={data.cbm} />
          <Detail label="Shipping Origin" value={data.origin} />

          <div className="mt-4 border-t pt-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">קישור מוצר:</p>
            <input
              type="url"
              value={currentLink}
              onChange={(e) => setCurrentLink(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1 mb-2"
              placeholder="https://example.com/product"
            />

            <button
              onClick={handleRetryClick}
              className="w-full bg-orange-100 border border-orange-400 text-sm text-black rounded-lg py-1 hover:bg-orange-200"
            >
              נסה שנית
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      <p className="text-base text-gray-900">{value}</p>
    </div>
  );
}