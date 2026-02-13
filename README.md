# 📦 PoskoLog: Sistem Aspirasi & Analisis Sentimen Pengungsi 🚨

**PoskoLog** adalah platform asisten cerdas berbasis web yang dirancang untuk mengelola keluhan, pujian, dan aspirasi masyarakat di posko bencana secara *real-time*. Dengan integrasi NLP, sistem ini melakukan filtrasi otomatis untuk membantu admin memprioritaskan bantuan yang paling mendesak.

---

## 📌 Problem Statement
Dalam situasi pasca-bencana, volume laporan dari pengungsi seringkali sangat tinggi, sehingga informasi kritis (seperti keluhan bantuan medis yang lambat atau kekurangan logistik) berisiko terlewatkan. **PoskoLog** hadir untuk mendigitalisasi proses ini, memberikan analisis sentimen instan, dan memetakan kebutuhan mendesak melalui dashboard terintegrasi yang responsif.

## 🏗️ Arsitektur & Teknologi
Aplikasi ini menggunakan arsitektur *decoupled* untuk efisiensi dan skalabilitas:

* **Frontend**: [React.js](https://reactjs.org/) (Hooks & UI Glassmorphism) – Dideploy di **Vercel** untuk performa tinggi dan aksesibilitas global.
* **Backend AI API**: Python (**Gradio Client**) – Dihosting di **Hugging Face Spaces** sebagai mesin pemroses NLP.
* **Visualisasi**: Progress Bar dinamis dan Matplotlib untuk memantau distribusi kategori kebutuhan secara visual.

---

## ✨ Fitur Utama
* **Zero-Login Interface**: Form pengaduan instan tanpa hambatan bagi pengungsi untuk menyampaikan kebutuhan mereka segera.
* **Automated Categorization**: Klasifikasi otomatis ke dalam 4 kategori bantuan utama: **Logistik Makanan**, **Pakaian & Sandang**, **Kesehatan & Medis**, serta **Sanitasi & Air**.
* **Smart Sentiment Analysis**: Mendeteksi emosi pesan (Pujian, Informasi, atau Keluhan) menggunakan model AI untuk menentukan skala prioritas tindakan.
* **Dashboard Admin Glassmorphism**:
    * **Visual Distribution**: Grafik proporsi sentimen pesan masuk secara keseluruhan.
    * **Need Category Tracking**: Bar distribusi kebutuhan untuk memantau stok bantuan yang paling mendesak.
    * **Multi-Filter System**: Filter ganda berdasarkan *Sentimen* dan *Kategori Kebutuhan* untuk presisi data yang lebih tajam.

---

## 📖 Cara Penggunaan

### Bagi Pengungsi (User)
1.  Akses aplikasi melalui URL **Vercel** resmi.
2.  Tuliskan masukan atau kebutuhan mendesak pada kolom "Feedback".
3.  Klik **Kirim Feedback**. Sistem akan memproses laporan secara *real-time*.

### Bagi Petugas (Admin)
1.  Buka tab **Dashboard Analisis**.
2.  Gunakan **Filter Sentimen** dan **Kategori Kebutuhan** untuk menyaring laporan spesifik (misal: mencari "Keluhan" di kategori "Logistik Makanan").
3.  Klik tombol **Refresh** untuk menarik data terbaru langsung dari API Hugging Face.
4.  Pantau tabel laporan untuk melihat detail waktu dan isi pesan guna pengambilan keputusan cepat.


© 2026 HelpApp AI • Created By Ferdinan