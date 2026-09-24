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
            <span class="text-sm text-center px-4">{{ pipelineError ? 'Label VIN tidak terbaca. Foto Ulang.' : 'Buka Kamera (Geometric OCR)' }}</span>
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
   ROBUST GEOMETRIC OCR PIPELINE
==================================================================== */

// STEP 1: NORMALISASI OCR LINES (Berbasis 'Words' yang valid secara spasial)
function normalizeOCRLines(rawLines) {
  if (!rawLines) return [];
  
  return rawLines.map(line => {
    const words = line.Words || [];
    if (words.length === 0) return null;

    const text = words.map(w => w.WordText || "").join(" ").trim();
    const left = Math.min(...words.map(w => w.Left));
    const top = Math.min(...words.map(w => w.Top));
    const right = Math.max(...words.map(w => w.Left + w.Width));
    const bottom = Math.max(...words.map(w => w.Top + w.Height));

    return {
      text,
      words,
      left, top, right, bottom,
      width: right - left,
      height: bottom - top,
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2
    };
  }).filter(Boolean);
}

// STEP 2 & 3 & 12: FUZZY LABEL MATCHING & FALLBACK
function findVinLabel(normLines) {
  // Pass 1: Coba cari di baris tunggal (Toleransi OCR tinggi)
  for (let line of normLines) {
    let clean = line.text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (
      clean.includes("VEHICLEIDENTIFICATION") || 
      clean.includes("IDENTIFICATIONNUMBER") ||
      clean.includes("1DENTIFICAT1ON") ||
      clean.includes("IDENTIFICATIONNO") ||
      (clean.includes("VEHICLE") && clean.includes("IDENT"))
    ) {
      console.debug("✅ VIN LABEL FOUND (Single Line):", line.text);
      return line;
    }
  }

  // Pass 2: Fallback (Label terpecah ke beberapa baris/Words berdekatan)
  let vehicleLine = null;
  let identLine = null;

  for (let line of normLines) {
    let clean = line.text.toUpperCase();
    if (clean.includes("VEHICLE")) vehicleLine = line;
    if (clean.includes("IDENTIFICATION") || clean.includes("1DENTIFICAT1ON")) identLine = line;
  }

  if (vehicleLine && identLine) {
    // Jika jarak vertikal mereka dekat (terpecah 2 baris)
    let gap = Math.abs(vehicleLine.bottom - identLine.top);
    if (gap < 50) {
      console.debug("✅ VIN LABEL FOUND (Multi-Line Merged):", vehicleLine.text, "+", identLine.text);
      // STEP 4: Buat Bounding Box Gabungan
      return {
        left: Math.min(vehicleLine.left, identLine.left),
        top: Math.min(vehicleLine.top, identLine.top),
        right: Math.max(vehicleLine.right, identLine.right),
        bottom: Math.max(vehicleLine.bottom, identLine.bottom),
        width: Math.max(vehicleLine.right, identLine.right) - Math.min(vehicleLine.left, identLine.left),
        height: Math.max(vehicleLine.bottom, identLine.bottom) - Math.min(vehicleLine.top, identLine.top),
        centerX: (vehicleLine.centerX + identLine.centerX) / 2
      };
    }
  }

  console.debug("❌ LABEL VIN TIDAK DITEMUKAN");
  return null;
}

