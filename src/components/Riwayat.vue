<template>
  <div class="p-4 md:p-6 space-y-6 max-w-xl mx-auto pb-28">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-extrabold text-slate-800">Riwayat Data Offline (HP)</h2>
      <button v-if="offlineList.length > 0" @click="uploadSemua" class="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        <span>Upload Semua ke Database</span>
      </button>
    </div>

    <!-- Tampilan Jika Kosong -->
    <div v-if="offlineList.length === 0" class="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-xs">
      <svg class="w-12 h-12 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        ></path>
      </svg>
      <p class="text-sm font-bold text-slate-700">Tidak ada data offline</p>
      <p class="text-xs text-slate-400">Semua data inspeksi sudah tersimpan di database atau belum ada input offline.</p>
    </div>

    <!-- Daftar Data Offline -->
    <div v-else class="space-y-3">
      <div v-for="(item, index) in offlineList" :key="item.id_lokal" class="bg-white border border-amber-300 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden">
        <div class="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">Belum Upload</div>

        <div class="flex items-start justify-between pr-16">
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tanggal: {{ item.tanggal }}</span>
            <h3 class="text-base font-mono font-bold text-slate-900 tracking-wide mt-0.5">{{ item.no_rangka }}</h3>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Tipe Kendaraan</span>
            <span class="font-bold text-indigo-900">{{ item.tipe }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Warna</span>
            <span class="font-bold text-slate-800">{{ item.warna }}</span>
          </div>
        </div>

        <div v-if="item.defect" class="text-xs text-red-600 bg-red-50 p-2 rounded-lg font-medium"><strong>Defect:</strong> {{ item.defect }} - {{ item.ket_defect }}</div>

        <!-- Tombol Aksi: Hapus dan Upload ke Database -->
        <div class="flex gap-2 pt-1">
          <button @click="hapusItemLokal(index)" class="flex-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold py-2.5 rounded-xl transition">Hapus</button>
          <button @click="uploadSatu(item, index)" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <span>Upload ke Database</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const offlineList = ref([]);

onMounted(() => {
  muatDataOffline();
});

const muatDataOffline = () => {
  const data = localStorage.getItem("qc_offline_data");
  if (data) {
    offlineList.value = JSON.parse(data);
  } else {
    offlineList.value = [];
  }
};

const hapusItemLokal = (index) => {
  if (confirm("Yakin ingin menghapus data ini dari memori HP?")) {
    offlineList.value.splice(index, 1);
    localStorage.setItem("qc_offline_data", JSON.stringify(offlineList.value));
  }
};

const uploadSatu = async (item, index) => {
  if (!navigator.onLine) {
    alert("Koneksi internet tidak tersedia! Pastikan Anda terhubung ke internet/WiFi sebelum meng-upload.");
    return;
  }

  try {
    // Masukkan logika API/Database Anda di sini
    // Contoh: await axios.post('/api/claim', item);

    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulasi proses jaringan

    // Hapus dari LocalStorage jika berhasil di-upload
    offlineList.value.splice(index, 1);
    localStorage.setItem("qc_offline_data", JSON.stringify(offlineList.value));

    alert("Data berhasil di-upload ke database pusat!");
  } catch (err) {
    alert("Gagal meng-upload data ke database. Coba beberapa saat lagi.");
  }
};

const uploadSemua = async () => {
  if (!navigator.onLine) {
    alert("Koneksi internet tidak tersedia!");
    return;
  }

  if (!confirm(`Memulai upload ${offlineList.value.length} data sekaligus ke database?`)) return;

  let sisaData = [...offlineList.value];
  let suksesCount = 0;

  for (let i = sisaData.length - 1; i >= 0; i--) {
    try {
      // Masukkan logika API/Database Anda di sini untuk setiap item
      await new Promise((resolve) => setTimeout(resolve, 400)); // Simulasi
      sisaData.splice(i, 1);
      suksesCount++;
    } catch (e) {
      break;
    }
  }

  offlineList.value = sisaData;
  localStorage.setItem("qc_offline_data", JSON.stringify(offlineList.value));

  alert(`Selesai! Berhasil meng-upload ${suksesCount} data ke database.`);
};
</script>
