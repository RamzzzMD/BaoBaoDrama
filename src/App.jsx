import React, { useState, useEffect } from 'react';
import { Search, PlayCircle, Star, ChevronLeft, Tv, Heart, Play, Github, MessageCircle, Send, Clock, Menu, X, SkipForward } from 'lucide-react';

// ============================================================================
// MOCK DATA (Fallback jika API Vercel tidak bisa diakses di lingkungan Preview)
// ============================================================================
const MOCK_SEARCH = [
  { book_id: '1', title: 'CEO\'s Sweetest Love', cover: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=600', author: 'Lin Xi', tags: ['Romance', 'Drama'] },
  { book_id: '2', title: 'Falling Into Your Smile', cover: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&q=80&w=600', author: 'Qing Mei', tags: ['E-Sports', 'Romance'] },
  { book_id: '3', title: 'Hidden Love', cover: 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?auto=format&fit=crop&q=80&w=600', author: 'Zhu Yi', tags: ['Youth', 'Sweet'] },
  { book_id: '4', title: 'My Boss is Cute', cover: 'https://images.unsplash.com/photo-1516589178581-6cd7853d4f4f?auto=format&fit=crop&q=80&w=600', author: 'Tang Tang', tags: ['Comedy', 'Romance'] },
  { book_id: '5', title: 'Love O2O', cover: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600', author: 'Gu Man', tags: ['Gaming', 'Romance'] },
  { book_id: '6', title: 'Put Your Head on My Shoulder', cover: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600', author: 'Zhao Qianqian', tags: ['School', 'Sweet'] },
  { book_id: '7', title: 'You Are My Glory', cover: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600', author: 'Gu Man', tags: ['Aerospace', 'Romance'] },
  { book_id: '8', title: 'Go Go Squid!', cover: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600', author: 'Mo Bao Fei Bao', tags: ['E-Sports', 'Comedy'] },
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
const Header = ({ onSearch, goHome, goHistory }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(query.trim()) onSearch(query);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <div 
          onClick={goHome}
          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform shrink-0"
        >
          <div className="bg-pink-500 text-white p-2 rounded-xl shadow-md">
            <Tv size={24} />
          </div>
          <h1 className="text-xl font-bold text-pink-600 hidden sm:block">BaoBao<span className="text-pink-400">Drama</span> 🍑</h1>
        </div>
        
        <div className="flex items-center gap-2 flex-1 justify-end max-w-md">
          <form onSubmit={handleSubmit} className="flex-1">
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

          {/* Tombol History di Header */}
          <button 
            onClick={goHistory} 
            className="p-2.5 bg-pink-100 text-pink-500 hover:bg-pink-500 hover:text-white rounded-full transition-all shadow-sm shrink-0"
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
const DramaCard = ({ drama, onClick }) => (
  <div 
    onClick={() => onClick(drama.book_id)}
    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-pink-50"
  >
    <div className="relative aspect-[3/4] overflow-hidden">
      <img 
        // Ubah format heic ke png langsung saat merender gambar di card (berlaku untuk Home, Search, dan History)
        src={drama.cover ? drama.cover.replace(/\.heic/gi, '.png') : ''} 
        alt={drama.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400/fdf2f8/ec4899?text=Drama' }}
      />
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm text-pink-500">
        <Heart size={16} className="fill-pink-100" />
      </div>
      
      {/* Tambahan Badge Episode untuk History Card */}
      {drama.lastEpisodeWatched && (
        <div className="absolute bottom-2 left-2 bg-pink-500/90 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm shadow-sm">
           Eps {drama.lastEpisodeWatched}
        </div>
      )}
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
      {drama.watchedAt && (
          <p className="text-[10px] text-gray-400 mt-2 truncate">
              Ditonton: {new Date(drama.watchedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
          </p>
      )}
    </div>
  </div>
);

// ============================================================================
// KOMPONEN: Footer
// ============================================================================
const Footer = () => (
  <footer className="mt-auto bg-pink-100/50 pt-8 pb-6 border-t border-pink-200 text-center">
    <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-5">
      
      {/* Deskripsi Singkat */}
      <div className="max-w-md">
        <h4 className="font-bold text-pink-600 mb-2 flex items-center justify-center gap-2">
          <Tv size={18} /> Tentang BaoBaoDrama
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          BaoBaoDrama adalah tempat streaming Drama China pilihan dengan koleksi terimut dan terbaik. Nonton drama favoritmu dengan mudah, gratis, dan nyaman di sini! 🌸
        </p>
      </div>

      {/* Kontak Admin */}
      <div className="flex gap-4 mt-2">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2.5 bg-white rounded-full text-gray-800 hover:text-white hover:bg-gray-800 hover:scale-110 transition-all shadow-sm" title="GitHub">
          <Github size={20} />
        </a>
        <a href="https://wa.me" target="_blank" rel="noreferrer" className="p-2.5 bg-white rounded-full text-green-500 hover:text-white hover:bg-green-500 hover:scale-110 transition-all shadow-sm" title="WhatsApp">
          <MessageCircle size={20} />
        </a>
        <a href="https://t.me" target="_blank" rel="noreferrer" className="p-2.5 bg-white rounded-full text-blue-500 hover:text-white hover:bg-blue-500 hover:scale-110 transition-all shadow-sm" title="Telegram">
          <Send size={20} className="ml-0.5" />
        </a>
      </div>

      {/* Watermark / Copyright */}
      <div className="mt-2 px-4 py-2 bg-pink-50 rounded-full border border-pink-100 shadow-sm">
        <p className="text-xs font-semibold text-pink-500 tracking-wide">
          Ranzz © 2026 - Developed with <span className="text-red-500 animate-pulse inline-block">❤️</span>
        </p>
      </div>

    </div>
  </footer>
);

// ============================================================================
// APP UTAMA (Main Container)
// ============================================================================
export default function App() {
  const [view, setView] = useState('home'); // home, search, detail, player
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [homeDramas, setHomeDramas] = useState([]);
  const [searchDramas, setSearchDramas] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]); // State untuk menyimpan riwayat tontonan
  
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [isEpisodeMenuOpen, setIsEpisodeMenuOpen] = useState(false); // State untuk drawer episode

  // Muat History dari LocalStorage saat pertama kali
  useEffect(() => {
    const savedHistory = localStorage.getItem('baobao_history');
    if (savedHistory) {
        try {
            setWatchHistory(JSON.parse(savedHistory));
        } catch (e) {
            console.error("Gagal memuat riwayat tontonan", e);
        }
    }
  }, []);

  // Fungsi untuk menyimpan history ke LocalStorage
  const saveToHistory = (drama, episode) => {
      setWatchHistory(prevHistory => {
          // Buat salinan history yang ada
          const newHistory = [...prevHistory];
          // Cari apakah drama ini sudah ada di history
          const existingIndex = newHistory.findIndex(h => h.book_id === drama.book_id);
          
          const historyEntry = {
              book_id: drama.book_id,
              title: drama.title,
              cover: drama.cover,
              tags: drama.tags,
              lastEpisodeWatched: episode.episode,
              watchedAt: new Date().toISOString()
          };

          if (existingIndex >= 0) {
              // Jika sudah ada, update entry tersebut dan pindahkan ke atas
              newHistory.splice(existingIndex, 1);
          }
          
          // Tambahkan ke paling atas
          newHistory.unshift(historyEntry);
          
          // Simpan ke local storage (batasi misal 10 history terakhir)
          const limitedHistory = newHistory.slice(0, 10);
          localStorage.setItem('baobao_history', JSON.stringify(limitedHistory));
          
          return limitedHistory;
      });
  };

  // 0. Fetch Data Beranda (Home)
  const fetchHome = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy?action=search&query=romance&limit=12`);
      if (!res.ok) throw new Error('API Unavailable');
      const data = await res.json();
      setHomeDramas(data);
    } catch (e) {
      setHomeDramas(MOCK_SEARCH);
    }
    setLoading(false);
  };

  // 1. Fetch Daftar Drama (Search)
  const fetchSearch = async (query) => {
    setLoading(true);
    setView('search');
    setSearchQuery(query);
    try {
      // Panggil API Vercel (Sesuaikan domain jika sudah rilis)
      const res = await fetch(`/api/proxy?action=search&query=${query}`);
      if (!res.ok) throw new Error('API Unavailable');
      const data = await res.json();
      setSearchDramas(data);
    } catch (e) {
      console.warn("Menggunakan Mock Data (API Backend tidak terhubung di Preview)");
      setSearchDramas(MOCK_SEARCH);
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
      // Coba cari dari data history jika ada (untuk fallback mockup)
      const fromHistory = watchHistory.find(h => h.book_id === bookId);
      if(fromHistory && !MOCK_DETAIL.book_id){
          setSelectedDrama({...MOCK_DETAIL, title: fromHistory.title, cover: fromHistory.cover, book_id: fromHistory.book_id});
      } else {
         setSelectedDrama(MOCK_DETAIL);
      }
    }
    setLoading(false);
  };

  // 3. Fetch Stream Video URL
  const fetchStream = async (episode) => {
    setLoading(true);
    setCurrentEpisode(episode);
    setIsEpisodeMenuOpen(false); // Tutup menu episode jika terbuka
    setView('player');
    
    // Simpan ke history saat mulai menonton
    if(selectedDrama) {
        saveToHistory(selectedDrama, episode);
    }

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

  // 4. Handle Video Berakhir (Auto Next Episode)
  const handleVideoEnded = () => {
      if (!selectedDrama || !selectedDrama.episodes || !currentEpisode) return;
      
      // Cari index episode saat ini
      const currentIndex = selectedDrama.episodes.findIndex(e => e.video_id === currentEpisode.video_id);
      
      // Jika ada episode selanjutnya, putar otomatis
      if (currentIndex !== -1 && currentIndex + 1 < selectedDrama.episodes.length) {
          const nextEpisode = selectedDrama.episodes[currentIndex + 1];
          fetchStream(nextEpisode);
      }
  };

  // Cek jika ada episode selanjutnya (untuk tombol Next)
  const hasNextEpisode = selectedDrama && currentEpisode && 
        selectedDrama.episodes.findIndex(e => e.video_id === currentEpisode.video_id) + 1 < selectedDrama.episodes.length;

  // Auto load saat pertama kali dibuka
  useEffect(() => {
    fetchHome();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-pink-50/50 font-sans">
      <Header onSearch={fetchSearch} goHome={() => { setView('home'); setSearchQuery(''); }} goHistory={() => setView('history')} />

      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-grow pb-12">
        
        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-bounce mb-2">🌸</div>
            <div className="text-pink-400 font-medium">Tunggu sebentar ya...</div>
          </div>
        )}

        {/* VIEW: HOME / BERANDA UTAMA */}
        {!loading && view === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-3xl p-6 sm:p-10 text-white mb-8 shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[200px]">
              <div className="relative z-10 max-w-lg">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Selamat Datang di BaoBao! 🌸</h2>
                <p className="text-pink-100 text-sm sm:text-base mb-5 leading-relaxed">
                  Temukan ratusan drama China paling romantis, menggemaskan, dan bikin baper. Siapkan cemilanmu dan mulai maraton sekarang juga!
                </p>
                <button onClick={() => fetchSearch('ceo')} className="bg-white text-pink-500 px-6 py-2.5 rounded-full font-bold shadow-md hover:scale-105 transition-transform w-max">
                  Lihat Tren Populer
                </button>
              </div>
              {/* Dekorasi BG */}
              <Heart size={150} className="absolute -right-10 -bottom-10 text-pink-300 opacity-20 transform -rotate-12" />
              <Star size={80} className="absolute right-32 top-4 text-yellow-200 opacity-30 transform rotate-12" />
            </div>

            {/* Riwayat Tontonan Section (Hanya muncul jika ada history) */}
            {watchHistory.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="text-pink-500" size={20} />
                        Lanjutkan Menonton
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {watchHistory.map((drama) => (
                            <DramaCard key={`history-${drama.book_id}`} drama={drama} onClick={fetchDetail} />
                        ))}
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="text-pink-500 fill-pink-500" size={20} />
              Rekomendasi Spesial Untukmu
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {homeDramas.map((drama) => (
                <DramaCard key={drama.book_id} drama={drama} onClick={fetchDetail} />
              ))}
            </div>
          </div>
        )}

        {/* VIEW: SEARCH RESULTS */}
        {!loading && view === 'search' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Search className="text-pink-500" size={20} />
              Hasil Pencarian: <span className="text-pink-500">"{searchQuery}"</span>
            </h2>
            {searchDramas.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchDramas.map((drama) => (
                  <DramaCard key={drama.book_id} drama={drama} onClick={fetchDetail} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>Waduh, drama tidak ditemukan 🥺</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW: HISTORY (RIWAYAT KESELURUHAN) */}
        {!loading && view === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="text-pink-500 fill-pink-100" size={24} />
              Riwayat Tontonan Kamu
            </h2>
            
            {watchHistory.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {watchHistory.map((drama) => (
                  <DramaCard key={`full-history-${drama.book_id}`} drama={drama} onClick={fetchDetail} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center bg-white rounded-3xl shadow-sm border border-pink-50">
                <Clock size={64} className="text-pink-200 mb-4" />
                <p className="text-gray-500 font-medium">Belum ada riwayat tontonan nih.</p>
                <p className="text-pink-400 font-medium mb-6">Yuk tonton drama favoritmu dulu! 🌸</p>
                <button onClick={() => setView('home')} className="bg-pink-500 text-white px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 transition-transform">
                  Kembali ke Beranda
                </button>
              </div>
            )}
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
                    className={`aspect-square bg-white border-2 rounded-2xl flex flex-col items-center justify-center font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-1
                        ${watchHistory.find(h => h.book_id === selectedDrama.book_id)?.lastEpisodeWatched === eps.episode 
                            ? 'border-pink-500 text-pink-500 bg-pink-50' // Style untuk episode yang terakhir ditonton
                            : 'border-pink-100 text-pink-600 hover:bg-pink-500 hover:text-white hover:border-pink-500'}`}
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
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-4">
                 <button 
                    onClick={() => setView('detail')}
                    className="flex items-center text-pink-500 hover:text-pink-700 font-medium bg-white px-4 py-2 rounded-full shadow-sm w-max"
                  >
                    <ChevronLeft size={20} /> <span className="hidden sm:inline ml-1">Kembali</span>
                  </button>

                  {/* Tombol Hamburger Menu Episode */}
                  <button 
                    onClick={() => setIsEpisodeMenuOpen(!isEpisodeMenuOpen)}
                    className={`flex items-center gap-2 font-medium px-4 py-2 rounded-full shadow-sm transition-all 
                        ${isEpisodeMenuOpen ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 hover:text-pink-700'}`}
                  >
                    {isEpisodeMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    <span className="hidden sm:inline">Pilih Episode</span>
                  </button>
             </div>

              {/* Drawer Daftar Episode */}
              {isEpisodeMenuOpen && (
                 <div className="bg-white p-4 rounded-3xl shadow-sm mb-4 border border-pink-50 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-800">Daftar Episode</h3>
                        <span className="text-xs font-bold bg-pink-100 text-pink-600 px-2 py-1 rounded-full">{selectedDrama.episodes.length} Eps</span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                        {selectedDrama.episodes.map((eps) => (
                            <button 
                                key={eps.video_id}
                                onClick={() => fetchStream(eps)}
                                className={`aspect-square rounded-xl flex items-center justify-center font-bold transition-all shadow-sm hover:scale-105
                                    ${currentEpisode.video_id === eps.video_id 
                                        ? 'bg-pink-500 text-white shadow-md' 
                                        : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}
                            >
                                {eps.episode}
                            </button>
                        ))}
                    </div>
                 </div>
              )}

              <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative group border-4 border-pink-100">
                {streamUrl ? (
                   <video 
                     src={streamUrl} 
                     controls 
                     autoPlay 
                     onEnded={handleVideoEnded} // Pemicu otomatis pindah episode
                     className="w-full h-full object-contain"
                   />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900">
                    <div className="animate-pulse flex flex-col items-center">
                        <PlayCircle size={48} className="text-pink-500 mb-4 opacity-50" />
                        <span className="text-pink-200">Menyiapkan video...</span>
                    </div>
                  </div>
                )}
                
                {/* Overlay Judul saat Hover */}
                 <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <h3 className="text-white font-bold text-lg drop-shadow-md">{selectedDrama?.title} - Episode {currentEpisode.episode}</h3>
                 </div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl shadow-sm mt-6 border border-pink-50">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Sedang Diputar</span>
                            <span className="text-gray-400 text-sm flex items-center gap-1"><Heart size={14}/> Favoritmu</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                          {selectedDrama?.title} 
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xl text-pink-500 font-bold">Episode {currentEpisode.episode}</span>
                            {currentEpisode.title && currentEpisode.title !== `Episode ${currentEpisode.episode}` && (
                                <span className="text-gray-500 font-medium border-l-2 border-pink-200 pl-2">{currentEpisode.title}</span>
                            )}
                        </div>
                    </div>

                    {/* Tombol Next Manual (Jika ada episode selanjutnya) */}
                    {hasNextEpisode && (
                        <button 
                            onClick={handleVideoEnded}
                            className="flex items-center gap-1 bg-pink-50 text-pink-600 hover:bg-pink-500 hover:text-white px-4 py-2.5 rounded-xl transition-all font-semibold shadow-sm shrink-0"
                        >
                            <span className="hidden sm:inline">Next</span> <SkipForward size={18} />
                        </button>
                    )}
                </div>
              </div>
           </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
