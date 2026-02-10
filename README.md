# 📦 PoskoLog: Sistem Aspirasi & Analisis Sentimen Pengungsi

**PoskoLog** adalah platform asisten cerdas berbasis web yang dirancang untuk memanajemen keluhan, pujian, dan pertanyaan masyarakat di posko bencana secara real-time. Dengan integrasi NLP, sistem ini mampu melakukan filtrasi otomatis untuk membantu admin memprioritaskan bantuan yang paling mendesak.

---

## 📌 Problem Statement
Pasca bencana, volume laporan dan keluhan dari pengungsi sangat tinggi, sehingga sulit bagi admin untuk memprosesnya secara manual. Hal ini menyebabkan risiko informasi kritis (seperti keluhan bantuan lambat atau medis) terlewatkan. PoskoLog hadir untuk mendigitalisasi proses ini, memberikan analisis sentimen instan, dan memetakan kebutuhan mendesak melalui dashboard terintegrasi.

## 🤖 Teknologi & Model
* **Model**: `w11wo/indonesian-roberta-base-sentiment-classifier`.
* **Arsitektur**: RoBERTa-base yang dioptimalkan untuk Bahasa Indonesia informal dan slang.
* **Interface**: Gradio dengan tema kustom Emerald.
* **Depedensi**: Python, Pandas, dan Matplotlib untuk visualisasi data.

---

## ✨ Fitur Utama
* **Zero-Login Interface**: Form pengaduan sederhana untuk pengungsi dengan respons otomatis ucapan terima kasih.
* **Smart Classification**: Klasifikasi otomatis ke dalam 3 kategori: **Positif/Pujian**, **Keluhan/Kritik**, dan **Netral/Pertanyaan**.
* **Dashboard Admin Dinamis**:
    * **Grafik Proporsi**: Visualisasi distribusi sentimen di seluruh posko.
    * **Tabel Top 10 Terintegrasi**: Menampilkan isi pesan, kategori sentimen, dan jumlah orang yang melaporkan masalah serupa dalam satu tampilan.
    * **Filter Sentimen**: Fitur untuk menyaring data spesifik (misal: hanya melihat Keluhan) agar admin dapat langsung mengambil tindakan.
* **Deployment Ready**: Dukungan penuh untuk Docker dan Docker Compose guna skalabilitas produksi.

---

## 📖 Cara Penggunaan

### Bagi Pengungsi (User)
1.  Buka aplikasi melalui tautan publik.
2.  Tuliskan aspirasi atau keluhan pada kolom "Sampaikan Pesan".
3.  Klik tombol **Kirim Pesan**. Sistem akan memberikan konfirmasi terima kasih.

### Bagi Petugas (Admin)
1.  Pindah ke tab **Dashboard Admin**.
2.  Gunakan **Filter Sentimen** untuk memilih kategori pesan yang ingin dianalisis.
3.  Klik **Refresh & Filter** untuk memperbarui grafik dan tabel 3 kolom.
4.  Pantau tabel **Top 10** untuk melihat isu apa yang paling banyak dilaporkan oleh masyarakat.
