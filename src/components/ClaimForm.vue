<template>
  <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-w-xl mx-auto pb-28">
    
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tanggal *</label>
      <input type="date" v-model="form.tanggal" required class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
    </div>

    <!-- No Rangka + Kamera Hybrid OCR -->
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
          @change="executeRobustPipeline"
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
            <span class="text-sm text-center px-4">{{ pipelineError ? 'VIN Tidak Yakin. Foto Ulang' : 'Buka Kamera (Robust OCR)' }}</span>
            <span class="text-[10px] text-slate-400 font-normal">ROI & Candidate Scoring Active</span>
          </div>

          <div v-else class="flex flex-col items-center gap-2 w-full px-6">
            <div class="flex items-center gap-3">
              <span class="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
              <span class="text-sm font-bold text-blue-100">Memproses...</span>
            </div>
            <!-- Progress Bar Text -->
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

// Digunakan sebagai Ground Truth / Pattern Validator
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
const pipelineError = ref(false); // Flag untuk indikasi confidence rendah

// Watchers untuk Edit Data dan Auto-Fill Tipe
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
   ROBUST VIN OCR ENGINE
   Menerapkan arsitektur Noisy Sensor -> Candidate Gen -> Scoring
==================================================================== */

// Map Kebingungan Karakter (Confusion Matrix)
const CONFUSION_MAP = {
  'S': ['3', '5'], '5': ['S', '3'], '3': ['S', '5'],
  'B': ['8'], '8': ['B'],
  'Z': ['2'], '2': ['Z'],
  'G': ['6'], '6': ['G'],
  'O': ['0'], 'Q': ['0'], 'D': ['0'],
  'I': ['1'], 'L': ['1'], '!': ['1'], '|': ['1']
};

/**
 * 1. SCORING FUNCTION
 * Menilai kualitas sebuah string kandidat VIN secara objektif
 */
function scoreVinCandidate(vin, isMutated = false) {
  let score = 0;
  
  // Rule 1: Panjang mutlak
  if (vin.length === 17) score += 30;
  
  // Rule 2: Karakter Ilegal
  if (!/[IOQ]/.test(vin)) score += 10;
  else score -= 30; // Penalti berat jika mengandung karakter ilegal

  // Rule 3: Validasi Master Prefix (Ground Truth)
  const prefix = vin.substring(0, 9);
  if (masterNik[prefix]) {
    score += 50; // Skor absolut tertinggi jika prefix valid di masterNik
  } else if (vin.startsWith('MHK') || vin.startsWith('PM2')) {
    score += 20; // Skor moderat jika awalan valid tapi tidak lengkap
  }

  // Rule 4: Pola VDS (Karakter ke-5 biasanya angka untuk Daihatsu)
  if (vin.length >= 5 && /[0-9]/.test(vin[4])) {
    score += 15;
  }

  // Rule 5: Mutasi Cost (Hasil OCR asli tanpa mutasi dihargai lebih tinggi jika sama-sama logis)
  if (isMutated) score -= 5;

  return score;
}

/**
 * 2. CANDIDATE GENERATOR
 * Ekstrak string potensial dari teks kotor OCR, lalu buat varian (kandidat)
 */
function generateCandidates(rawText) {
  if (!rawText) return [];
  
  let candidates = [];
  let cleanText = rawText.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Ekstrak semua kombinasi 17 huruf berurutan dari teks (Sliding Window)
  let stringBlocks = new Set();
  if (cleanText.length === 17) {
    stringBlocks.add(cleanText);
  } else if (cleanText.length > 17) {
    for (let i = 0; i <= cleanText.length - 17; i++) {
      stringBlocks.add(cleanText.substring(i, i + 17));
    }
  }

  stringBlocks.forEach(baseStr => {
    // Kandidat A: Original Observation
    candidates.push({ text: baseStr, score: scoreVinCandidate(baseStr, false) });

    // Kandidat B: Mutasi (Hanya memutasi karakter yang dikenal ambigu)
    let chars = baseStr.split('');
    
    // Untuk mencegah kombinasi meledak, kita hanya mutasi maksimal 2 karakter pertama yang ketemu
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
  });

  return candidates;
}


/* ====================================================================
   IMAGE PIPELINE & SENSOR API
==================================================================== */

/**
 * 3. IMAGE PREPROCESSING (CANVAS)
 * Membuat varian gambar untuk dikirim ke API
 */
