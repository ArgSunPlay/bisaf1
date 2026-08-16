import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Radio, Music, Volume2, VolumeX, RadioTower, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { RadioStation } from '../types';

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'r-1',
    name: 'رادیو آوا (موسیقی سنتی و ترانه‌های اصیل)',
    stream_url: 'https://live.irib.ir/radio-ava/icecast.audio',
    genre: 'موسیقی و ترانه',
    is_active: true
  },
  {
    id: 'r-2',
    name: 'رادیو پیام (موسیقی آرامش‌بخش و اخبار)',
    stream_url: 'https://live.irib.ir/radio-payam/icecast.audio',
    genre: 'عمومی و آرامش',
    is_active: true
  },
  {
    id: 'r-3',
    name: 'رادیو جوان (ترانه‌های شاد و پرانرژی)',
    stream_url: 'https://live.irib.ir/radio-javan/icecast.audio',
    genre: 'پاپ و جوان',
    is_active: true
  },
  {
    id: 'r-4',
    name: 'رادیو فردا (موزیک روز و گفتگوهای فارسی)',
    stream_url: 'https://stream.radiojar.com/4wqbshg2n3quv',
    genre: 'پاپ و ترانه',
    is_active: true
  },
  {
    id: 'r-5',
    name: 'رادیو فرهنگ (شعر، ادب و هنر فاخر پارسی)',
    stream_url: 'https://live.irib.ir/radio-farhang/icecast.audio',
    genre: 'ادبی و فرهنگی',
    is_active: true
  },
  {
    id: 'r-6',
    name: 'رادیو نمایش (داستان و نمایش‌های صوتی جذاب)',
    stream_url: 'https://live.irib.ir/radio-namayesh/icecast.audio',
    genre: 'داستان و نمایش',
    is_active: true
  },
  {
    id: 'r-7',
    name: 'رادیو ورزش (گزارش‌های زنده و موزیک پرهیجان)',
    stream_url: 'https://live.irib.ir/radio-varzesh/icecast.audio',
    genre: 'ورزش و هیجان',
    is_active: true
  },
  {
    id: 'r-8',
    name: 'رادیو سنتی گلها (گنجینه موسیقی اصیل ایرانی)',
    stream_url: 'https://stream.zeno.fm/f3wvbbqydg8uv',
    genre: 'اصیل و سنتی',
    is_active: true
  },
  {
    id: 'r-9',
    name: 'رادیو پاپ فارسی (موزیک مدرن ایرانی)',
    stream_url: 'https://stream.zeno.fm/0r0xa792kwzuv',
    genre: 'موزیک روز',
    is_active: true
  },
  {
    id: 'r-10',
    name: 'رادیو تهران / گفتگو (مجله صوتی و موسیقی شهری)',
    stream_url: 'https://live.irib.ir/radio-tehran/icecast.audio',
    genre: 'گفتگو و موسیقی',
    is_active: true
  }
];

interface AudioRadioPlayerProps {
  compact?: boolean;
  className?: string;
}

export const AudioRadioPlayer: React.FC<AudioRadioPlayerProps> = ({ compact = false, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation>(RADIO_STATIONS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(85);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    setAudioError(null);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(e => {
          console.warn('Audio play error:', e);
          setIsPlaying(false);
          setIsLoading(false);
          setAudioError('خطا در بارگذاری استریم صوتی؛ لطفاً کانال دیگری را انتخاب کنید.');
        });
    }
  };

  const handleStationChange = (station: RadioStation) => {
    setCurrentStation(station);
    setAudioError(null);
    setIsPlaying(false);
    setIsLoading(true);

    if (audioRef.current) {
      audioRef.current.src = station.stream_url;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(e => {
          console.warn('Station play error:', e);
          setIsPlaying(false);
          setIsLoading(false);
          setAudioError('عدم دسترسی موقت به این فرکانس صوتی');
        });
    }
  };

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-800/80 relative overflow-hidden ${className}`}>
      <audio 
        ref={audioRef} 
        src={currentStation.stream_url} 
        muted={isMuted}
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
      />

      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Bar */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
            isPlaying ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105' : 'bg-slate-800 text-amber-400'
          }`}>
            <Radio className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white truncate">رادیو اینترنتی بی‌صف</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">
                ۱۰ کانال فارسی
              </span>
            </div>
            <p className="text-[11px] text-amber-400 font-bold truncate mt-0.5">
              {currentStation.name}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sound wave animated equalizer */}
          {isPlaying && (
            <div className="hidden sm:flex items-end gap-0.5 h-5 px-2 bg-slate-800/80 rounded-lg">
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-4" style={{ animationDelay: '450ms' }} />
            </div>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="قطع/وصل صدا"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>توقف</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>پخش زنده</span>
              </>
            )}
          </button>
        </div>
      </div>

      {audioError && (
        <p className="text-[11px] font-bold text-rose-400 bg-rose-950/40 p-2 rounded-xl border border-rose-800/40 text-center mt-2 animate-fade-in">
          {audioError}
        </p>
      )}

      {/* Station Pills Carousel / Selector */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400">
            انتخاب ایستگاه و شبکه رادیویی فارسی:
          </span>
          <span className="text-[10px] text-amber-400 font-bold">
            {currentStation.genre}
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {RADIO_STATIONS.map((station, index) => {
            const isCurrent = currentStation.id === station.id;
            return (
              <button
                key={station.id}
                onClick={() => handleStationChange(station)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-100'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-slate-950' : 'bg-amber-400'}`} />
                <span>{station.name.split(' ')[0]} {station.name.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
