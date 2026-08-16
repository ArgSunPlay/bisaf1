import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet's default icon path issues with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocationPickerProps {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
}

const LocationMarker = ({ position, onPositionChange }: MapLocationPickerProps) => {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ position, onPositionChange }) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(position);

  useEffect(() => {
    setMapCenter(position);
  }, [position]);

  const handleGetLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(newPos);
          onPositionChange(newPos);
        },
        (err) => {
          alert('خطا در دریافت موقعیت مکانی. لطفا دسترسی به GPS را بررسی کنید.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('مرورگر شما از قابلیت GPS پشتیبانی نمی‌کند.');
    }
  };

  return (
    <div className="space-y-3 relative z-10">
      <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 p-2.5 rounded-xl text-[10px] sm:text-[11px] leading-relaxed flex items-start gap-2 border border-indigo-100 dark:border-indigo-800/50">
        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>چرا به موقعیت مکانی شما نیاز داریم؟</strong><br />
          برای ثبت آدرس دقیق فروشگاه روی نقشه، نیاز به دریافت موقعیت مکانی (GPS) شما داریم. لطفاً پس از کلیک روی «مکان فعلی من»، در پیام مرورگر گزینه <strong>Allow (مجاز)</strong> را انتخاب کنید.
        </p>
      </div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          مکان فروشگاه روی نقشه
        </label>
        <button
          onClick={handleGetLocation}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-lg text-[11px] font-bold transition-colors hover:bg-blue-200 dark:hover:bg-blue-900"
        >
          <Navigation className="w-3.5 h-3.5" />
          مکان فعلی من (GPS)
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mb-2">
        برای تغییر موقعیت، روی نقشه کلیک کنید یا دست خود را نگه دارید.
      </p>
      <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-inner">
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={onPositionChange} />
        </MapContainer>
      </div>
      <div className="flex gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-400 dir-ltr text-right justify-end">
        <span>Lng: {position[1].toFixed(5)}</span>
        <span>Lat: {position[0].toFixed(5)}</span>
      </div>
    </div>
  );
};
