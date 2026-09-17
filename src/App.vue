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
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        <div v-if="historyLoading" class="text-center py-12 text-slate-400 text-sm">Memuat data dari Google Sheets...</div>
        <div v-else-if="history.length === 0" class="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">Belum ada data tersimpan.</div>

        <div v-else class="space-y-5">
          <div v-for="(items, qcName) in groupedHistory" :key="qcName" class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-600"></span>
                <h3 class="font-extrabold text-slate-800 text-sm">Stempel QC: {{ qcName }}</h3>
              </div>
              <span class="bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1 rounded-full"> {{ items.length }} Unit </span>
            </div>

            <div class="p-3 space-y-2.5">
              <div v-for="(item, idx) in items" :key="idx" class="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
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

                <!-- TOMBOL EDIT DAN HAPUS -->
                <div class="flex gap-2 pt-2 border-t border-slate-200/80 mt-2">
                  <button @click="handleEdit(item)" class="flex-1 bg-blue-50 text-blue-600 font-bold py-1.5 rounded-lg border border-blue-100 text-[10px] hover:bg-blue-100 transition shadow-xs flex justify-center items-center gap-1">
                    ✏️ EDIT
                  </button>
                  <button @click="handleDelete(item)" class="flex-1 bg-red-50 text-red-600 font-bold py-1.5 rounded-lg border border-red-100 text-[10px] hover:bg-red-100 transition shadow-xs flex justify-center items-center gap-1">
                    🗑️ HAPUS
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
const history = ref([]);
const selectedItem = ref(null);

const getVal = (item, keys) => {
  for (let k of keys) {
    if (item[k] !== undefined && item[k] !== null && item[k] !== "") return item[k];
  }
  return "";
};

// Fungsi aman untuk mengambil ID Unik dari berbagai variasi nama kolom Spreadsheet
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

const handleFormSubmit = async (formData) => {
  loading.value = true;
  try {
    let res;
    if (selectedItem.value) {
      const idToUpdate = getId(selectedItem.value);
      res = await submitClaimData(formData, "update", idToUpdate);
    } else {
      res = await submitClaimData(formData, "insert");
    }

    if (res.status === "success") {
      Swal.fire({ icon: "success", title: "Berhasil!", text: res.message, timer: 1500, showConfirmButton: false });
      selectedItem.value = null;
      loadHistory();
      currentView.value = "history";
    } else {
      throw new Error(res.message);
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: "Gagal", text: err.message || "Koneksi bermasalah" });
  } finally {
    loading.value = false;
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
    text: `Anda yakin ingin menghapus data VIN ${noRangka}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  });

  if (confirm.isConfirmed) {
    historyLoading.value = true;
    try {
      const res = await submitClaimData({}, "delete", idToDelete);
      if (res.status === "success") {
        Swal.fire({ icon: "success", title: "Terhapus!", text: "Data berhasil dihapus.", timer: 1500, showConfirmButton: false });
        loadHistory();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
      historyLoading.value = false;
    }
  }
};

const loadHistory = async () => {
  historyLoading.value = true;
  history.value = await getClaimHistory();
  historyLoading.value = false;
};

onMounted(() => {
  loadHistory();
});
</script>
