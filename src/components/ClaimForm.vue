<template>
  <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-w-xl mx-auto pb-28">
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tanggal *</label>
      <input type="date" v-model="form.tanggal" required class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
    </div>

    <!-- No Rangka + Tombol Kamera -->
    <div class="space-y-1.5">
      <div class="flex justify-between items-center">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">No Rangka (VIN) *</label>
      </div>

      <div class="relative w-full mb-2">
        <input type="file" id="cameraInput" accept="image/*" capture="environment" @change="handleAdvancedOCR" class="hidden" :disabled="isProcessing" />

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
            <span class="text-sm">Buka Kamera HP (Smart OCR)</span>
            <span class="text-[10px] text-slate-400 font-normal">Tesseract v5 Pipeline</span>
          </div>

          <div v-else class="flex flex-col items-center gap-2">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Memproses...</span>
            </div>
            <span class="text-[10px] text-blue-300 font-mono">{{ ocrStatus }}</span>
          </div>
        </label>
      </div>

      <div class="relative">
        <input
          type="text"
          v-model="form.no_rangka"
          placeholder="Scan VIN atau ketik manual..."
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
        placeholder="Ketik tipe kendaraan..."
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

    <!-- Bottom Actions -->
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
import { createWorker } from "tesseract.js";

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
  MHKV3CA3J: "MINIBUS 1.5 PS FH",
  MHKW3CA1J: "LUXIO D",
  MHKW3CA3J: "LUXIO X",
  MHKW3CB3J: "LUXIO X",
  MHKB3BA1J: "BLINDVAN 1.3",
  MHKB3CA1J: "BLINDVAN 1.3",
  MHKS4DA1J: "AYLA D+",
  MHKS4DA2J: "AYLA M",
  MHKS4DA3J: "AYLA X",
  MHKS4DB2J: "AYLA M",
  MHKS4DB3J: "AYLA X",
  MHKS4GA4J: "AYLA X-1.2",
  MHKS4GA5J: "AYLA R-1.2",
  MHKS4GB4J: "AYLA X-1.2",
  MHKS4GB5J: "AYLA R-1.2",
  MHKS6DJ1J: "SIGRA D",
  MHKS6DJ2J: "SIGRA M",
  MHKS6GJ3J: "SIGRA X",
  MHKS6GJ6J: "SIGRA R",
  MHKS6GK6J: "SIGRA R",
  MHKS6GK3J: "SIGRA X",
  PM2M804S1: "SIRION STD",
  MHKB3FA1J: "BLINDVAN 1.5",
  MHKP3BA1J: "PICK UP 1.3",
  MHKT3CA1J: "PICK UP 1.5 3W",
  MHKT3BA1J: "PICK UP 1.3 3W",
  MHKP3FA1J: "PICK UP 1.5 STD",
  MHKAA1AA1: "ROCKY R",
  MHKAA1AA2: "ROCKY R",
  MHKAB1AA0: "ROCKY 1.2",
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
// CANDIDATE GENERATION & VALIDATION
// ==========================================

const VIN_PREFIXES = ["MHK", "PM2"];
const CONFUSION_MAP = {
  S: "3",
  5: "3",
  B: "8",
  8: "B",
  Z: "2",
  G: "6",
  I: "1",
  O: "0",
  Q: "0",
  L: "1",
  "!": "1",
  "|": "1",
};

function scoreVin(vin) {
  let score = 0;
  if (vin.length === 17) score += 50;
  if (VIN_PREFIXES.some((p) => vin.startsWith(p))) score += 30;
  // Periksa apakah VDS karakter ke-5 (index 4) adalah angka
  if (vin.length > 5 && /[0-9]/.test(vin[4])) score += 20;
  return score;
}

function processConfusion(rawText) {
  // Membersihkan karakter aneh
  let text = rawText.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Mencari potongan VIN
  let match = text.match(/(MHK|PM2)[A-Z0-9]{12,16}/);
  let baseVin = match ? match[0] : text.substring(0, 17);

  // Jika panjang masih kurang, pertahankan apa adanya (biarkan operator ngetik sisanya)
  if (baseVin.length < 5) return baseVin;

  let corrected = baseVin.split("");

  // Rule 1: VIN dilarang pakai I, O, Q
  for (let i = 0; i < corrected.length; i++) {
    if (corrected[i] === "I" || corrected[i] === "L") corrected[i] = "1";
    if (corrected[i] === "O" || corrected[i] === "Q") corrected[i] = "0";
  }

  // Rule 2: Spesifik untuk masalah "MHKPS" -> harusnya "MHKP3"
  // Karakter indeks 4 biasanya adalah angka 3 atau huruf terkait VDS
  if (corrected.length > 4 && (corrected[4] === "S" || corrected[4] === "5")) {
    corrected[4] = "3";
  }

  // Rule 3: Iterasi Confusion Map secara umum untuk indeks sisanya
  for (let i = 5; i < corrected.length; i++) {
    let char = corrected[i];
    if (CONFUSION_MAP[char]) {
      corrected[i] = CONFUSION_MAP[char];
    }
  }

  return corrected.join("");
}

