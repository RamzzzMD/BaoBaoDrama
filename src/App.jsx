import React, { useState, useEffect } from 'react';
import { Search, PlayCircle, Star, ChevronLeft, Tv, Heart, Play } from 'lucide-react';

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
// KOMPONEN: Header
// ============================================================================
const Header = ({ onSearch, goHome }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(query.trim()) onSearch(query);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          onClick={goHome}
          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="bg-pink-500 text-white p-2 rounded-xl shadow-md">
            <Tv size={24} />
          </div>
          <h1 className="text-xl font-bold text-pink-600 hidden sm:block">BaoBao<span className="text-pink-400">Drama</span> 🍑</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 max-w-sm ml-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Cari drama imut..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-pink-50 text-pink-900 placeholder-pink-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all border border-pink-100"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-pink-400 hover:text-pink-600">
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};

// ============================================================================
// KOMPONEN: Drama Card
// ============================================================================
const DramaCard = ({ drama, onClick }) => (
  <div 
    onClick={() => onClick(drama.book_id)}
    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-pink-50"
  >
    <div className="relative aspect-[3/4] overflow-hidden">
      <img 
        src={drama.cover} 
        alt={drama.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400/fdf2f8/ec4899?text=Drama' }}
      />
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm text-pink-500">
        <Heart size={16} className="fill-pink-100" />
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-bold text-gray-800 truncate text-sm sm:text-base">{drama.title}</h3>
      <div className="flex gap-1 mt-1 overflow-hidden">
        {drama.tags?.slice(0, 2).map((tag, i) => (
          <span key={i} className="text-[10px] sm:text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full whitespace-nowrap">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================================
// APP UTAMA (Main Container)
// ============================================================================
export default function App() {
  const [view, setView] = useState('home'); // home, detail, player
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('ceo');
  const [dramas, setDramas] = useState([]);
  
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');

  // 1. Fetch Daftar Drama (Search)
  const fetchSearch = async (query) => {
    setLoading(true);
    setView('home');
    setSearchQuery(query);
    try {
      // Panggil API Vercel (Sesuaikan domain jika sudah rilis)
      const res = await fetch(`/api/proxy?action=search&query=${query}`);
      if (!res.ok) throw new Error('API Unavailable');
      const data = await res.json();
      setDramas(data);
    } catch (e) {
      console.warn("Menggunakan Mock Data (API Backend tidak terhubung di Preview)");
      setDramas(MOCK_SEARCH);
    }
    setLoading(false);
  };

  // 2. Fetch Detail Drama
  const fetchDetail = async (bookId) => {
    setLoading(true);
    setView('detail');
    try {
      const res = await fetch(`/api/proxy?action=detail&bookId=${bookId}`);
      if (!res.ok) throw new Error('API Unavailable');
      const data = await res.json();
      setSelectedDrama(data);
    } catch (e) {
      setSelectedDrama(MOCK_DETAIL);
    }
    setLoading(false);
  };

  // 3. Fetch Stream Video URL
  const fetchStream = async (episode) => {
    setLoading(true);
    setCurrentEpisode(episode);
    setView('player');
    try {
      const res = await fetch(`/api/proxy?action=stream&videoId=${episode.video_id}`);
      if (!res.ok) throw new Error('API Unavailable');
      const data = await res.json();
      
      // Ambil kualitas tertinggi jika ada
      if (data.downloads && data.downloads.length > 0) {
        setStreamUrl(data.downloads[0].url);
      } else {
        setStreamUrl(data.url);
      }
    } catch (e) {
      // Mockup Video Kucing Imut (Big Buck Bunny)
      setStreamUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
    }
    setLoading(false);
  };

  // Auto load saat pertama kali dibuka
  useEffect(() => {
    fetchSearch('ceo');
  }, []);

  return (
    <div className="min-h-screen bg-pink-50/50 font-sans pb-10">
      <Header onSearch={fetchSearch} goHome={() => setView('home')} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-bounce mb-2">🌸</div>
            <div className="text-pink-400 font-medium">Tunggu sebentar ya...</div>
          </div>
        )}

        {/* VIEW: HOME / SEARCH */}
        {!loading && view === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-yellow-400 fill-yellow-400" size={20} />
              Hasil Pencarian: <span className="text-pink-500">"{searchQuery}"</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dramas.map((drama) => (
                <DramaCard key={drama.book_id} drama={drama} onClick={fetchDetail} />
              ))}
            </div>
          </div>
        )}

        {/* VIEW: DETAIL DRAMA */}
        {!loading && view === 'detail' && selectedDrama && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <button 
              onClick={() => setView('home')}
              className="flex items-center text-pink-500 hover:text-pink-700 font-medium mb-4 bg-white px-4 py-2 rounded-full shadow-sm w-max"
            >
              <ChevronLeft size={20} /> Kembali
            </button>

            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-6">
              <img 
                src={selectedDrama.cover} 
                alt="cover" 
                className="w-full sm:w-48 rounded-2xl shadow-md object-cover aspect-[3/4]"
              />
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{selectedDrama.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDrama.tags?.map((tag, i) => (
                    <span key={i} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed bg-pink-50/50 p-4 rounded-2xl">
                  {selectedDrama.intro}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PlayCircle className="text-pink-500" /> Daftar Episode
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {selectedDrama.episodes?.map((eps) => (
                  <button 
                    key={eps.video_id}
                    onClick={() => fetchStream(eps)}
                    className="aspect-square bg-white border-2 border-pink-100 rounded-2xl flex flex-col items-center justify-center text-pink-600 font-bold hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
                  >
                    <Play size={20} className="mb-1 opacity-50" />
                    {eps.episode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: VIDEO PLAYER */}
        {!loading && view === 'player' && currentEpisode && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
             <button 
                onClick={() => setView('detail')}
                className="flex items-center text-pink-500 hover:text-pink-700 font-medium mb-4 bg-white px-4 py-2 rounded-full shadow-sm w-max"
              >
                <ChevronLeft size={20} /> Kembali ke Detail
              </button>

              <div className="bg-black rounded-3xl overflow-hidden shadow-xl aspect-video relative group">
                {streamUrl ? (
                   <video 
                     src={streamUrl} 
                     controls 
                     autoPlay 
                     className="w-full h-full object-contain"
                   />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    Video tidak tersedia.
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-3xl shadow-sm mt-4 border border-pink-50">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedDrama?.title} - Episode {currentEpisode.episode}
                </h2>
                <p className="text-pink-500 font-medium mt-1">{currentEpisode.title}</p>
              </div>
           </div>
        )}

      </main>
    </div>
  );
}
