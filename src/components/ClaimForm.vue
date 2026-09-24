<template>
  <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-w-xl mx-auto pb-28">
    
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tanggal *</label>
      <input type="date" v-model="form.tanggal" required class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
    </div>

    <!-- No Rangka + Kamera Geometric OCR -->
    <div class="space-y-1.5">
      <div class="flex justify-between items-center">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">No Rangka (VIN) *</label>
      </div>

      <div class="relative w-full mb-2">
        <input 
          type="file" 
          id="cameraInput" 
          accept="image/*" 
          capture="environment" 
          @change="executeGeometricPipeline"
          class="hidden"
          :disabled="isProcessing"
        />
        
        <label 
          for="cameraInput" 
          class="w-full text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg cursor-pointer transition border-2"
          :class="isProcessing ? 'bg-slate-800 border-slate-600 pointer-events-none' : (pipelineError ? 'bg-red-900 hover:bg-red-800 border-red-500' : 'bg-slate-900 hover:bg-slate-800 border-blue-500')"
        >
          <div v-if="!isProcessing" class="flex flex-col items-center">
            <svg class="w-8 h-8 mb-1" :class="pipelineError ? 'text-red-400' : 'text-blue-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-sm text-center px-4">{{ pipelineError ? 'Label VIN tidak ditemukan. Foto Ulang' : 'Buka Kamera (Geometric OCR)' }}</span>
            <span class="text-[10px] text-slate-400 font-normal">Spatial Label-Value Pairing Active</span>
          </div>

          <div v-else class="flex flex-col items-center gap-2 w-full px-6">
            <div class="flex items-center gap-3">
              <span class="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
              <span class="text-sm font-bold text-blue-100">Memproses...</span>
            </div>
            <span class="text-[10px] text-blue-300 font-mono text-center">{{ pipelineStatus }}</span>
          </div>
        </label>
      </div>

      <div class="relative">
        <input type="text" v-model="form.no_rangka" placeholder="Scan OCR atau ketik VIN manual..." required class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs font-mono tracking-wide font-bold" />
      </div>
    </div>

    <!-- Tipe Kendaraan -->
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tipe & Varian Kendaraan *</label>
      <input type="text" v-model="form.tipe" placeholder="Otomatis atau ketik manual..." required class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs font-bold" :class="{'text-indigo-800 bg-indigo-50 border-indigo-300': form.tipe}" />
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
        <input type="number" v-model="form.km" placeholder="Contoh: 86" class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
      </div>
      <div class="space-y-1.5">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Kode Accu</label>
        <input type="text" v-model="form.kode_accu" placeholder="Kode Accu" class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Defect</label>
      <input type="text" v-model="form.defect" placeholder="Jenis kerusakannya..." class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
    </div>

    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Keterangan Defect</label>
      <textarea v-model="form.ket_defect" rows="3" placeholder="Contoh: RR LH, bocor, terlipat" class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"></textarea>
    </div>

    <!-- Actions -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 flex gap-3 max-w-xl mx-auto z-20 shadow-lg">
      <button type="button" @click="handleReset" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-xl transition">Batal</button>
      <button type="submit" :disabled="loading || isProcessing" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
        <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ loading ? "Memproses..." : editData ? "Update Data" : "Simpan Data" }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, watch } from "vue";

const props = defineProps({
  loading: Boolean,
  editData: Object,
  qcId: String,
});
const emit = defineEmits(["submit", "reset"]);

const options = {
  warna: ["BLACK", "WHITE", "SILVER", "RED", "YELLOW", "GREY", "BRONZE", "ORANGE"],
};

const masterNik = {
  MHKV5EA1J: "XENIA X 1.3", MHKV5EA2J: "XENIA R", MHKV5EB1J: "XENIA X", MHKV5EB2J: "XENIA R",
  MHKV5FA2J: "XENIA R-1.5", MHKV5FB2J: "XENIA R-1.5", MHKG8FA1J: "TERIOS X", MHKG8FA2J: "TERIOS R",
  MHKG8FB1J: "TERIOS X", MHKG8FB2J: "TERIOS R", MHKV3BA3J: "MINIBUS 1.3 FH", MHKV3BA6J: "MINIBUS 1.3 FF FH",
  MHKW3CA1J: "LUXIO D", MHKW3CA3J: "LUXIO X", MHKW3CB3J: "LUXIO X", MHKB3BA1J: "BLINDVAN 1.3", 
  MHKB3CA1J: "BLINDVAN 1.3", MHKS4DA1J: "AYLA D+", MHKS4DA3J: "AYLA X", MHKS4GB5J: "AYLA R-1.2",
  MHKS6DJ1J: "SIGRA D", MHKS6GJ6J: "SIGRA R", PM2M804S1: "SIRION STD", MHKP3BA1J: "PICK UP 1.3", 
  MHKT3CA1J: "PICK UP 1.5 3W", MHKAA1AA1: "ROCKY R", MHKAB1AA0: "ROCKY 1.2"
};

