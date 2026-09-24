<template>
  <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-w-xl mx-auto pb-28">
    
    <!-- SAKLAR MODE ONLINE / OFFLINE -->
    <div class="flex bg-slate-200 p-1 rounded-xl shadow-inner">
      <button 
        type="button" 
        @click="isOfflineMode = false" 
        :class="!isOfflineMode ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-300'" 
        class="flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-1.5"
      >
        <svg v-if="!isOfflineMode" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>Mode Kamera (Smart OCR)</span>
      </button>
      <button 
        type="button" 
        @click="isOfflineMode = true" 
        :class="isOfflineMode ? 'bg-white shadow text-amber-600' : 'text-slate-500 hover:bg-slate-300'" 
        class="flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-1.5"
      >
        <svg v-if="isOfflineMode" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path></svg>
        <span>Mode Manual (Ketik)</span>
      </button>
    </div>

    <div v-if="isOfflineMode" class="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
      <svg class="w-5 h-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      <span>Mode Manual Aktif. Input dilakukan dengan mengetik dan disimpan ke memori HP.</span>
    </div>

    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tanggal *</label>
      <input type="date" v-model="form.tanggal" required class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
    </div>

    <!-- No Rangka + Tombol Kamera -->
    <div class="space-y-1.5">
      <div class="flex justify-between items-center">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">No Rangka (VIN) *</label>
      </div>

      <div v-if="!isOfflineMode" class="relative w-full mb-2">
        <input 
          type="file" 
          id="cameraInput" 
          accept="image/*" 
          capture="environment" 
          @change="handleAdvancedOCR"
          class="hidden"
          :disabled="isProcessing"
        />
        
        <label 
          for="cameraInput" 
          class="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg cursor-pointer hover:bg-slate-800 transition border-2 border-blue-500"
          :class="{'opacity-75 pointer-events-none': isProcessing}"
        >
          <div v-if="!isProcessing" class="flex flex-col items-center">
            <svg class="w-8 h-8 text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-sm">Buka Kamera HP (Hybrid Engine)</span>
            <span class="text-[10px] text-slate-400 font-normal">Candidate Validation & Confusion Map Aktif</span>
          </div>

          <div v-else class="flex flex-col items-center gap-2">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Memproses Gambar...</span>
            </div>
            <span class="text-[10px] text-blue-300 font-mono">{{ ocrStatus }}</span>
          </div>
        </label>
      </div>

      <div class="relative">
        <input type="text" v-model="form.no_rangka" :placeholder="isOfflineMode ? 'Ketik No Rangka manual...' : 'Scan VIN atau ketik manual...'" required class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs font-mono tracking-wide font-bold" />
      </div>
    </div>

    <!-- Tipe Kendaraan -->
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tipe & Varian Kendaraan *</label>
      <input type="text" v-model="form.tipe" placeholder="Ketik tipe kendaraan..." required class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs font-bold" :class="{'text-indigo-800 bg-indigo-50 border-indigo-300': form.tipe}" />
    </div>

    <!-- Warna Grid -->
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Warna *</label>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="w in options.warna"
          :key="w"
          type="button"
          @click="form.warna = w"
          :class="[
            'py-2.5 px-2 text-xs font-bold rounded-xl border transition shadow-xs',
            form.warna === w ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-500/25 scale-[1.02]' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50',
          ]"
        >
          {{ w }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">KM / ODO</label>
        <input type="number" v-model="form.km" placeholder="Contoh: 86" class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
      </div>
      <div class="space-y-1.5">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Kode Accu</label>
        <input type="text" v-model="form.kode_accu" placeholder="Kode Accu" class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Defect</label>
      <input type="text" v-model="form.defect" placeholder="Jenis kerusakannya..." class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
    </div>

    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Keterangan Defect</label>
      <textarea v-model="form.ket_defect" rows="3" placeholder="Contoh: RR LH, bocor, terlipat" class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs"></textarea>
    </div>

    <!-- Bottom Actions -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 flex gap-3 max-w-xl mx-auto z-20 shadow-lg">
      <button type="button" @click="handleReset" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-xl transition">Batal</button>
      <button type="submit" :disabled="loading || isProcessing" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
        <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ loading ? "Memproses..." : editData ? "Update Data" : "Simpan Data" }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import Tesseract from 'tesseract.js';

const props = defineProps({
  loading: Boolean,
  editData: Object,
  qcId: String,
});
const emit = defineEmits(["submit", "reset"]);

const options = {
  warna: ["BLACK", "WHITE", "SILVER", "RED", "YELLOW", "GREY", "BRONZE", "ORANGE"],
};

