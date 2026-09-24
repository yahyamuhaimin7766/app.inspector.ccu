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
            <span class="text-[10px] text-slate-400 font-normal">Multi-Observation & Candidate Scoring</span>
          </div>

          <div v-else class="flex flex-col items-center gap-2">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Pipeline Berjalan...</span>
            </div>
            <span class="text-[10px] text-blue-300 font-mono">{{ pipelineStatus }}</span>
          </div>
        </label>
      </div>

      <div class="relative">
        <input
          type="text"
          v-model="form.no_rangka"
          placeholder="Hasil OCR akan masuk di sini..."
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
        placeholder="Tipe kendaraan (Auto/Manual)..."
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

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">KM / ODO</label>
        <input
          type="number"
          v-model="form.km"
          placeholder="Contoh: 86"
          class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs"
        />
      </div>
      <div class="space-y-1.5">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Kode Accu</label>
        <input
          type="text"
          v-model="form.kode_accu"
          placeholder="Kode Accu"
          class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Defect</label>
      <input
        type="text"
        v-model="form.defect"
        placeholder="Jenis kerusakannya..."
        class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs"
      />
    </div>

    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Keterangan Defect</label>
      <textarea
        v-model="form.ket_defect"
        rows="3"
        placeholder="Contoh: RR LH, bocor, terlipat"
        class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs"
      ></textarea>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 flex gap-3 max-w-xl mx-auto z-20 shadow-lg">
      <button type="button" @click="handleReset" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-xl transition">Batal</button>
      <button
        type="submit"
        :disabled="loading || isProcessing"
        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
      >
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
// ROBUST VIN OCR ARCHITECTURE (AS REQUESTED)
// ==========================================

const RobustVINPipeline = {
  // 1. CHARACTER CONFUSION MAP (Noise handling)
  confusionMap: {
    S: ["3", "5"],
    5: ["S", "3"],
    3: ["S", "5"],
    B: ["8"],
    8: ["B"],
    Z: ["2"],
    2: ["Z"],
    G: ["6"],
    6: ["G"],
    I: ["1"],
    L: ["1"],
    "!": ["1"],
    "|": ["1"],
    O: ["0"],
    Q: ["0"],
    D: ["0"],
  },

  // 2. CONFIDENCE SCORING ALGORITHM
  scoreCandidate(vin, mutationCount) {
    let score = 0;

    // Format Validation: Must be 17 chars
    if (vin.length === 17) score += 40;

    // Format Validation: Valid Daihatsu WMI Prefix
    const prefixes = ["MHK", "PM2"];
    if (prefixes.some((p) => vin.startsWith(p))) score += 30;

    // Format Validation: No illegal characters (I, O, Q)
    if (!/[IOQ]/.test(vin)) score += 10;

    // VDS Logical Validation (Specific for Daihatsu)
    // Example: MHKP3... -> index 4 is '3'.
    // In Daihatsu VINs, index 4 (5th char) is highly likely a number representing engine/body.
    if (vin.length > 4) {
      if (/[0-9]/.test(vin[4])) score += 20; // HUGE bonus if 5th char is a number (solves S -> 3)
      if (/[A-Z]/.test(vin[4])) score -= 10; // Penalty if 5th char is a letter like 'S'
    }

    // Penalty for replacing characters (we favor original OCR if possible)
    score -= mutationCount * 5;

    return score;
  },

  // 3. CANDIDATE GENERATION
  generateCandidates(ocrText) {
    let cleanText = ocrText.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Try to extract the block starting with MHK or PM2
    let match = cleanText.match(/(MHK|PM2)[A-Z0-9]*/);
    let baseString = match ? match[0] : cleanText.substring(0, 17);

    let candidates = [];

    // Candidate 1: The original unmodified string
    candidates.push({
      text: baseString,
      score: this.scoreCandidate(baseString, 0),
    });

    // Generate Mutated Candidates based on Confusion Map
    let chars = baseString.split("");
    for (let i = 0; i < chars.length; i++) {
      let char = chars[i];
      if (this.confusionMap[char]) {
        this.confusionMap[char].forEach((replacement) => {
          let mutated = [...chars];
          mutated[i] = replacement;
          let mutatedText = mutated.join("");

          candidates.push({
            text: mutatedText,
            score: this.scoreCandidate(mutatedText, 1),
          });
        });
      }
    }
    return candidates;
  },

  // 4. PIPELINE EXECUTION
  resolveBestVIN(observations) {
    let allCandidates = [];
    observations.forEach((obs) => {
      if (obs) {
        let candidates = this.generateCandidates(obs);
        allCandidates = allCandidates.concat(candidates);
      }
    });

    // Sort by Highest Confidence Score
    allCandidates.sort((a, b) => b.score - a.score);

    return allCandidates.length > 0 ? allCandidates[0] : null;
  },
};