const getTodayDate = () => new Date().toISOString().split("T")[0];
const getInitialForm = () => ({ tanggal: getTodayDate(), no_rangka: "", tipe: "", warna: "", km: "", kode_accu: "", defect: "", ket_defect: "" });
const form = reactive(getInitialForm());

const isProcessing = ref(false);
const pipelineStatus = ref("");
const pipelineError = ref(false); 

watch(() => props.editData, (newData) => {
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
}, { immediate: true });

watch(() => form.no_rangka, (newVal) => {
  if (newVal) {
    const cleanVal = newVal.replace(/\s/g, "").toUpperCase(); 
    if (cleanVal.length >= 9) {
      const prefix = cleanVal.substring(0, 9);
      if (masterNik[prefix]) form.tipe = masterNik[prefix]; 
    }
  } else if (!props.editData && !newVal) {
    form.tipe = "";
  }
});

/* ====================================================================
   1. GEOMETRIC SEARCH (FIELD ASSOCIATION)
==================================================================== */
function calculateSimilarity(str1, str2) {
  let matches = 0;
  let len = Math.min(str1.length, str2.length);
  for (let i = 0; i < len; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  return matches / Math.max(str1.length, str2.length);
}

// Mencari koordinat baris yang berisi judul label VIN
function findVinLabel(lines) {
  const targetLabels = [
    "VEHICLE IDENTIFICATION NUMBER", 
    "VEHICLE IDENTIFICATION NO", 
    "VEHICLE IDENTIFICATION",
    "IDENTIFICATION NUMBER"
  ];
  
  let bestLabel = null;
  let bestScore = 0;

  for (let line of lines) {
    let cleanText = line.LineText.toUpperCase().replace(/[^A-Z]/g, '');
    
    for (let target of targetLabels) {
      let cleanTarget = target.replace(/[^A-Z]/g, '');
      
      // Deteksi: Apakah string target ada di dalam line ini, atau similarity-nya tinggi
      if (cleanText.includes(cleanTarget) || calculateSimilarity(cleanText, cleanTarget) > 0.75) {
        // Line ini adalah Label "VEHICLE IDENTIFICATION NUMBER"
        bestLabel = line;
        bestScore = 1; 
        break; 
      }
    }
    if (bestScore === 1) break;
  }
  return bestLabel;
}

// Mencari baris yang secara geometri berada tepat di bawah label
function findValueNearLabel(lines, labelBox) {
  let bestCandidate = null;
  let minDistance = Infinity;
  
  const labelBottomY = labelBox.MinTop + labelBox.MaxHeight;
  const labelCenterX = labelBox.MinLeft + (labelBox.MaxWidth / 2);

  for (let line of lines) {
    // Skip dirinya sendiri
    if (line === labelBox) continue;

    // 1. Cek Posisi Vertikal (Harus berada di bawah label, tapi tidak lebih jauh dari tinggi 4 baris)
    const distanceY = line.MinTop - labelBottomY;
    if (distanceY < -10 || distanceY > (labelBox.MaxHeight * 4)) continue;

    // 2. Cek Posisi Horizontal (Tengahnya harus sejajar / berada di area kotak label)
    const lineCenterX = line.MinLeft + (line.MaxWidth / 2);
    const distanceX = Math.abs(lineCenterX - labelCenterX);
    
    // Syarat 1: Harus di bawah. Syarat 2: Jarak horizontal tidak terlalu melenceng
    if (distanceX < (labelBox.MaxWidth * 0.8)) {
      // Kandidat ini masuk akal. Cari yang paling dekat secara vertikal.
      if (distanceY < minDistance) {
        minDistance = distanceY;
        bestCandidate = line;
      }
    }
  }

  return bestCandidate;
}


/* ====================================================================
   2. CANDIDATE GENERATION & VALIDATION
==================================================================== */
const CONFUSION_MAP = {
  'S': ['3', '5'], '5': ['S', '3'], '3': ['S', '5'],
  'B': ['8'], '8': ['B'], 'Z': ['2'], '2': ['Z'],
  'G': ['6'], '6': ['G'], 'O': ['0'], 'Q': ['0'], 'D': ['0'],
  'I': ['1'], 'L': ['1'], '!': ['1'], '|': ['1']
};

function scoreVinCandidate(vin, isMutated = false) {
  let score = 0;
  if (vin.length === 17) score += 30;
  if (!/[IOQ]/.test(vin)) score += 10;
  else score -= 30; 

  const prefix = vin.substring(0, 9);
  if (masterNik[prefix]) score += 50; 
  else if (vin.startsWith('MHK') || vin.startsWith('PM2')) score += 20; 

  if (vin.length >= 5 && /[0-9]/.test(vin[4])) score += 15;
  if (isMutated) score -= 5;

  return score;
}

function processVinExtraction(rawObservation) {
  let baseStr = rawObservation.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (baseStr.length > 17 && (baseStr.startsWith('MHK') || baseStr.startsWith('PM2'))) {
    baseStr = baseStr.substring(0, 17);
  }

  let candidates = [];
  candidates.push({ text: baseStr, score: scoreVinCandidate(baseStr, false) });

  // Mutasi
  let chars = baseStr.split('');
  let mutationCount = 0;
  for (let i = 0; i < chars.length; i++) {
    if (mutationCount > 2) break; 
    let char = chars[i];
    if (CONFUSION_MAP[char]) {
      CONFUSION_MAP[char].forEach(altChar => {
        let mutatedArr = [...chars];
        mutatedArr[i] = altChar;
        let mutatedStr = mutatedArr.join('');
        candidates.push({ text: mutatedStr, score: scoreVinCandidate(mutatedStr, true) });
      });
      mutationCount++;
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]; // Kembalikan skor mutasi tertinggi untuk observation ini
}


/* ====================================================================
   3. API EXECUTION
==================================================================== */
async function callOCRSensor(base64Image) {
  const formData = new FormData();
  formData.append("base64Image", base64Image);
  formData.append("apikey", "helloworld");
  formData.append("OCREngine", "2"); 
  formData.append("scale", "true");
  // isOverlayRequired akan mengembalikan koordinat geometris Bounding Box per baris
  formData.append("isOverlayRequired", "true"); 

  try {
    const response = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: formData });
    return await response.json();
  } catch (err) {
    console.error("API Fetch Error:", err);
    return null;
  }
}