// Master NIK
const masterNik = {
  MHKV5EA1J: "XENIA X 1.3", MHKV5EA2J: "XENIA R", MHKV5EB1J: "XENIA X", MHKV5EB2J: "XENIA R",
  MHKV5FA2J: "XENIA R-1.5", MHKV5FB2J: "XENIA R-1.5", MHKG8FA1J: "TERIOS X", MHKG8FA2J: "TERIOS R",
  MHKG8FB1J: "TERIOS X", MHKG8FB2J: "TERIOS R", MHKV3BA3J: "MINIBUS 1.3 FH", MHKV3BA6J: "MINIBUS 1.3 FF FH",
  MHKV3CA3J: "MINIBUS 1.5 PS FH", MHKW3CA1J: "LUXIO D", MHKW3CA3J: "LUXIO X",
  MHKW3CB3J: "LUXIO X", MHKB3BA1J: "BLINDVAN 1.3", MHKB3CA1J: "BLINDVAN 1.3", MHKS4DA1J: "AYLA D+",
  MHKS4DA2J: "AYLA M", MHKS4DA3J: "AYLA X", MHKS4DB2J: "AYLA M", MHKS4DB3J: "AYLA X",
  MHKS4GA4J: "AYLA X-1.2", MHKS4GA5J: "AYLA R-1.2", MHKS4GB4J: "AYLA X-1.2", MHKS4GB5J: "AYLA R-1.2",
  MHKS6DJ1J: "SIGRA D", MHKS6DJ2J: "SIGRA M", MHKS6GJ3J: "SIGRA X", MHKS6GJ6J: "SIGRA R",
  MHKS6GK6J: "SIGRA R", MHKS6GK3J: "SIGRA X", PM2M804S1: "SIRION STD", MHKB3FA1J: "BLINDVAN 1.5",
  MHKP3BA1J: "PICK UP 1.3", MHKT3CA1J: "PICK UP 1.5 3W", MHKT3BA1J: "PICK UP 1.3 3W", MHKP3FA1J: "PICK UP 1.5 STD",
  MHKAA1AA1: "ROCKY R", MHKAA1AA2: "ROCKY R", MHKAB1AA0: "ROCKY 1.2"
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

const getInitialForm = () => ({
  tanggal: getTodayDate(),
  no_rangka: "",
  tipe: "",
  warna: "",
  km: "",
  kode_accu: "",
  defect: "",
  ket_defect: "",
});

const form = reactive(getInitialForm());
const isProcessing = ref(false);
const ocrStatus = ref("");
const isOfflineMode = ref(false);

watch(
  () => props.editData,
  (newData) => {
    if (newData) {
      form.tanggal = newData["Tanggal"] || newData["tanggal"] || getTodayDate();
      form.no_rangka = newData["No Rangka"] || newData["no_rangka"] || "";
      form.tipe = newData["Tipe Kendaraan"] || newData["tipe"] || "";
      form.warna = newData["Warna"] || newData["warna"] || "";
      form.km = newData["KM"] || newData["km"] || "";
      form.kode_accu = newData["Kode Accu"] || newData["kode_accu"] || "";
      form.defect = newData["Defect"] || newData["defect"] || "";
      form.ket_defect = newData["Keterangan Defect"] || newData["ket_defect"] || "";
    } else {
      Object.assign(form, getInitialForm());
    }
  },
  { immediate: true }
);

watch(
  () => form.no_rangka,
  (newVal) => {
    if (newVal && !isOfflineMode.value) {
      const cleanVal = newVal.replace(/\s/g, "").toUpperCase(); 
      if (cleanVal.length >= 9) {
        const prefix = cleanVal.substring(0, 9);
        if (masterNik[prefix]) form.tipe = masterNik[prefix]; 
      }
    } else if (!props.editData && !newVal) {
      form.tipe = "";
    }
  }
);

// ==========================================
// ADVANCED OCR PIPELINE & CANDIDATE LOGIC
// ==========================================

const VIN_PREFIXES = ['MHK', 'PM2'];
const CONFUSION_MAP = {
  'S': ['3', '5'],
  'B': ['8'],
  '8': ['B'],
  'Z': ['2'],
  'G': ['6'],
  'I': ['1'],
  'O': ['0'],
  'Q': ['0']
};

function evaluateCandidate(vinString, ocrConfidence) {
  let score = 0;
  if (vinString.length === 17) score += 40;
  
  const hasValidPrefix = VIN_PREFIXES.some(p => vinString.startsWith(p));
  if (hasValidPrefix) score += 30;

  if (!/[IOQ]/.test(vinString)) score += 10;
  
  // Rule Khusus VDS Daihatsu (Karakter ke-5 adalah Angka)
  if (vinString.length > 5 && /[0-9]/.test(vinString[4])) {
    score += 15;
  }

  score += (ocrConfidence / 100) * 20;
  return score;
}

function generateCandidates(rawText, confidence) {
  let baseString = rawText.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  // Ambil substring VIN jika ditemukan di tengah teks yang kotor
  let mhkIdx = baseString.indexOf("MHK");
  if (mhkIdx === -1) mhkIdx = baseString.indexOf("PM2");
  if (mhkIdx !== -1) {
    baseString = baseString.substring(mhkIdx, mhkIdx + 17);
  }

  let candidates = [{ text: baseString, score: evaluateCandidate(baseString, confidence) }];

  if (candidates[0].score > 90 && baseString.length === 17) return candidates;

  let arr = baseString.split('');
  for (let i = 0; i < arr.length; i++) {
    let char = arr[i];
    if (CONFUSION_MAP[char]) {
      CONFUSION_MAP[char].forEach(replacement => {
        let newVariant = [...arr];
        newVariant[i] = replacement;
        let newVin = newVariant.join('');
        candidates.push({
          text: newVin,
          score: evaluateCandidate(newVin, confidence * 0.95) // Penalty tipis karena hasil tebakan
        });
      });
    }
  }
  return candidates;
}

function getCanvasVariant(img, type) {
  const canvas = document.createElement('canvas');
  // Crop 80% width, 30% height di tengah untuk fokus ke baris VIN
  const cWidth = img.width * 0.8;
  const cHeight = img.height * 0.3;
  canvas.width = cWidth;
  canvas.height = cHeight;
  
  const ctx = canvas.getContext('2d');
  const startX = (img.width - cWidth) / 2;
  const startY = (img.height - cHeight) / 2;
  
  ctx.drawImage(img, startX, startY, cWidth, cHeight, 0, 0, cWidth, cHeight);
  
  const imageData = ctx.getImageData(0, 0, cWidth, cHeight);
  const data = imageData.data;

  if (type === 'grayscale' || type === 'otsu') {
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      avg = avg < 128 ? avg * 0.8 : avg * 1.2; 
      if (avg > 255) avg = 255;
      
      if (type === 'otsu') {
        avg = avg > 120 ? 255 : 0; 
      }
      
      data[i] = avg; data[i + 1] = avg; data[i + 2] = avg;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 1.0);
}

// MAIN CAMERA HANDLER
const handleAdvancedOCR = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isProcessing.value = true;
  ocrStatus.value = "Menyiapkan Gambar...";

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      
      // Kompresi jika terlalu besar
      const MAX_WIDTH = 1200;
      if (img.width > MAX_WIDTH) {
        const ratio = MAX_WIDTH / img.width;
        img.width = MAX_WIDTH;
        img.height = img.height * ratio;
      }

      ocrStatus.value = "Membuat Image Variant...";
      const variants = [
        getCanvasVariant(img, 'grayscale'),
        getCanvasVariant(img, 'otsu')
      ];

      try {
        ocrStatus.value = "Memulai Mesin Tesseract...";
        const worker = await Tesseract.createWorker({
          logger: m => {
            if (m.status === 'recognizing text') {
              ocrStatus.value = `Membaca Teks: ${Math.round(m.progress * 100)}%`;
            }
          }
        });
        
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        await worker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
        });

        let allCandidates = [];

        for (let i = 0; i < variants.length; i++) {
          ocrStatus.value = `Menganalisa Varian ${i+1}/${variants.length}...`;
          const { data: { text, confidence } } = await worker.recognize(variants[i]);
          
          let generated = generateCandidates(text, confidence);
          allCandidates = allCandidates.concat(generated);
        }

        await worker.terminate();

        ocrStatus.value = "Validasi & Scoring Kandidat...";
        allCandidates.sort((a, b) => b.score - a.score);

        if (allCandidates.length > 0 && allCandidates[0].score > 50) {
          form.no_rangka = allCandidates[0].text;
          try { navigator.vibrate(200); } catch (v) {}
        } else {
          alert("Gagal memvalidasi struktur VIN. Silakan ketik manual sisa digitnya.");
        }

      } catch (err) {
        alert("Terjadi kesalahan pada mesin Tesseract lokal.");
        console.error(err);
      } finally {
        isProcessing.value = false;
        ocrStatus.value = "";
        event.target.value = ""; 
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// ==========================================
// SUBMIT LOGIC (Offline / Online)
// ==========================================
const handleSubmit = () => {
  if (!form.no_rangka) {
    alert("Isi No Rangka (VIN)!");
    return;
  }
  if (!form.tipe) {
    alert("Isi Tipe & Varian Kendaraan!");
    return;
  }
  if (!form.warna) {
    alert("Pilih Warna!");
    return;
  }

  if (isOfflineMode.value) {
    const existingOfflineData = JSON.parse(localStorage.getItem("qc_offline_data") || "[]");
    const offlineItem = {
      ...form,
      id_lokal: Date.now(),
      stempel_qc: props.qcId,
      status: "Belum Upload"
    };
    
    existingOfflineData.unshift(offlineItem);
    localStorage.setItem("qc_offline_data", JSON.stringify(existingOfflineData));

    alert("Data berhasil disimpan secara offline di memori HP. Cek menu Riwayat untuk upload.");
    Object.assign(form, getInitialForm());
    emit("reset");
  } else {
    emit("submit", { ...form, stempel_qc: props.qcId });
    Object.assign(form, getInitialForm());
  }
};

const handleReset = () => {
  Object.assign(form, getInitialForm());
  emit("reset");
};
</script>