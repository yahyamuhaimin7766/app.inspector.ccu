<template>
  <!-- HALAMAN LOGIN (Jika belum ada sesi) -->
  <div v-if="!currentUser" class="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 font-sans text-slate-800">
    <div class="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-slate-200">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-black tracking-tight text-slate-900 mb-1">ASTRA <span class="text-red-600">DAIHATSU</span></h1>
        <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">CCU IN QC System</p>
      </div>

      <h2 class="text-sm font-bold text-slate-700 text-center mb-4">Silakan pilih ID Stempel QC Anda</h2>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="qc in qcList"
          :key="qc"
          @click="handleLogin(qc)"
          class="bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-700 py-3 rounded-xl font-bold text-xs transition shadow-sm"
        >
          {{ qc }}
        </button>
      </div>
    </div>
    <div class="mt-6 text-slate-400 text-[10px] uppercase font-bold tracking-widest">Internal Process Only</div>
  </div>

  <!-- APLIKASI UTAMA (Setelah Login) -->
  <div v-else class="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
    <Navbar :qcId="currentUser" @logout="handleLogout">
      <button @click="toggleView" class="px-3.5 py-2 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition shadow-xs flex items-center gap-1.5">
        <svg v-if="currentView === 'form'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>{{ currentView === "form" ? "Riwayat" : "Input" }}</span>
      </button>
    </Navbar>

    <main class="flex-1 max-w-xl w-full mx-auto">
      <ClaimForm v-if="currentView === 'form'" :loading="loading" :editData="selectedItem" :qcId="currentUser" @submit="handleFormSubmit" @reset="handleResetForm" />

      <div v-else class="p-4 space-y-6 pb-28">
        <div class="flex justify-between items-center px-1 border-b border-slate-200 pb-4">
          <div>
            <h2 class="font-extrabold text-slate-900 text-lg">Data Inspeksi Saya</h2>
            <p class="text-xs text-slate-500">Stempel: {{ currentUser }} | Total: {{ myHistory.length }} unit</p>
          </div>
          <button @click="loadHistory" class="text-xs text-blue-600 font-bold hover:bg-blue-50 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" :class="{ 'animate-spin': historyLoading }">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Sync</span>
          </button>
        </div>

        <div v-if="historyLoading && myHistory.length === 0" class="text-center py-12 text-slate-400 text-sm">Menyinkronkan database...</div>
        <div v-else-if="myHistory.length === 0" class="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">Belum ada data tersimpan untuk ID Anda hari ini.</div>

        <div v-else class="space-y-4">
          <div v-for="(item, idx) in myHistory" :key="idx" class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs transition-all">
            <div class="flex justify-between items-start mb-1">
              <span class="font-mono font-bold text-slate-900 tracking-wide text-sm">{{ getVal(item, ["No Rangka", "no_rangka"]) }}</span>
              <div class="flex gap-1.5 flex-wrap justify-end">
                <span class="text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  {{ getVal(item, ["Tipe Kendaraan", "tipe"]) || "N/A" }}
                </span>
                <span class="text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {{ getVal(item, ["Warna", "warna"]) || "N/A" }}
                </span>
              </div>
            </div>

            <div class="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
              Defect: <span class="font-bold text-slate-800">{{ getVal(item, ["Defect", "defect"]) || "OK / Tidak ada" }}</span>
              <div class="text-[10px] text-slate-500 mt-0.5">Keterangan: {{ getVal(item, ["Keterangan Defect", "ket_defect"]) || "-" }}</div>
            </div>

            <div class="text-slate-400 text-[10px] flex justify-between pt-2 mt-1">
              <span>Diinput: {{ formatDate(getVal(item, ["Tanggal", "tanggal"])) }}</span>
              <span class="font-semibold text-slate-500">ID: {{ getVal(item, ["Stempel QC", "stempel_qc"]) }}</span>
            </div>

            <div class="flex gap-2 pt-3 border-t border-slate-100 mt-3">
              <button @click="handleEdit(item)" class="flex-1 bg-blue-50 text-blue-600 font-bold py-2 rounded-xl border border-blue-100 text-[11px] hover:bg-blue-100 transition shadow-xs flex justify-center items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
              <button @click="handleDelete(item)" class="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-xl border border-red-100 text-[11px] hover:bg-red-100 transition shadow-xs flex justify-center items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Hapus</span>
              </button>
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

const qcList = ["P-21", "P-18", "P-20", "P-17", "P-63", "P-62", "P-15", "P-54", "P-80", "P-70", "P-19", "P-52"];
const currentUser = ref(localStorage.getItem("qc_session") || null);

const currentView = ref("form");
const loading = ref(false);
const historyLoading = ref(false);
const history = ref([]);
const selectedItem = ref(null);

const handleLogin = (qc) => {
  localStorage.setItem("qc_session", qc);
  currentUser.value = qc;
  loadHistory();
};

const handleLogout = () => {
  Swal.fire({
    title: "Keluar?",
    text: "Sesi ID Anda akan ditutup.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Keluar",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("qc_session");
      currentUser.value = null;
      history.value = [];
      currentView.value = "form";
    }
  });
};

const getVal = (item, keys) => {
  for (let k of keys) {
    if (item[k] !== undefined && item[k] !== null && item[k] !== "") return item[k];
  }
  return "";
};

const getId = (item) => {
  return item["Timestamp"] || item["timestamp"] || item["0"] || Object.values(item)[0];
};

const myHistory = computed(() => {
  return history.value.filter((item) => getVal(item, ["Stempel QC", "stempel_qc"]) === currentUser.value);
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

  if (isEdit) {
    const idx = history.value.findIndex((h) => getId(h) === targetId);
    if (idx > -1) history.value[idx] = optimisticData;
  } else {
    history.value.unshift(optimisticData);
  }

  Swal.fire({ icon: "success", title: "Tersimpan!", timer: 1200, showConfirmButton: false });

  selectedItem.value = null;

  // PERUBAHAN: Tetap di halaman form setelah tombol simpan ditekan
  currentView.value = "form";

  loading.value = false;

  try {
    await submitClaimData(formData, isEdit ? "update" : "insert", targetId);
  } catch (err) {
    console.error("Background sync gagal", err);
    loadHistory();
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
    history.value = history.value.filter((h) => getId(h) !== idToDelete);
    try {
      await submitClaimData({}, "delete", idToDelete);
    } catch (err) {
      Swal.fire("Gagal!", "Terjadi kesalahan sinkronisasi server.", "error");
      loadHistory();
    }
  }
};

const loadHistory = async () => {
  historyLoading.value = true;
  history.value = await getClaimHistory();
  historyLoading.value = false;
};

onMounted(() => {
  if (currentUser.value) {
    loadHistory();
  }
});
</script>