// STEP 5: MENCARI KANDIDAT GEOMETRIS DI BAWAH LABEL (Bukan seluruh dokumen)
function findVinCandidates(normLines, labelBox) {
  let candidates = [];
  
  for (let i = 0; i < normLines.length; i++) {
    let line = normLines[i];
    
    // Harus berada di bawah label (toleransi -15px jika miring)
    let verticalGap = line.top - labelBox.bottom;
    
    // Jangan terlalu jauh (Max 150px atau 8x tinggi label)
    if (verticalGap >= -15 && verticalGap <= Math.max(150, labelBox.height * 8)) {
      
      // Horizontal Overlap / Kedekatan X
      let hOverlap = Math.max(0, Math.min(line.right, labelBox.right) - Math.max(line.left, labelBox.left));
      
      if (hOverlap > 0 || (line.centerX >= labelBox.left - 50 && line.centerX <= labelBox.right + 50)) {
        
        // STEP 6: Kumpulkan String (Line Utuh, Gabungan Words, Gabungan Lines)
        
        // A. Baris utuh (tanpa spasi)
        let lineClean = line.text.replace(/\s+/g, '');
        if (lineClean.length >= 10) candidates.push(lineClean);

        // B. Word individu
        line.words.forEach(w => {
          if (w.WordText && w.WordText.length >= 10) candidates.push(w.WordText);
        });

        // C. Gabungan dengan baris berikutnya (Jika OCR memecah VIN MHKP3... dan 201519 ke atas bawah)
        if (i < normLines.length - 1) {
          let nextLine = normLines[i+1];
          let lineGap = nextLine.top - line.bottom;
          if (lineGap < 30) {
             let merged = (line.text + nextLine.text).replace(/\s+/g, '');
             if (merged.length >= 10) candidates.push(merged);
          }
        }
      }
    }
  }
  
  // Buang duplikat
  let uniqueCandidates = [...new Set(candidates)];
  console.debug("🔍 GEOMETRIC CANDIDATES FOUND:", uniqueCandidates);
  return uniqueCandidates;
}


// STEP 7 & 8: SCORING & CHARACTER CONFUSION CORRECTION
const CONFUSION_MAP = {
  'S': ['3', '5'], '5': ['S', '3'], '3': ['S', '5'],
  'B': ['8'], '8': ['B'], 'Z': ['2'], '2': ['Z'],
  'G': ['6'], '6': ['G'], 'O': ['0'], 'Q': ['0'], 'D': ['0'],
  'I': ['1'], 'L': ['1'], '!': ['1'], '|': ['1']
};

function scoreCandidate(vin, isMutated) {
  let score = 0;
  
  if (vin.length === 17) score += 100;
  
  // Validasi MasterNik
  const prefix = vin.substring(0, 9);
  if (masterNik[prefix]) score += 100; 
  
  if (vin.startsWith('MHK') || vin.startsWith('PM2')) score += 30;
  
  if (!/[IOQ]/.test(vin)) score += 20;

  // Rasio Alphanumeric (Mencegah teks sampah terpilih)
  let alphaNumRatio = vin.replace(/[^A-Z0-9]/g, '').length / (vin.length || 1);
  if (alphaNumRatio > 0.9) score += 20;

  // Pola VDS Daihatsu (Karakter ke-5 adalah Angka, mengatasi 'S')
  if (vin.length >= 5 && /[0-9]/.test(vin[4])) score += 20;

  if (isMutated) score -= 10; // Penalti kecil agar OCR asli menang jika skor seri
  return score;
}

function processCandidateMutations(candidateString) {
  let cleanStr = candidateString.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Jika terlalu panjang tapi depannya valid, potong.
  if (cleanStr.length > 17 && (cleanStr.startsWith('MHK') || cleanStr.startsWith('PM2'))) {
    cleanStr = cleanStr.substring(0, 17);
  }

  let results = [];
  // 1. Masukkan data asli
  results.push({ text: cleanStr, score: scoreCandidate(cleanStr, false) });

  // 2. Buat mutasi (hanya koreksi karakter jika diperlukan)
  let chars = cleanStr.split('');
  let mutCount = 0;
  for (let i = 0; i < chars.length; i++) {
    if (mutCount > 2) break; // Batasi mutasi agar tidak loop berlebihan
    if (CONFUSION_MAP[chars[i]]) {
      CONFUSION_MAP[chars[i]].forEach(alt => {
        let mutArr = [...chars];
        mutArr[i] = alt;
        let mutStr = mutArr.join('');
        results.push({ text: mutStr, score: scoreCandidate(mutStr, true) });
      });
      mutCount++;
    }
  }

  return results;
}

/* ====================================================================
   IMAGE FETCH & MAIN PIPELINE
==================================================================== */

