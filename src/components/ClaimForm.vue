<template>
  <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-w-xl mx-auto pb-28">
    <!-- Tanggal -->
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tanggal *</label>
      <input type="date" v-model="form.tanggal" required class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
    </div>

    <!-- No Rangka + Kamera OCR -->
    <div class="space-y-1.5">
      <div class="flex justify-between items-center">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">No Rangka (VIN) *</label>
      </div>

      <div class="relative w-full mb-2">
        <input type="file" id="cameraInput" accept="image/*" capture="environment" @change="executeOCRPipeline" class="hidden" :disabled="isProcessing" />

        <label
          for="cameraInput"
          class="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg cursor-pointer hover:bg-slate-800 transition border-2 border-blue-500"
          :class="{ 'opacity-75 pointer-events-none': isProcessing }"
        >
          <div v-if="!isProcessing" class="flex flex-col items-center">
            <svg class="w-8 h-8 text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-sm">Buka Kamera (Robust OCR Pipeline)</span>
            <span class="text-[10px] text-slate-400 font-normal">Full Label Scan & Candidate Validation</span>
          </div>

          <div v-else class="flex flex-col items-center gap-2">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Pipeline Berjalan...</span>
            </div>
            <span class="text-[10px] text-blue-300 font-mono text-center px-4">{{ pipelineStatus }}</span>
          </div>
        </label>
      </div>

      <div class="relative">
        <input
          type="text"
          v-model="form.no_rangka"
          placeholder="Scan atau ketik VIN di sini..."
          required
          class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs font-mono tracking-wide font-bold"
        />
      </div>
    </div>

    <!-- Tipe Kendaraan -->
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tipe & Varian Kendaraan *</label>
      <input
        type="text"
        v-model="form.tipe"
        placeholder="Otomatis atau ketik manual..."
        required
        class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs font-bold"
        :class="{ 'text-indigo-800 bg-indigo-50 border-indigo-300': form.tipe }"
      />
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

    <!-- Lainnya -->
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
      <textarea
        v-model="form.ket_defect"
        rows="3"
        placeholder="Contoh: RR LH, bocor, terlipat"
        class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
      ></textarea>
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
  MHKV5EA1J: "XENIA X 1.3",
  MHKV5EA2J: "XENIA R",
  MHKV5EB1J: "XENIA X",
  MHKV5EB2J: "XENIA R",
  MHKV5FA2J: "XENIA R-1.5",
  MHKV5FB2J: "XENIA R-1.5",
  MHKG8FA1J: "TERIOS X",
  MHKG8FA2J: "TERIOS R",
  MHKG8FB1J: "TERIOS X",
  MHKG8FB2J: "TERIOS R",
  MHKV3BA3J: "MINIBUS 1.3 FH",
  MHKV3BA6J: "MINIBUS 1.3 FF FH",
  MHKW3CA1J: "LUXIO D",
  MHKW3CA3J: "LUXIO X",
  MHKW3CB3J: "LUXIO X",
  MHKB3BA1J: "BLINDVAN 1.3",
  MHKB3CA1J: "BLINDVAN 1.3",
  MHKS4DA1J: "AYLA D+",
  MHKS4DA3J: "AYLA X",
  MHKS4GB5J: "AYLA R-1.2",
  MHKS6DJ1J: "SIGRA D",
  MHKS6GJ6J: "SIGRA R",
  PM2M804S1: "SIRION STD",
  MHKP3BA1J: "PICK UP 1.3",
  MHKT3CA1J: "PICK UP 1.5 3W",
  MHKAA1AA1: "ROCKY R",
  MHKAB1AA0: "ROCKY 1.2",
};

const getTodayDate = () => new Date().toISOString().split("T")[0];
const getInitialForm = () => ({ tanggal: getTodayDate(), no_rangka: "", tipe: "", warna: "", km: "", kode_accu: "", defect: "", ket_defect: "" });
const form = reactive(getInitialForm());