function getCanvasVariant(imgElement, type) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // ROI LEVEL 1: Geometry Crop (Fokus ke area 60% tengah secara vertikal)
  // Menghilangkan noise tepi dan meningkatkan resolusi area VIN
  const cropHeight = imgElement.naturalHeight * 0.6;
  const startY = (imgElement.naturalHeight - cropHeight) / 2;
  
  // Resize agar tidak terlalu berat untuk API, namun menjaga ketajaman
  const TARGET_WIDTH = 1000;
  const scale = TARGET_WIDTH / imgElement.naturalWidth;
  const finalWidth = TARGET_WIDTH;
  const finalHeight = cropHeight * scale;

  canvas.width = finalWidth;
  canvas.height = finalHeight;

  // Draw Cropped Region
  ctx.drawImage(imgElement, 0, startY, imgElement.naturalWidth, cropHeight, 0, 0, finalWidth, finalHeight);

  // Apply Filters
  if (type === 'grayscale' || type === 'contrast') {
    const imgData = ctx.getImageData(0, 0, finalWidth, finalHeight);
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i+1] + data[i+2]) / 3;
      
      if (type === 'contrast') {
        avg = avg < 128 ? avg * 0.7 : avg * 1.3; // Tarik kontras
        if (avg > 255) avg = 255;
      }
      
      data[i] = avg; data[i+1] = avg; data[i+2] = avg;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * 4. MULTIPLE OCR PASSES
 * Memanggil OCR Sensor dengan konfigurasi yang tepat (Single Line)
 */
async function fetchOCR(base64Image, engineMode) {
  const formData = new FormData();
  formData.append("base64Image", base64Image);
  formData.append("apikey", "helloworld");
  formData.append("OCREngine", engineMode); 
  // isTable=false karena kita ingin OCR fokus membaca baris (Single Line)
  formData.append("isTable", "false"); 
  formData.append("scale", "true");

  try {
    const response = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: formData });
    const result = await response.json();
    if (result && result.ParsedResults && result.ParsedResults.length > 0) {
      return result.ParsedResults[0].ParsedText;
    }
  } catch (err) {
    console.error("OCR API Error", err);
  }
  return "";
}


/**
 * 5. MAIN EXECUTION PIPELINE
 */
const executeRobustPipeline = (event) => {
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
        pipelineStatus.value = "Mengekstrak ROI & Preprocessing...";
        // Bikin Varian (Variant A: Grayscale Normal, Variant B: High Contrast)
        const variantA = getCanvasVariant(img, 'grayscale');
        const variantB = getCanvasVariant(img, 'contrast');

        // MULTIPLE PASSES (Sekuensial agar tidak terkena Rate Limit)
        pipelineStatus.value = "OCR Pass 1/2 (Engine 1)...";
        const obs1 = await fetchOCR(variantA, "1"); // Engine 1 bagus untuk reguler text
        
        pipelineStatus.value = "OCR Pass 2/2 (Engine 2)...";
        const obs2 = await fetchOCR(variantB, "2"); // Engine 2 bagus untuk alphanumeric/tinta buram

        pipelineStatus.value = "Evaluasi Kandidat VIN...";
        
        // Kumpulkan semua observasi
        const observations = [obs1, obs2];
        let allCandidates = [];

        observations.forEach(obs => {
           let extracted = generateCandidates(obs);
           allCandidates = allCandidates.concat(extracted);
        });

        // Urutkan Kandidat Berdasarkan Skor Tertinggi
        allCandidates.sort((a, b) => b.score - a.score);

        // 6. CONFIDENCE DECISION
        // Threshold: Harus punya panjang 17, tidak ada illegal char, dan idealnya awalan match
        const PASS_THRESHOLD = 70; 

        if (allCandidates.length > 0) {
          const bestCandidate = allCandidates[0];
          
          if (bestCandidate.score >= PASS_THRESHOLD) {
            // High Confidence -> Auto Fill
            form.no_rangka = bestCandidate.text;
            
            // Tebak warna dari raw observation
            const rawJoined = observations.join(' ').toUpperCase();
            for (let w of options.warna) {
              if (rawJoined.includes(w)) {
                form.warna = w; break;
              }
            }
            try { navigator.vibrate([100, 50, 100]); } catch (v) {}
          } else {
            // Low Confidence -> JANGAN AUTO FILL, MINTA RETAKE
            pipelineError.value = true;
            alert(`VIN belum cukup yakin (Skor: ${bestCandidate.score}).\nDeteksi tertinggi: ${bestCandidate.text}\n\nSilakan foto ulang dengan fokus yang lebih jelas.`);
          }
        } else {
           pipelineError.value = true;
           alert("Tidak ada pola VIN (17 digit) yang ditemukan pada gambar. Silakan foto ulang.");
        }

      } catch (err) {
        alert("Pipeline Gagal. Periksa koneksi atau coba lagi.");
        pipelineError.value = true;
      } finally {
        isProcessing.value = false;
        event.target.value = ""; 
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};


// Form Submits
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