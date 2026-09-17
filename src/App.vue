<template>
  <div class="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
    <Navbar>
      <button @click="toggleView" class="px-3.5 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition shadow-xs flex items-center gap-2">
        <svg v-if="currentView === 'form'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>{{ currentView === "form" ? "Lihat Riwayat" : "Form Input" }}</span>
      </button>
    </Navbar>

    <main class="flex-1 max-w-xl w-full mx-auto">
      <ClaimForm v-if="currentView === 'form'" :loading="loading" :editData="selectedItem" @submit="handleFormSubmit" @reset="handleResetForm" />

      <div v-else class="p-4 space-y-6 pb-28">
        <div class="flex justify-between items-center px-1">
          <div>
            <h2 class="font-extrabold text-slate-900 text-lg">Riwayat Scan Per QC</h2>
            <p class="text-xs text-slate-500">Total data terkumpul: {{ history.length }} unit</p>
          </div>
          <button @click="loadHistory" class="text-xs text-blue-600 font-bold hover:bg-blue-50 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" :class="{ 'animate-spin': historyLoading }">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ historyLoading ? "Menyinkronkan..." : "Refresh Data" }}</span>
          </button>
        </div>

        <div v-if="historyLoading && history.length === 0" class="text-center py-12 text-slate-400 text-sm">Memuat dari server...</div>
        <div v-else-if="history.length === 0" class="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">Belum ada data tersimpan.</div>

        <div v-else class="space-y-5">
          <div v-for="(items, qcName) in groupedHistory" :key="qcName" class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-600"></span>
                <h3 class="font-extrabold text-slate-800 text-sm">Stempel QC: {{ qcName }}</h3>
              </div>
              <span class="bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1 rounded-full">{{ items.length }} Unit</span>
            </div>

            <div class="p-3 space-y-2.5">
              <div v-for="(item, idx) in items" :key="idx" class="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs transition-all">
                <div class="flex justify-between items-start mb-1">
                  <span class="font-mono font-bold text-slate-900 tracking-wide text-[13px]">{{ getVal(item, ["No Rangka", "no_rangka"]) }}</span>
                  <div class="flex gap-1.5 flex-wrap justify-end">
                    <span class="text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                      {{ getVal(item, ["Tipe Kendaraan", "tipe"]) || "N/A" }}
                    </span>
                    <span class="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                      {{ getVal(item, ["Warna", "warna"]) || "N/A" }}
                    </span>
                  </div>
                </div>

                <div class="text-slate-600">
                  Defect: <span class="font-semibold text-slate-800">{{ getVal(item, ["Defect", "defect"]) || "Tidak ada" }}</span>
                </div>
                <div class="text-slate-400 text-[11px] flex justify-between pt-1 border-t border-slate-200/60">
                  <span>Ket: {{ getVal(item, ["Keterangan Defect", "ket_defect"]) || "-" }}</span>
                  <span>{{ formatDate(getVal(item, ["Tanggal", "tanggal"])) }}</span>
                </div>

                <div class="flex gap-2 pt-2 border-t border-slate-200/80 mt-2">
                  <button @click="handleEdit(item)" class="flex-1 bg-blue-50 text-blue-600 font-bold py-1.5 rounded-lg border border-blue-100 text-[10px] hover:bg-blue-100 transition shadow-xs flex justify-center items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>EDIT</span>
                  </button>
                  <button @click="handleDelete(item)" class="flex-1 bg-red-50 text-red-600 font-bold py-1.5 rounded-lg border border-red-100 text-[10px] hover:bg-red-100 transition shadow-xs flex justify-center items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>HAPUS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Navbar from "./components/Navbar.vue";
import ClaimForm from "./components/ClaimForm.vue";
import { submitClaimData, getClaimHistory } from "./services/api";
import Swal from "sweetalert2";

const currentView = ref("form");
const loading = ref(false);
const historyLoading = ref(false);
const history = ref([]); // Bertindak sebagai Local Database Super Cepat
const selectedItem = ref(null);

const getVal = (item, keys) => {
  for (let k of keys) {
    if (item[k] !== undefined && item[k] !== null && item[k] !== "") return item[k];
  }
  return "";
};

const getId = (item) => {
  return item["Timestamp"] || item["timestamp"] || item["0"] || Object.values(item)[0];
};

const groupedHistory = computed(() => {
  const groups = {};
  history.value.forEach((item) => {
    const qc = getVal(item, ["Stempel QC", "stempel_qc"]) || "TANPA QC";
    if (!groups[qc]) {
      groups[qc] = [];
    }
    groups[qc].push(item);
  });
  return groups;
});

const formatDate = (val) => {
  if (!val) return "";
  return String(val).slice(0, 10);
};

const toggleView = () => {
  if (currentView.value === "form") {
    selectedItem.value = null;
    currentView.value = "history";
  } else {
    currentView.value = "form";
  }
};

const handleResetForm = () => {
  selectedItem.value = null;
};

// --- LOGIKA OPTIMISTIC UI (0 Detik Latensi) ---
const handleFormSubmit = async (formData) => {
  loading.value = true;

  // 1. Persiapkan Data Baru Secara Lokal
  const isEdit = !!selectedItem.value;
  const targetId = isEdit ? getId(selectedItem.value) : new Date().getTime().toString();

  const optimisticData = {
    Timestamp: targetId,
    Tanggal: formData.tanggal,
    "No Rangka": formData.no_rangka,
    "Tipe Kendaraan": formData.tipe,
    Warna: formData.warna,
    KM: formData.km,
    "Kode Accu": formData.kode_accu,
    "Stempel QC": formData.stempel_qc,
    Defect: formData.defect,
    "Keterangan Defect": formData.ket_defect,
  };

  // 2. Ubah UI Seketika (Tanpa nunggu server)
  if (isEdit) {
    const idx = history.value.findIndex((h) => getId(h) === targetId);
    if (idx > -1) history.value[idx] = optimisticData;
  } else {
    history.value.unshift(optimisticData);
  }

  Swal.fire({ icon: "success", title: "Tersimpan!", text: "Data diproses di latar belakang.", timer: 1200, showConfirmButton: false });
  selectedItem.value = null;
  currentView.value = "history";
  loading.value = false; // Matikan loading UI

  // 3. Sync ke Server secara diam-diam (Background)
  try {
    await submitClaimData(formData, isEdit ? "update" : "insert", targetId);
  } catch (err) {
    console.error("Background sync gagal", err);
    loadHistory(); // Tarik ulang jika gagal agar UI tidak out-of-sync
  }
};

const handleEdit = (item) => {
  selectedItem.value = item;
  currentView.value = "form";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleDelete = async (item) => {
  const idToDelete = getId(item);
  const noRangka = getVal(item, ["No Rangka", "no_rangka"]);

  const confirm = await Swal.fire({
    title: "Hapus Data?",
    text: `Hapus data VIN ${noRangka}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus",
  });

  if (confirm.isConfirmed) {
    // 1. Hapus dari UI Seketika
    history.value = history.value.filter((h) => getId(h) !== idToDelete);

    // 2. Sync ke Server di Background
    try {
      await submitClaimData({}, "delete", idToDelete);
    } catch (err) {
      Swal.fire("Gagal!", "Terjadi kesalahan sinkronisasi server.", "error");
      loadHistory(); // Revert perubahan UI
    }
  }
};

const loadHistory = async () => {
  historyLoading.value = true;
  history.value = await getClaimHistory();
  historyLoading.value = false;
};

// Tarik data hanya 1x saat aplikasi pertama dibuka
onMounted(() => {
  loadHistory();
});
</script>