const isProcessing = ref(false);
const pipelineStatus = ref("");

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
    if (newVal) {
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
// 1. SCORING ENGINE (VDS PATTERN VALIDATION)
// ==========================================
function scoreVin(vin) {
  let score = 0;

  // Format Utama
  if (vin.length === 17) score += 50;

  // Prefix Check (Daihatsu Indonesia: MHK / PM2)
  if (vin.startsWith("MHK") || vin.startsWith("PM2")) score += 50;
  else if (vin.startsWith("NHK") || vin.startsWith("M8K")) score += 20;

  // Aturan VDS (Vehicle Descriptor Section)
  // Karakter ke-5 (indeks 4) harus angka. Ini kunci untuk membedakan 'S' dan '3'
  if (vin.length >= 5 && /[0-9]/.test(vin[4])) {
    score += 30; // Bonus besar jika angka
  } else if (vin.length >= 5 && /[A-Z]/.test(vin[4])) {
    score -= 20; // Penalti jika huruf (seperti S)
  }

  // Karakter Ilegal (I, O, Q)
  if (!/[IOQ]/.test(vin)) score += 10;

  return score;
}

// ==========================================
// 2. CANDIDATE GENERATION & CONFUSION MODEL
// ==========================================
function extractAndGenerateCandidates(rawOcrText) {
  if (!rawOcrText) return [];

  let candidates = [];

  // A. Pecah semua teks berdasarkan spasi / baris baru (Tokenization)
  let tokens = rawOcrText.toUpperCase().split(/\s+/);

  // B. Tambahkan juga versi nyambung tanpa spasi (jika OCR menghapus spasi)
  let continuousText = rawOcrText.toUpperCase().replace(/\s+/g, "");
  tokens.push(continuousText);

  // C. Gunakan REGEX untuk mengekstrak string panjang di dalam continuous text
  let mMatch = continuousText.match(/M[A-Z0-9]{15,18}/g);
  if (mMatch) tokens.push(...mMatch);

  let pMatch = continuousText.match(/P[A-Z0-9]{15,18}/g);
  if (pMatch) tokens.push(...pMatch);

  // Evaluasi setiap token
  tokens.forEach((token) => {
    // Bersihkan karakter aneh dan standarisasi
    let base = token.replace(/[^A-Z0-9]/g, "");
    base = base.replace(/[IL|!]/g, "1").replace(/[OQD]/g, "0");

    // Pastikan kita memotong tepat 17 digit jika kelebihan
    if (base.length > 17 && (base.startsWith("MHK") || base.startsWith("PM2"))) {
      base = base.substring(0, 17);
    }

    if (base.length >= 10) {
      // Hanya proses string panjang
      // Kandidat Asli
      candidates.push({ text: base, score: scoreVin(base) });

      // MUTASI 1: Kasus MHKPS -> MHKP3
      if (base.length >= 5 && (base[4] === "S" || base[4] === "5")) {
        let arr = base.split("");
        arr[4] = "3";
        let mut = arr.join("");
        candidates.push({ text: mut, score: scoreVin(mut) });
      }

      // MUTASI 2: Kasus NHK -> MHK
      if (base.startsWith("NHK") || base.startsWith("M8K")) {
        let mut = "MHK" + base.substring(3);
        candidates.push({ text: mut, score: scoreVin(mut) });
      }
    }
  });

  return candidates;
}

// ==========================================
// 3. IMAGE PREPROCESSING (TANPA CROP)
// ==========================================
function getResizedVariant(imgElement, type) {
  const canvas = document.createElement("canvas");
  // HANYA RESIZE UTUH, TIDAK MEMOTONG (CROP). Ini menyelesaikan masalah "SAPMA13302"
  const MAX_WIDTH = 1000;
  let width = imgElement.width;
  let height = imgElement.height;

  if (width > MAX_WIDTH) {
    height = height * (MAX_WIDTH / width);
    width = MAX_WIDTH;
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgElement, 0, 0, width, height);

  if (type === "grayscale") {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg; // Jadikan Abu-abu
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return canvas.toDataURL("image/jpeg", 0.8);
}

// ==========================================
// 4. API SENSOR EXECUTION
// ==========================================
async function callOCRSensor(base64Image) {
  const formData = new FormData();
  formData.append("base64Image", base64Image);
  formData.append("apikey", "helloworld");
  formData.append("OCREngine", "2");
  formData.append("scale", "true");
  // isTable=true membantu membaca label yang layoutnya berantakan
  formData.append("isTable", "true");

  try {
    const response = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: formData });
    const result = await response.json();
    if (result && result.ParsedResults && result.ParsedResults.length > 0) {
      return result.ParsedResults[0].ParsedText;
    }
  } catch (e) {
    console.error("OCR Sensor fail", e);
  }
  return "";
}

const executeOCRPipeline = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isProcessing.value = true;
  pipelineStatus.value = "1. Membaca Label Utuh...";

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      try {
        pipelineStatus.value = "2. Enhancing Image...";
        // Buat 1 varian Grayscale utuh tanpa dipotong
        const imgGrayscale = getResizedVariant(img, "grayscale");

        pipelineStatus.value = "3. Ekstraksi Data (API Engine 2)...";
        const rawOcrResult = await callOCRSensor(imgGrayscale);

        pipelineStatus.value = "4. Menjalankan Model Kebingungan...";

        let allCandidates = extractAndGenerateCandidates(rawOcrResult);
        allCandidates.sort((a, b) => b.score - a.score);

        // Jika berhasil mendapat kandidat apapun, masukkan. Jika gagal, masukkan raw (kasar).
        if (allCandidates.length > 0) {
          form.no_rangka = allCandidates[0].text;

          // Tebak warna dari hasil mentah (kalau ada)
          const rawJoined = rawOcrResult.toUpperCase();
          for (let w of options.warna) {
            if (rawJoined.includes(w)) {
              form.warna = w;
              break;
            }
          }
          try {
            navigator.vibrate(200);
          } catch (v) {}
        } else {
          // Jika label benar-benar rusak, tampilkan 17 huruf pertama yang ketemu
          let fallback = rawOcrResult.replace(/[^a-zA-Z0-9]/g, "").substring(0, 17);
          form.no_rangka = fallback;
        }
      } catch (err) {
        alert("Gagal menghubungi server. Silakan ketik manual.");
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
};

const handleReset = () => {
  Object.assign(form, getInitialForm());
  emit("reset");
};
</script>