function getCanvasVariant(img, type) {
  const canvas = document.createElement("canvas");
  // Crop area lebih lebar (95%) untuk antisipasi label tidak pas tengah
  const cWidth = img.width * 0.95;
  const cHeight = img.height * 0.4;
  canvas.width = cWidth;
  canvas.height = cHeight;

  const ctx = canvas.getContext("2d");
  const startX = (img.width - cWidth) / 2;
  const startY = (img.height - cHeight) / 2;

  ctx.drawImage(img, startX, startY, cWidth, cHeight, 0, 0, cWidth, cHeight);

  const imageData = ctx.getImageData(0, 0, cWidth, cHeight);
  const data = imageData.data;

  if (type === "high-contrast") {
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      avg = avg < 128 ? avg * 0.5 : avg * 1.5; // Ekstrem contrast
      if (avg > 255) avg = 255;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
  } else if (type === "otsu") {
    for (let i = 0; i < data.length; i += 4) {
      let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      avg = avg > 110 ? 255 : 0;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/jpeg", 1.0);
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
      try {
        const MAX_WIDTH = 1200;
        if (img.width > MAX_WIDTH) {
          const ratio = MAX_WIDTH / img.width;
          img.width = MAX_WIDTH;
          img.height = img.height * ratio;
        }

        ocrStatus.value = "Membuat Image Variant...";
        // Kita gunakan 2 varian untuk ketangguhan
        const variants = [
          img.src, // Gambar Asli
          getCanvasVariant(img, "high-contrast"),
          getCanvasVariant(img, "otsu"),
        ];

        ocrStatus.value = "Memulai Mesin OCR...";

        const worker = await createWorker("eng", 1, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              ocrStatus.value = `Membaca Teks: ${Math.round(m.progress * 100)}%`;
            }
          },
        });

        // Mode 6: Assume a single uniform block of text. Sangat aman jika crop meleset.
        await worker.setParameters({
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",
          tessedit_pageseg_mode: "6",
        });

        let bestResult = "";
        let bestScore = -1;

        for (let i = 0; i < variants.length; i++) {
          ocrStatus.value = `Menganalisa Varian ${i + 1}/${variants.length}...`;
          const {
            data: { text },
          } = await worker.recognize(variants[i]);

          if (!text) continue;

          let processedVin = processConfusion(text);
          let currentScore = scoreVin(processedVin);

          if (currentScore > bestScore) {
            bestScore = currentScore;
            bestResult = processedVin;
          }

          // Deteksi warna otomatis dari varian apapun
          let rawTextForColor = text.toUpperCase();
          for (let w of options.warna) {
            if (rawTextForColor.includes(w) && !form.warna) {
              form.warna = w;
            }
          }
        }

        await worker.terminate();

        // Tampilkan hasil terbaik apa pun itu (tidak ada validasi memblokir/alert)
        if (bestResult.length > 0) {
          form.no_rangka = bestResult.substring(0, 17); // Batasi 17 digit
          try {
            navigator.vibrate(200);
          } catch (v) {}
        } else {
          // Jika OCR benar-benar kosong/gagal baca
          form.no_rangka = "";
          alert("Gagal membaca gambar. Ketik manual atau foto ulang.");
        }
      } catch (err) {
        alert("Terjadi kesalahan sistem saat memuat Tesseract.");
        console.error(err);
      } finally {
        isProcessing.value = false;
        ocrStatus.value = "";
        event.target.value = "";
      }
    };

    img.onerror = () => {
      alert("Gagal memuat gambar.");
      isProcessing.value = false;
    };

    img.src = e.target.result;
  };

  reader.onerror = () => {
    alert("Gagal membaca file.");
    isProcessing.value = false;
  };

  reader.readAsDataURL(file);
};

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

  emit("submit", { ...form, stempel_qc: props.qcId });
  Object.assign(form, getInitialForm());
};

const handleReset = () => {
  Object.assign(form, getInitialForm());
  emit("reset");
};
</script>
