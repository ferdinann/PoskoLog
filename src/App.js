import React, { useState, useEffect, useCallback } from 'react';
import { Client } from "@gradio/client";
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState("poskolog"); 
  const [loading, setLoading] = useState(false);
  const [poskoComment, setPoskoComment] = useState("");
  const [poskoStatus, setPoskoStatus] = useState("");
  const [adminData, setAdminData] = useState({ chart: null, table: [], total: "" });
  const [filterSentimen, setFilterSentimen] = useState("SEMUA");

  // Membungkus dengan useCallback agar referensi fungsi tetap stabil
  const fetchAdminDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const client = await Client.connect("https://ferdinann-poskolog.hf.space/");
      const result = await client.predict("/get_admin_dashboard", { filter_val: filterSentimen });
      setAdminData({
        chart: result.data[0],
        table: result.data[1].data,
        total: result.data[2]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterSentimen]); // Dependency fungsi ini adalah filterSentimen

  const handlePoskoSubmit = async () => {
    if (!poskoComment) return alert("Komentar tidak boleh kosong");
    setLoading(true);
    try {
      const client = await Client.connect("https://ferdinann-poskolog.hf.space/");
      const result = await client.predict("/process_submission", { text: poskoComment });
      setPoskoStatus(result.data[0]); 
      setPoskoComment(""); 
      if (activeTab === "admin") fetchAdminDashboard(); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin") {
      fetchAdminDashboard();
    }
  }, [activeTab, fetchAdminDashboard]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans antialiased pb-24 md:pb-10">
      {/* Header - Lebih Ringkas di Mobile */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 md:py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-900/20 text-xl">📦</div>
            <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic text-white">PoskoLog</h1>
          </div>
          
          {/* Navigasi Desktop */}
          <div className="hidden md:flex bg-white/5 p-1 rounded-xl border border-white/10">
            {["poskolog", "admin"].map(t => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)} 
                className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === t ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        
        {/* TAB 1: SAMPAIKAN PESAN */}
        {activeTab === "poskolog" && (
          <div className="max-w-xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#111111] p-5 md:p-8 rounded-[2rem] border border-white/5 shadow-2xl">
              <h2 className="text-base md:text-xl font-bold mb-1 text-white">Suara Pengungsi</h2>
              <p className="text-xs text-slate-500 mb-6">Laporkan kondisi atau kebutuhan mendesak Anda.</p>
              
              <div className="space-y-4">
                <div className="relative">
                  <textarea 
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 md:p-5 text-sm h-40 md:h-48 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:opacity-20"
                    placeholder="Apa yang Anda butuhkan saat ini?"
                    value={poskoComment}
                    onChange={(e) => setPoskoComment(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Input Teks</div>
                </div>

                <button 
                  onClick={handlePoskoSubmit}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Mengirim...</span>
                    </div>
                  ) : "Kirim Laporan"}
                </button>
              </div>
            </div>

            {poskoStatus && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center animate-in zoom-in-95 duration-300">
                <p className="text-emerald-400 text-[11px] md:text-xs font-medium leading-relaxed">
                  ✨ {poskoStatus.replace(/<[^>]*>?/gm, '')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DASHBOARD ADMIN */}
        {activeTab === "admin" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end bg-[#111111] p-4 rounded-[1.5rem] border border-white/5">
              <div className="flex-1">
                <label className="text-[10px] font-black text-emerald-500 mb-2 block uppercase tracking-[0.2em]">Filter Sentimen</label>
                <select 
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 text-xs outline-none focus:border-emerald-500/50 appearance-none"
                  value={filterSentimen}
                  onChange={(e) => setFilterSentimen(e.target.value)}
                >
                  <option value="SEMUA">Semua Kategori</option>
                  <option value="Pujian/Apresiasi">Pujian/Apresiasi</option>
                  <option value="Pertanyaan/Info">Pertanyaan/Info</option>
                  <option value="Keluhan/Kritik">Keluhan/Kritik</option>
                </select>
              </div>
              <button 
                onClick={fetchAdminDashboard} 
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                🔄 Update Data
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Grafik */}
              <div className="bg-[#111111] p-6 rounded-[2rem] border border-white/5 shadow-xl">
                 <h3 className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Grafik Distribusi
                 </h3>
                 {adminData.chart ? (
                   <div className="bg-white/5 rounded-2xl p-2">
                    <img src={adminData.chart.plot} alt="Chart" className="w-full rounded-xl" />
                   </div>
                 ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Memproses Visual...</span>
                  </div>
                 )}
              </div>

              {/* Tabel - Scrollable di Mobile */}
              <div className="lg:col-span-2 bg-[#111111] rounded-[2rem] border border-white/5 overflow-hidden flex flex-col shadow-xl">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-6 py-5 whitespace-nowrap">Waktu</th>
                        <th className="px-6 py-5">Isi Laporan</th>
                        <th className="px-6 py-5 text-right">Label</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px] text-slate-400">
                      {adminData.table.length > 0 ? adminData.table.map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap opacity-40 font-mono text-[10px]">{row[0].split(' ')[1]}</td>
                          <td className="px-6 py-5 leading-relaxed min-w-[200px]">{row[1]}</td>
                          <td className="px-6 py-5 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                              row[2].includes('Pujian') ? 'bg-emerald-500/10 text-emerald-400' : 
                              row[2].includes('Keluhan') ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {row[2].split('/')[0]}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-20 text-center text-[10px] font-bold uppercase opacity-20 tracking-[0.3em]">Data Kosong</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-5 bg-white/5 mt-auto border-t border-white/5">
                   <div className="text-[10px] font-bold text-slate-500 italic flex items-center gap-2">
                      <span className="text-emerald-500 italic">#</span>
                      {adminData.total.replace(/<[^>]*>?/gm, '')}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation - Khusus Mobile */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[300px]">
        <div className="bg-[#1A1A1A]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-2xl flex gap-1">
          <button 
            onClick={() => setActiveTab("poskolog")}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === "poskolog" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500"}`}
          >
            <span className="text-lg">✍️</span>
            <span className="text-[8px] font-black uppercase tracking-widest">Lapor</span>
          </button>
          <button 
            onClick={() => setActiveTab("admin")}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === "admin" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500"}`}
          >
            <span className="text-lg">📊</span>
            <span className="text-[8px] font-black uppercase tracking-widest">Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;