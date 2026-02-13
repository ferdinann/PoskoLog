import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Client } from "@gradio/client";
import './App.css';

// --- LOGIKA JS UNTUK KATEGORI BANTUAN ---
const normalisasiTeks = (teks) => {
  if (!teks) return "";
  let t = teks.toLowerCase();
  const kamusSlang = [
  // Negasi & Ketidakhadiran (Penting untuk deteksi stok habis)
  { pola: /\bgak\b|\bgk\b|\bg\b|\bgakada\b|\bgada\b/g, ganti: "tidak ada" },
  { pola: /\btdk\b|\btak\b/g, ganti: "tidak" },
  { pola: /\bblm\b|\bblowm\b/g, ganti: "belum" },

  // Kata Ganti & Subjek
  { pola: /\bak\b|\baku\b|\bsy\b/g, ganti: "saya" },
  { pola: /\bkmi\b/g, ganti: "kami" },
  { pola: /\bbp\b|\bpak\b/g, ganti: "bapak" },
  { pola: /\bib\b|\bbu\b/g, ganti: "ibu" },
  { pola: /\banak2\b/g, ganti: "anak-anak" },

  // Kebutuhan Kesehatan & Medis (Mendukung kategori Kesehatan)
  { pola: /\bdmam\b|\bdmm\b/g, ganti: "demam" },
  { pola: /\bpsng\b|\bpusing\b/g, ganti: "sakit kepala" },
  { pola: /\bbtk\b/g, ganti: "batuk" },
  { pola: /\bsesek\b/g, ganti: "sesak napas" },
  { pola: /\bbtuh\b|\bbutuh\b|\bpengen\b|\bpengin\b/g, ganti: "membutuhkan" },
  { pola: /\bobat2an\b/g, ganti: "obat" },

  // Kebutuhan Logistik & Sanitasi
  { pola: /\bmam\b|\bmkn\b/g, ganti: "makan" },
  { pola: /\bmnm\b/g, ganti: "air minum" },
  { pola: /\bbnyk\b|\bbnyak\b/g, ganti: "banyak" },
  { pola: /\bsdkt\b/g, ganti: "sedikit" },
  { pola: /\bhbs\b/g, ganti: "habis" },

  // Konektor & Pelengkap
  { pola: /\butk\b|\buat\b/g, ganti: "untuk" },
  { pola: /\bdg\b|\bdgn\b/g, ganti: "dengan" },
  { pola: /\bsdh\b|\bsudh\b/g, ganti: "sudah" },
  { pola: /\bkrn\b/g, ganti: "karena" },
  { pola: /\baja\b|\baj\b/g, ganti: "saja" },
  { pola: /\bkl\b|\bkalo\b/g, ganti: "kalau" },
];
  kamusSlang.forEach(s => { t = t.replace(s.pola, s.ganti); });
  return t.replace(/[^a-z\s]/g, '').trim();
};

const getKategoriBantuan = (teksRaw) => {
  const teksBersih = normalisasiTeks(teksRaw);
  const anchors = {
  "LOGISTIK MAKANAN": [
    "makan", "lapar", "minum", "beras", "mie", "susu", "sembako", "nasi", "pangan",
    "lauk", "dapur", "konsumsi", "snack", "biskuit", "bubur", "balita", "bayi", 
    "mpasi", "gizi", "telur", "minyak", "gandum", "instan", "kaleng"
  ],
  "PAKAIAN DAN SANDANG": [
    "baju", "celana", "pakaian", "selimut", "sarung", "tenda", "terpal", "kasur",
    "handuk", "alas", "tikar", "matras", "jaket", "dalam", "popok", "diapers", 
    "bantal", "guling", "mukena", "sarung", "kaos", "kaki", "sepatu", "sandal"
  ],
  "KESEHATAN DAN MEDIS": [
    "sakit", "obat", "pusing", "demam", "luka", "medis", "dokter", "bidan", "perawat", 
    "vitamin", "p3k", "batuk", "pilek", "flu", "sesak", "napas", "asma", "darah", 
    "infeksi", "apotek", "salep", "betadine", "hamil", "parasetamol", "perban", "alkohol"
  ],
  "SANITASI DAN AIR": [
    "wc", "kamar mandi", "sabun", "air bersih", "toilet", "mandi", "pembalut",
    "shampoo", "sampo", "odol", "sikat", "gigi", "cuci", "deterjen", "gayung", 
    "ember", "septik", "limbah", "sampah", "kebersihan", "wastafel"
  ]
};
  
  let hasil = [];
  for (const [kategori, keywords] of Object.entries(anchors)) {
    if (keywords.some(kw => teksBersih.includes(kw))) {
      hasil.push(kategori);
    }
  }
  
  // Jika tidak ada kata kunci bantuan yang cocok, masuk ke UMUM
  return hasil.length > 0 ? hasil : ["UMUM"];
};