/* ====================================================================
   4. MAIN PIPELINE (GEOMETRY ASSOCIATION)
==================================================================== */
const executeGeometricPipeline = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isProcessing.value = true;
  pipelineError.value = false;
  pipelineStatus.value = "Memuat Gambar...";

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      try {
        pipelineStatus.value = "Preprocessing...";
        
        // Resize utuh tanpa crop
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Grayscale filter
        const imgData = ctx.getImageData(0, 0, width, height);
        for (let i = 0; i < imgData.data.length; i += 4) {
          let avg = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
          imgData.data[i] = avg; imgData.data[i+1] = avg; imgData.data[i+2] = avg;
        }
        ctx.putImageData(imgData, 0, 0);
        const b64 = canvas.toDataURL('image/jpeg', 0.8);

        pipelineStatus.value = "Memanggil OCR dengan Bounding Box...";
        const resultJSON = await callOCRSensor(b64);
        
        if (!resultJSON || !resultJSON.ParsedResults || resultJSON.ParsedResults.length === 0) {
          throw new Error("Gagal membaca teks.");
        }

        const lines = resultJSON.ParsedResults[0].TextOverlay?.Lines;
        if (!lines || lines.length === 0) {
           pipelineError.value = true;
           alert("Sistem OCR tidak dapat memetakan posisi teks. Silakan coba lagi.");
           return;
        }

        pipelineStatus.value = "Mencari Label VIN...";
        const labelBox = findVinLabel(lines);

        if (!labelBox) {
           // Field Identification Gagal
           pipelineError.value = true;
           alert("Label 'VEHICLE IDENTIFICATION NUMBER' tidak ditemukan. Pastikan area label terfoto dengan jelas.");
           return;
        }

        pipelineStatus.value = "Mengekstrak Nilai di Bawah Label...";
        const valueBox = findValueNearLabel(lines, labelBox);

        if (!valueBox) {
           pipelineError.value = true;
           alert("Label VIN ditemukan, tetapi nilainya terpotong atau kosong. Silakan foto ulang.");
           return;
        }

        pipelineStatus.value = "Validasi dan Character Correction...";
        const rawVinObservation = valueBox.LineText;
        const bestCandidate = processVinExtraction(rawVinObservation);

        // KEPUTUSAN FINAL
        if (bestCandidate.score >= 50) {
          form.no_rangka = bestCandidate.text;
          
          // Tebak warna dari seluruh teks dokumen
          const rawAll = resultJSON.ParsedResults[0].ParsedText.toUpperCase();
          for (let w of options.warna) {
            if (rawAll.includes(w)) { form.warna = w; break; }
          }
          try { navigator.vibrate([100, 50, 100]); } catch(v){}
        } else {
          pipelineError.value = true;
          alert(`VIN terdeteksi: ${bestCandidate.text}\nConfidence rendah. Silakan periksa kembali atau foto ulang.`);
        }

      } catch (err) {
        pipelineError.value = true;
        alert("Pipeline error atau koneksi terputus.");
      } finally {
        isProcessing.value = false;
        pipelineStatus.value = "";
        event.target.value = ""; 
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleSubmit = () => {
  if (!form.no_rangka) return alert("Isi No Rangka (VIN)!");
  if (!form.tipe) return alert("Isi Tipe & Varian Kendaraan!");
  if (!form.warna) return alert("Pilih Warna!");
  emit("submit", { ...form, stempel_qc: props.qcId });
  Object.assign(form, getInitialForm());
  pipelineError.value = false;
};

const handleReset = () => {
  Object.assign(form, getInitialForm());
  pipelineError.value = false;
  emit("reset");
};
</script>