// Resize gambar utuh, jangan di-crop
function getResizedVariant(imgElement) {
  const canvas = document.createElement('canvas');
  const MAX_WIDTH = 1200;
  let width = imgElement.width;
  let height = imgElement.height;
  
  if (width > MAX_WIDTH) {
    height = height * (MAX_WIDTH / width);
    width = MAX_WIDTH;
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.8);
}

async function callOCRSensor(base64Image) {
  const formData = new FormData();
  formData.append("base64Image", base64Image);
  formData.append("apikey", "helloworld"); // Disarankan pindah ke backend nanti
  formData.append("OCREngine", "2"); 
  formData.append("scale", "true");
  // CRITICAL: Request Words and Coordinates
  formData.append("isOverlayRequired", "true"); 

  try {
    const response = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: formData });
    return await response.json();
  } catch (err) {
    console.error("API Fetch Error:", err);
    return null;
  }
}

const executeGeometricPipeline = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isProcessing.value = true;
  pipelineError.value = false;
  pipelineStatus.value = "1. Memuat Gambar...";

  console.debug("--- STARTING OCR PIPELINE ---");

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      try {
        pipelineStatus.value = "2. Menghubungi Sensor OCR...";
        const b64 = getResizedVariant(img);
        const resultJSON = await callOCRSensor(b64);
        
        if (!resultJSON || !resultJSON.ParsedResults || resultJSON.ParsedResults.length === 0) {
          throw new Error("Gagal membaca teks dari gambar.");
        }

        const rawLines = resultJSON.ParsedResults[0].TextOverlay?.Lines;
        if (!rawLines || rawLines.length === 0) {
           pipelineError.value = true;
           alert("Sistem OCR tidak mengembalikan koordinat garis/kata. Silakan coba lagi.");
           return;
        }

        pipelineStatus.value = "3. Normalisasi Koordinat...";
        const normLines = normalizeOCRLines(rawLines);
        console.debug("NORMALIZED LINES:", normLines);

        pipelineStatus.value = "4. Mencari Field 'VIN'...";
        const labelBox = findVinLabel(normLines);

        if (!labelBox) {
           pipelineError.value = true;
           alert("Label 'VEHICLE IDENTIFICATION NUMBER' tidak ditemukan. Pastikan area label terfoto dengan jelas, bukan hanya angkanya.");
           return;
        }
        console.debug("VIN LABEL BOUNDING BOX:", labelBox);

        pipelineStatus.value = "5. Mengekstrak Geometri Area VIN...";
        const candidateStrings = findVinCandidates(normLines, labelBox);

        if (candidateStrings.length === 0) {
           pipelineError.value = true;
           alert("Label VIN ditemukan, tetapi area nilainya kosong. Silakan foto ulang.");
           return;
        }

        pipelineStatus.value = "6. Validasi & Character Correction...";
        let scoredCandidates = [];
        candidateStrings.forEach(str => {
           scoredCandidates = scoredCandidates.concat(processCandidateMutations(str));
        });

        scoredCandidates.sort((a, b) => b.score - a.score);
        console.debug("SCORED CANDIDATES:", scoredCandidates);

        const bestCandidate = scoredCandidates[0];
        console.debug("SELECTED VIN:", bestCandidate);

        // DECISION THRESHOLD
        if (bestCandidate.score >= 120) { // Skor 120 berarti (100 length + 20 No IOQ) min
          form.no_rangka = bestCandidate.text;
          
          // Deteksi warna dokumen
          const rawAll = resultJSON.ParsedResults[0].ParsedText.toUpperCase();
          for (let w of options.warna) {
            if (rawAll.includes(w)) { form.warna = w; break; }
          }
          try { navigator.vibrate([100, 50, 100]); } catch(v){}
        } else {
          pipelineError.value = true;
          alert(`VIN terdeteksi: ${bestCandidate.text}\nConfidence Skor (${bestCandidate.score}) terlalu rendah. Silakan periksa kembali atau foto ulang.`);
        }

      } catch (err) {
        pipelineError.value = true;
        alert("Pipeline error atau koneksi terputus.");
        console.error(err);
      } finally {
        isProcessing.value = false;
        pipelineStatus.value = "";
        event.target.value = ""; 
        console.debug("--- END OCR PIPELINE ---");
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