function App() {
  const [activeTab, setActiveTab] = useState("poskolog");
  const [loading, setLoading] = useState(false);
  const [poskoComment, setPoskoComment] = useState("");
  const [poskoStatus, setPoskoStatus] = useState("");
  const [adminData, setAdminData] = useState({ chart: null, table: [], total: "" });
  
  const [filterSentimen, setFilterSentimen] = useState("SEMUA");
  const [filterKategori, setFilterKategori] = useState("SEMUA");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const fetchAdminDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const client = await Client.connect("https://ferdinann-poskolog.hf.space/");
      const result = await client.predict("/get_admin_dashboard", { filter_val: filterSentimen });
      setAdminData({ chart: result.data[0], table: result.data[1].data, total: result.data[2] });
      setCurrentPage(1);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [filterSentimen]);

  useEffect(() => { if (activeTab === "admin") fetchAdminDashboard(); }, [activeTab, fetchAdminDashboard]);

  const processedData = useMemo(() => {
    const dataWithCats = adminData.table.map(row => ({
      waktu: row[0], teks: row[1], sentimen: row[2],
      kategori: getKategoriBantuan(row[1])
    }));

    const stats = {};
    dataWithCats.forEach(item => {
      item.kategori.forEach(cat => { stats[cat] = (stats[cat] || 0) + 1; });
    });

    const filtered = filterKategori === "SEMUA" 
      ? dataWithCats 
      : dataWithCats.filter(item => item.kategori.includes(filterKategori));

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filtered.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    return { filtered: currentRows, totalPages, stats, allFilteredCount: filtered.length };
  }, [adminData.table, filterKategori, currentPage]);

  const handlePoskoSubmit = async () => {
    if (!poskoComment) return alert("Isi laporan dulu");
    setLoading(true);
    try {
      const client = await Client.connect("https://ferdinann-poskolog.hf.space/");
      const result = await client.predict("/process_submission", { text: poskoComment });
      setPoskoStatus(result.data[0]);
      setPoskoComment("");
      if (activeTab === "admin") fetchAdminDashboard();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans pb-32">
      {/* Centered Header */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 px-4 py-5">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-xl shadow-lg shadow-emerald-900/20">📦</div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">PoskoLog</h1>
          </div>
          <div className="hidden md:flex bg-white/5 p-1 rounded-xl border border-white/10">
            {["poskolog", "admin"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === t ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-white"}`}>{t}</button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "poskolog" ? (
          <div className="max-w-xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[#111111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Suara Pengungsi</h2>
              <textarea className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 text-sm h-44 outline-none focus:border-emerald-500/50 transition-all" placeholder="Apa yang Anda butuhkan saat ini?" value={poskoComment} onChange={(e) => setPoskoComment(e.target.value)} />
              <button onClick={handlePoskoSubmit} disabled={loading} className="w-full mt-5 bg-emerald-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">{loading ? "Mengirim Laporan..." : "Kirim Laporan"}</button>
            </div>
            {poskoStatus && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center text-emerald-400 text-xs font-medium">✨ {poskoStatus.replace(/<[^>]*>?/gm, '')}</div>}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#111111] p-5 rounded-[2rem] border border-white/5 shadow-xl">
              <div>
                <label className="text-[12px] font-black text-emerald-500 mb-2 block uppercase">Sentimen</label>
                <select className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 text-xs outline-none" value={filterSentimen} onChange={(e) => setFilterSentimen(e.target.value)}>
                  <option value="SEMUA">Semua Sentimen</option>
                  <option value="Pujian/Apresiasi">Pujian/Apresiasi</option>
                  <option value="Pertanyaan/Info">Pertanyaan/Info</option>
                  <option value="Keluhan/Kritik">Keluhan/Kritik</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-black text-blue-500 mb-2 block uppercase">Kategori Kebutuhan</label>
                <select className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 text-xs outline-none" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
                  <option value="SEMUA">Semua Kategori</option>
                  <option value="LOGISTIK MAKANAN">Logistik Makanan</option>
                  <option value="PAKAIAN DAN SANDANG">Pakaian & Sandang</option>
                  <option value="KESEHATAN DAN MEDIS">Kesehatan & Medis</option>
                  <option value="SANITASI DAN AIR">Sanitasi & Air</option>
                  <option value="UMUM">Umum</option>
                </select>
              </div>
              <button onClick={fetchAdminDashboard} className="md:mt-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-[12px] uppercase transition-all">🔄 Refresh</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#111111] p-6 rounded-[2rem] border border-white/5 shadow-xl">
                <h3 className="text-[12px] font-black text-emerald-500 mb-6 uppercase tracking-widest">Sentimen</h3>
                {adminData.chart ? <img src={adminData.chart.plot} alt="Sentimen" className="w-full rounded-xl bg-white/5 p-2" /> : <div className="h-40 flex items-center justify-center text-[10px] text-slate-600 uppercase">Memuat Grafik...</div>}
              </div>
              <div className="bg-[#111111] p-6 rounded-[2rem] border border-white/5 shadow-xl">
                <h3 className="text-[12px] font-black text-blue-500 mb-6 uppercase tracking-widest">Distribusi Kategori Kebutuhan</h3>
                <div className="space-y-4 h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(processedData.stats).map(([cat, count]) => {
                    const max = Math.max(...Object.values(processedData.stats));
                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500"><span>{cat}</span><span>{count}</span></div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000" style={{ width: `${(count/max)*100}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-[#111111] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left text-[11px] min-w-[750px]">
                  <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 border-b border-white/5">
                    <tr><th className="px-6 py-5">Waktu</th><th className="px-6 py-5 w-[40%]">Laporan</th><th className="px-6 py-5">Kategori</th><th className="px-6 py-5 text-right">Sentimen</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-400">
                    {processedData.filtered.map((item, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5 opacity-40 font-mono text-[10px]">{item.waktu.split(' ')[1] || item.waktu}</td>
                        <td className="px-6 py-5 leading-relaxed">{item.teks}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1">
                            {item.kategori.map((c, idx) => (
                              <span key={idx} className={`px-2 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-tighter ${c === 'PERTANYAAN DAN INFO' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>{c.split(' ')[0]}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${item.sentimen.includes('Pujian') ? 'bg-emerald-500/10 text-emerald-400' : item.sentimen.includes('Pertanyaan') ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-400'}`}>
                            {item.sentimen.split('/')[0]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination UI */}
              <div className="p-5 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-[10px] font-bold text-slate-600 uppercase italic">Total: {processedData.allFilteredCount} Laporan</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase disabled:opacity-10 hover:bg-white/10 transition-all">Prev</button>
                  <div className="flex gap-1">
                    {[...Array(processedData.totalPages)].map((_, i) => {
                      const p = i + 1;
                      if (p === 1 || p === processedData.totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                        return ( <button key={i} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === p ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-500"}`}>{p}</button> );
                      }
                      if (p === currentPage - 2 || p === currentPage + 2) return <span key={i} className="text-slate-700">...</span>;
                      return null;
                    })}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, processedData.totalPages))} disabled={currentPage === processedData.totalPages} className="px-3 py-2 bg-white/5 rounded-lg text-[10px] font-bold uppercase disabled:opacity-10 hover:bg-white/10 transition-all">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Nav (Mobile) */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-[100] px-8">
        <div className="bg-[#1A1A1A]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 shadow-2xl flex gap-2">
          {["poskolog", "admin"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 flex flex-col items-center py-3.5 rounded-2xl transition-all ${activeTab === t ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40" : "text-slate-600"}`}>
              <span className="text-xl">{t === "poskolog" ? "✍️" : "📊"}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.15em] mt-1">{t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;