// ==========================================
// IMAGE PREPROCESSING FOR iOS SAFARI
// ==========================================
function createPreprocessingVariants(imgElement) {
  return new Promise((resolve) => {
    // VARIANT 1: Original Normalized
    const c1 = document.createElement("canvas");
    c1.width = imgElement.width;
    c1.height = imgElement.height;
    const ctx1 = c1.getContext("2d");
    ctx1.drawImage(imgElement, 0, 0);
    const b64Original = c1.toDataURL("image/jpeg", 0.8);

    // VARIANT 2: High Contrast / Thresholding (Solves faint prints)
    const c2 = document.createElement("canvas");
    c2.width = imgElement.width;
    c2.height = imgElement.height;
    const ctx2 = c2.getContext("2d");
    ctx2.drawImage(imgElement, 0, 0);
    const imgData = ctx2.getImageData(0, 0, c2.width, c2.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      avg = avg < 140 ? 0 : 255; // Hard Otsu-style binarization
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    ctx2.putImageData(imgData, 0, 0);
    const b64Contrast = c2.toDataURL("image/jpeg", 0.8);

    resolve([b64Original, b64Contrast]);
  });
}

// ==========================================
// SENSOR EXECUTION (API CALLS)
// ==========================================
async function callOCRSensor(base64Image, isTableValue) {
  const formData = new FormData();
  formData.append("base64Image", base64Image);
  formData.append("apikey", "helloworld");
  formData.append("OCREngine", "2");
  formData.append("scale", "true");
  formData.append("isTable", isTableValue); // Different config

  const response = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: formData });
  const result = await response.json();
  if (result && result.ParsedResults && result.ParsedResults.length > 0) {
    return result.ParsedResults[0].ParsedText;
  }
  return null;
}

const executeOCRPipeline = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isProcessing.value = true;
  pipelineStatus.value = "1. Image Capture...";

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      try {
        // Limit Resolution
        const MAX_WIDTH = 1000;
        if (img.width > MAX_WIDTH) {
          img.height = img.height * (MAX_WIDTH / img.width);
          img.width = MAX_WIDTH;
        }

        pipelineStatus.value = "2. Preprocessing Variants...";
        const variants = await createPreprocessingVariants(img);

        pipelineStatus.value = "3. Multiple OCR Observations...";
        // Request 1: Original Image, Line Mode
        const req1 = callOCRSensor(variants[0], "false");
        // Request 2: Thresholded Image, Table Mode
        const req2 = callOCRSensor(variants[1], "true");

        const observations = await Promise.all([req1, req2]);

        pipelineStatus.value = "4. Candidate Gen & Scoring...";
        const finalCandidate = RobustVINPipeline.resolveBestVIN(observations);

        if (finalCandidate && finalCandidate.score > 50) {
          form.no_rangka = finalCandidate.text.substring(0, 17);

          // Color Extraction Logic
          const rawJoined = observations.join(" ").toUpperCase();
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
          alert("Pipeline gagal membaca VIN secara akurat. Silakan ketik manual.");
        }
      } catch (err) {
        alert("Pipeline error. Periksa koneksi jaringan Anda.");
        console.error(err);
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
