import React, { useState, useEffect } from 'react';
import { Search, PlayCircle, Star, ChevronLeft, Tv, Heart, Play, Github, MessageCircle, Send, Clock, Menu, X, SkipForward, Sparkles } from 'lucide-react';

// ============================================================================
// MOCK DATA (Fallback jika API Vercel tidak bisa diakses di lingkungan Preview)
// ============================================================================
const MOCK_SEARCH = [
  { book_id: '1', title: 'CEO\'s Sweetest Love', cover: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=600', author: 'Lin Xi', tags: ['Romance', 'Drama'] },
  { book_id: '2', title: 'Falling Into Your Smile', cover: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&q=80&w=600', author: 'Qing Mei', tags: ['E-Sports', 'Romance'] },
  { book_id: '3', title: 'Hidden Love', cover: 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?auto=format&fit=crop&q=80&w=600', author: 'Zhu Yi', tags: ['Youth', 'Sweet'] },
  { book_id: '4', title: 'My Boss is Cute', cover: 'https://images.unsplash.com/photo-1516589178581-6cd7853d4f4f?auto=format&fit=crop&q=80&w=600', author: 'Tang Tang', tags: ['Comedy', 'Romance'] },
];

const MOCK_DETAIL = {
  title: 'CEO\'s Sweetest Love',
  intro: 'Sebuah kisah manis antara CEO dingin dan asistennya yang ceroboh namun sangat imut. Mampukah mereka melewati segala rintangan cinta bersama?',
  cover: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=600',
  tags: ['Romance', 'Comedy', 'Office'],
  episodes: Array.from({length: 12}, (_, i) => ({ video_id: `vid_${i+1}`, episode: i+1, title: `Episode ${i+1}` }))
};

// ============================================================================
// FUNGSI HELPER: Mendapatkan Cover yang Valid
// ============================================================================
const getValidCover = (data) => {
  if (!data) return 'https://via.placeholder.com/300x400/fdf2f8/ec4899?text=Drama+Imut+🍑';
  // Ambil dari berbagai kemungkinan properti API
  let rawCover = data.cover || data.thumb_url || data.cover_url || data.pic_url || '';
  if (Array.isArray(rawCover)) rawCover = rawCover[0];
  
  if (typeof rawCover === 'string' && rawCover.trim() !== '') {
    // Ganti .heic ke .png
    return rawCover.replace(/\.heic/gi, '.png');
  }
  return 'https://via.placeholder.com/300x400/fdf2f8/ec4899?text=Drama+Imut+🍑';
};

// ============================================================================
// KOMPONEN: Header
// ============================================================================
const Header = ({ onSearch, goHome, goHistory }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(query.trim()) onSearch(query);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100 shadow-sm transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div 
          onClick={goHome}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="bg-gradient-to-br from-pink-400 to-pink-500 text-white p-2 rounded-2xl shadow-md shadow-pink-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Tv size={24} className="group-hover:animate-pulse" />
          </div>
          <h1 className="text-xl font-extrabold text-pink-600 hidden sm:block tracking-tight">
            BaoBao<span className="text-pink-400">Drama</span> <span className="inline-block group-hover:animate-bounce">🍑</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 flex-1 justify-end max-w-md">
          <form onSubmit={handleSubmit} className="flex-1 group">
            <div className="relative overflow-hidden rounded-full p-[2px] transition-all duration-300 focus-within:bg-gradient-to-r focus-within:from-pink-300 focus-within:to-pink-500">
              <input 
                type="text" 
                placeholder="Cari drama imut..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-pink-50/80 text-pink-900 placeholder-pink-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:bg-white transition-all border border-pink-100"
              />
              <button type="submit" className="absolute right-4 top-2.5 text-pink-400 hover:text-pink-600 hover:scale-125 transition-transform duration-300">
                <Search size={18} />
              </button>
            </div>
          </form>

          <button 
            onClick={goHistory} 
            className="p-2.5 bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-pink-200 hover:-translate-y-1 shrink-0"
            title="Riwayat Tontonan"
          >
            <Clock size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// KOMPONEN: Drama Card
// ============================================================================
const DramaCard = ({ drama, onClick }) => {
  const finalCover = getValidCover(drama);

  return (
    <div 
      onClick={() => onClick(drama.book_id)}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-pink-200/60 transition-all duration-500 cursor-pointer group hover:-translate-y-2 border border-pink-50 flex flex-col h-full"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-3xl">
        <img 
          src={finalCover} 
          alt={drama.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400/fdf2f8/ec4899?text=Drama+Imut+🍑' }}
        />
        
        {/* Love Overlay Animation */}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <PlayCircle size={48} className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 drop-shadow-lg" />
        </div>

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm text-pink-500 group-hover:animate-pulse">
          <Heart size={16} className="fill-pink-100" />
        </div>
        
        {drama.lastEpisodeWatched && (
          <div className="absolute bottom-2 left-2 bg-pink-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-md flex items-center gap-1">
             <Play size={12} className="fill-white"/> Eps {drama.lastEpisodeWatched}
          </div>
        )}
      </div>
      
      <div className="p-3.5 flex flex-col flex-grow justify-between bg-gradient-to-b from-white to-pink-50/30">
        <div>
          <h3 className="font-bold text-gray-800 truncate text-sm sm:text-base group-hover:text-pink-600 transition-colors">{drama.title}</h3>
          <div className="flex flex-wrap gap-1 mt-1.5 overflow-hidden h-[20px]">
            {drama.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] sm:text-[11px] font-medium bg-pink-100/80 text-pink-600 px-2 rounded-full whitespace-nowrap border border-pink-200/50">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {drama.watchedAt && (
          <p className="text-[10px] text-pink-400 mt-2 truncate flex items-center gap-1 font-medium">
            <Clock size={10} /> {new Date(drama.watchedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// KOMPONEN: Footer
// ============================================================================
const Footer = () => (
  <footer className="mt-auto bg-gradient-to-b from-pink-50 to-pink-100/80 pt-10 pb-6 border-t border-pink-200 text-center relative overflow-hidden">
    <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-5 relative z-10">
      <div className="max-w-md">
        <h4 className="font-bold text-pink-600 mb-2 flex items-center justify-center gap-2 text-lg">
          <Sparkles className="text-yellow-400 animate-pulse" size={20} /> Tentang BaoBaoDrama
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed font-medium">
          Tempat streaming Drama China terimut. Nonton drama favoritmu dengan mudah, gratis, dan nyaman di sini! 🌸
        </p>
      </div>

      <div className="flex gap-4 mt-2">
        <a href="#" className="p-3 bg-white rounded-full text-gray-800 hover:text-white hover:bg-gray-800 hover:scale-110 hover:-translate-y-1 transition-all shadow-md group">
          <Github size={20} className="group-hover:animate-bounce" />
        </a>
        <a href="#" className="p-3 bg-white rounded-full text-green-500 hover:text-white hover:bg-green-500 hover:scale-110 hover:-translate-y-1 transition-all shadow-md group">
          <MessageCircle size={20} className="group-hover:animate-bounce" />
        </a>
        <a href="#" className="p-3 bg-white rounded-full text-blue-500 hover:text-white hover:bg-blue-500 hover:scale-110 hover:-translate-y-1 transition-all shadow-md group">
          <Send size={20} className="ml-0.5 group-hover:animate-bounce" />
        </a>
      </div>

      <div className="mt-4 px-5 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-pink-200 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-xs font-bold text-pink-500 tracking-wide">
          Ranzz © 2026 - Developed with <span className="text-red-500 animate-pulse inline-block text-sm">❤️</span>
        </p>
      </div>
    </div>
  </footer>
);

// ============================================================================
// APP UTAMA
// ============================================================================
export default function App() {
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [homeDramas, setHomeDramas] = useState([]);
  const [searchDramas, setSearchDramas] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [isEpisodeMenuOpen, setIsEpisodeMenuOpen] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('baobao_history');
    if (savedHistory) {
        try { setWatchHistory(JSON.parse(savedHistory)); } catch (e) {}
    }
    fetchHome();
  }, []);

  const saveToHistory = (drama, episode) => {
      setWatchHistory(prevHistory => {
          const newHistory = [...prevHistory];
          const existingIndex = newHistory.findIndex(h => h.book_id === drama.book_id);
          const historyEntry = {
              book_id: drama.book_id,
              title: drama.title,
              cover: drama.cover,
              tags: drama.tags,
              lastEpisodeWatched: episode.episode,
              watchedAt: new Date().toISOString()
          };

          if (existingIndex >= 0) newHistory.splice(existingIndex, 1);
          newHistory.unshift(historyEntry);
          
          const limitedHistory = newHistory.slice(0, 12);
          localStorage.setItem('baobao_history', JSON.stringify(limitedHistory));
          return limitedHistory;
      });
  };

  const fetchHome = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy?action=search&query=romance&limit=12`);
      const data = await res.json();
      setHomeDramas(data);
    } catch (e) {
      setHomeDramas(MOCK_SEARCH);
    }
    setLoading(false);
  };

  const fetchSearch = async (query) => {
    setLoading(true);
    setView('search');
    setSearchQuery(query);
    try {
      const res = await fetch(`/api/proxy?action=search&query=${query}`);
      const data = await res.json();
      setSearchDramas(data);
    } catch (e) {
      setSearchDramas(MOCK_SEARCH);
    }
    setLoading(false);
  };

  const fetchDetail = async (bookId) => {
    setLoading(true);
    setView('detail');
    try {
      const res = await fetch(`/api/proxy?action=detail&bookId=${bookId}`);
      const data = await res.json();
      setSelectedDrama(data);
    } catch (e) {
      const fromHistory = watchHistory.find(h => h.book_id === bookId);
      setSelectedDrama(fromHistory ? {...MOCK_DETAIL, ...fromHistory} : MOCK_DETAIL);
    }
    setLoading(false);
  };

  const fetchStream = async (episode) => {
    setLoading(true);
    setCurrentEpisode(episode);
    setIsEpisodeMenuOpen(false);
    setView('player');
    
    if(selectedDrama) saveToHistory(selectedDrama, episode);

    try {
      const res = await fetch(`/api/proxy?action=stream&videoId=${episode.video_id}`);
      const data = await res.json();
      setStreamUrl(data.downloads?.length > 0 ? data.downloads[0].url : data.url);
    } catch (e) {
      setStreamUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
    }
    setLoading(false);
  };

  const handleVideoEnded = () => {
      if (!selectedDrama || !currentEpisode) return;
      const currentIndex = selectedDrama.episodes.findIndex(e => e.video_id === currentEpisode.video_id);
      if (currentIndex !== -1 && currentIndex + 1 < selectedDrama.episodes.length) {
          fetchStream(selectedDrama.episodes[currentIndex + 1]);
      }
  };

  const hasNextEpisode = selectedDrama && currentEpisode && 
        selectedDrama.episodes.findIndex(e => e.video_id === currentEpisode.video_id) + 1 < selectedDrama.episodes.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 font-sans selection:bg-pink-200 selection:text-pink-900">
      <Header onSearch={fetchSearch} goHome={() => { setView('home'); setSearchQuery(''); fetchHome(); }} goHistory={() => setView('history')} />

      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-grow pb-16">
        
        {/* LOADING ANIMATION CUTE */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-32 transition-all duration-300">
            <div className="relative">
              <div className="text-6xl animate-bounce relative z-10 drop-shadow-md">🍑</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-2 bg-pink-200 rounded-full blur-sm animate-pulse"></div>
            </div>
            <div className="mt-6 text-pink-500 font-bold text-lg tracking-widest flex gap-1">
              Memuat <span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span><span className="animate-bounce delay-300">.</span>
            </div>
          </div>
        )}

        {/* VIEW: HOME */}
        {!loading && view === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-pink-400 via-pink-500 to-rose-400 rounded-[2rem] p-8 sm:p-12 text-white mb-10 shadow-xl shadow-pink-200/50 relative overflow-hidden flex flex-col justify-center min-h-[240px] group">
              <div className="relative z-10 max-w-lg">
                <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 drop-shadow-md">Halo Manis! <span className="inline-block origin-bottom-right group-hover:animate-bounce">👋</span></h2>
                <p className="text-pink-50 text-sm sm:text-base mb-6 leading-relaxed font-medium drop-shadow-sm">
                  Kumpulan drama China paling romantis & gemesin ada di sini. Ambil selimutmu dan mari mulai maraton!
                </p>
                <button onClick={() => fetchSearch('ceo')} className="bg-white text-pink-500 px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-500/30 hover:scale-105 hover:-translate-y-1 hover:bg-pink-50 transition-all duration-300 w-max flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-400" /> Sedang Tren
                </button>
              </div>
              <Heart size={180} className="absolute -right-12 -bottom-12 text-pink-300/30 transform -rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" />
              <Star size={100} className="absolute right-40 top-4 text-yellow-200/40 transform rotate-12 group-hover:animate-pulse" />
            </div>

            {/* Riwayat */}
            {watchHistory.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-xl font-extrabold text-gray-800 mb-5 flex items-center gap-2">
                        <Clock className="text-pink-500 p-1 bg-pink-100 rounded-lg" size={28} />
                        Lanjutkan Menonton
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {watchHistory.slice(0,4).map((drama) => (
                            <DramaCard key={`history-${drama.book_id}`} drama={drama} onClick={fetchDetail} />
                        ))}
                    </div>
                </div>
            )}

            {/* Rekomendasi */}
            <h2 className="text-xl font-extrabold text-gray-800 mb-5 flex items-center gap-2">
              <Heart className="text-pink-500 fill-pink-500 p-1 bg-pink-100 rounded-lg" size={28} />
              Spesial Untukmu
            </h2>
            {homeDramas.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {homeDramas.map((drama) => (
                  <DramaCard key={drama.book_id} drama={drama} onClick={fetchDetail} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-10 font-medium">Belum ada rekomendasi nih.</p>
            )}
          </div>
        )}

        {/* VIEW: SEARCH */}
        {!loading && view === 'search' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 mb-6 flex items-center gap-3">
              <div className="bg-pink-100 p-2 rounded-xl text-pink-500"><Search size={24} /></div>
              <div>
                <h2 className="text-sm text-gray-500 font-medium">Hasil Pencarian untuk:</h2>
                <p className="text-xl font-bold text-gray-800">"{searchQuery}"</p>
              </div>
            </div>
            
            {searchDramas.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {searchDramas.map((drama) => (
                  <DramaCard key={drama.book_id} drama={drama} onClick={fetchDetail} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center bg-white rounded-3xl shadow-sm border border-pink-50">
                <div className="text-7xl mb-4 animate-bounce">🥺</div>
                <p className="text-gray-500 font-bold text-lg">Waduh, drama tidak ditemukan!</p>
                <p className="text-pink-400 font-medium mt-2">Coba cari dengan kata kunci lain ya sayang~</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW: HISTORY FULL */}
        {!loading && view === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
              <div className="bg-pink-500 text-white p-2 rounded-xl shadow-lg shadow-pink-200"><Clock size={24} /></div>
              Riwayat Tontonan Kamu
            </h2>
            
            {watchHistory.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {watchHistory.map((drama) => (
                  <DramaCard key={`full-history-${drama.book_id}`} drama={drama} onClick={fetchDetail} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center bg-white rounded-3xl shadow-sm border border-pink-50">
                <Clock size={80} className="text-pink-200 mb-6 drop-shadow-sm" />
                <p className="text-gray-800 text-xl font-bold mb-2">Masih Kosong Nih!</p>
                <p className="text-gray-500 font-medium mb-8">Yuk maraton drama favoritmu sekarang 🌸</p>
                <button onClick={() => {setView('home'); fetchHome()}} className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-200 hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: DETAIL */}
        {!loading && view === 'detail' && selectedDrama && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <button 
              onClick={() => setView('home')}
              className="flex items-center text-pink-500 hover:text-white font-bold mb-6 bg-white hover:bg-pink-500 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:-translate-x-1 transition-all w-max border border-pink-100"
            >
              <ChevronLeft size={20} className="mr-1" /> Kembali
            </button>

            <div className="bg-white rounded-[2rem] p-5 sm:p-8 shadow-xl shadow-pink-100/50 flex flex-col sm:flex-row gap-8 border border-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2"></div>
              
              <img 
                src={getValidCover(selectedDrama)} 
                alt="cover" 
                referrerPolicy="no-referrer"
                className="w-full sm:w-56 rounded-3xl shadow-lg shadow-pink-200 object-cover aspect-[3/4] hover:scale-105 transition-transform duration-500"
              />
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3 leading-tight">{selectedDrama.title}</h1>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedDrama.tags?.map((tag, i) => (
                    <span key={i} className="bg-pink-50 border border-pink-200 text-pink-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                      {tag}
                    </span>
                  ))}
                  {selectedDrama.status && (
                    <span className="bg-green-50 border border-green-200 text-green-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                      {selectedDrama.status}
                    </span>
                  )}
                </div>
                <div className="bg-pink-50/50 p-5 rounded-3xl border border-pink-100">
                  <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Sparkles size={16} className="text-pink-400"/> Sinopsis</h4>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {selectedDrama.intro || "Sinopsis belum tersedia untuk drama manis ini."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-pink-50">
              <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-xl text-pink-500"><PlayCircle size={24} /></div>
                Pilih Episode
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4">
                {selectedDrama.episodes?.map((eps) => {
                  const isWatched = watchHistory.find(h => h.book_id === selectedDrama.book_id)?.lastEpisodeWatched === eps.episode;
                  return (
                  <button 
                    key={eps.video_id}
                    onClick={() => fetchStream(eps)}
                    className={`aspect-square bg-white border-2 rounded-2xl flex flex-col items-center justify-center font-bold transition-all duration-300 shadow-sm group hover:-translate-y-2 hover:shadow-lg
                        ${isWatched 
                            ? 'border-pink-500 text-pink-600 bg-pink-50 shadow-pink-200' 
                            : 'border-pink-100 text-gray-600 hover:bg-pink-500 hover:text-white hover:border-pink-500 hover:shadow-pink-200'}`}
                  >
                    <Play size={24} className={`mb-1 transition-transform group-hover:scale-125 ${isWatched ? 'text-pink-400 fill-pink-400' : 'opacity-40 group-hover:opacity-100 group-hover:fill-white'}`} />
                    <span className="text-lg">{eps.episode}</span>
                  </button>
                )})}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PLAYER */}
        {!loading && view === 'player' && currentEpisode && (
           <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                 <button 
                    onClick={() => setView('detail')}
                    className="flex items-center text-pink-500 hover:text-white font-bold bg-white hover:bg-pink-500 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all border border-pink-100"
                  >
                    <ChevronLeft size={20} className="mr-1" /> <span className="hidden sm:inline">Kembali</span>
                  </button>

                  <button 
                    onClick={() => setIsEpisodeMenuOpen(!isEpisodeMenuOpen)}
                    className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-full shadow-sm transition-all border 
                        ${isEpisodeMenuOpen ? 'bg-pink-500 text-white border-pink-500 shadow-pink-200' : 'bg-white text-pink-500 hover:bg-pink-50 border-pink-100'}`}
                  >
                    {isEpisodeMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    <span className="hidden sm:inline">Daftar Episode</span>
                  </button>
             </div>

              {/* Drawer Episode Cepat */}
              {isEpisodeMenuOpen && (
                 <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-pink-100/50 mb-6 border border-pink-100 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-extrabold text-gray-800 flex items-center gap-2"><PlayCircle size={18} className="text-pink-500"/> Ganti Episode</h3>
                        <span className="text-xs font-bold bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full shadow-sm">Total {selectedDrama.episodes.length} Eps</span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-hide">
                        {selectedDrama.episodes.map((eps) => (
                            <button 
                                key={eps.video_id}
                                onClick={() => fetchStream(eps)}
                                className={`aspect-square rounded-2xl flex items-center justify-center font-bold transition-all shadow-sm hover:scale-105 hover:-translate-y-1
                                    ${currentEpisode.video_id === eps.video_id 
                                        ? 'bg-gradient-to-br from-pink-400 to-pink-500 text-white shadow-lg shadow-pink-200 border-none' 
                                        : 'bg-white border-2 border-pink-50 text-gray-600 hover:border-pink-300 hover:text-pink-500'}`}
                            >
                                {eps.episode}
                            </button>
                        ))}
                    </div>
                 </div>
              )}

              <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-900/20 aspect-video relative group border-[6px] border-white ring-1 ring-pink-100">
                {streamUrl ? (
                   <video 
                     src={streamUrl} 
                     controls 
                     autoPlay 
                     onEnded={handleVideoEnded}
                     className="w-full h-full object-contain bg-gray-900"
                   />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="relative">
                           <PlayCircle size={64} className="text-pink-500 mb-4 opacity-80 animate-ping absolute inset-0" />
                           <PlayCircle size={64} className="text-pink-400 mb-4 relative z-10" />
                        </div>
                        <span className="text-pink-200 font-bold tracking-widest mt-2">Menyiapkan video...</span>
                    </div>
                  </div>
                )}
                
                 <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <h3 className="text-white font-extrabold text-xl drop-shadow-lg flex items-center gap-2">
                      <Sparkles size={18} className="text-yellow-400"/> {selectedDrama?.title} - Eps {currentEpisode.episode}
                    </h3>
                 </div>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-pink-100/30 mt-6 border border-pink-50">
                <div className="flex flex-col sm:flex-row justify-between
