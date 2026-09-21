<template>
  <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-w-xl mx-auto pb-28">
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tanggal *</label>
      <input type="date" v-model="form.tanggal" required class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
    </div>

    <!-- No Rangka + Kamera OCR -->
    <div class="space-y-1.5">
      <div class="flex justify-between items-center">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">No Rangka (VIN) *</label>
        <button type="button" @click="toggleScanner" class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition shadow-xs">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{{ isScanning ? "Tutup Kamera" : "Buka Kamera OCR" }}</span>
        </button>
      </div>

      <div v-show="isScanning" class="bg-slate-900 rounded-2xl overflow-hidden p-2 border-2 border-blue-500 relative shadow-xl space-y-2 mt-2">
        <div class="relative w-full h-[300px] bg-black rounded-xl overflow-hidden flex items-center justify-center">
          <video ref="videoElement" autoplay playsinline muted class="absolute inset-0 w-full h-full object-cover"></video>

          <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/40">
            <div class="w-[90%] h-[18%] border-2 border-red-500 rounded bg-transparent shadow-[0_0_0_999px_rgba(0,0,0,0.6)] relative">
              <span class="absolute -top-6 left-0 right-0 text-center text-[10px] text-white font-bold drop-shadow-md"> POSISIKAN <span class="text-red-400">WARNA & VIN</span> DI DALAM KOTAK </span>
              <div class="w-full h-[1px] bg-red-500/50 absolute top-1/2"></div>
            </div>
          </div>

          <button
            v-if="!isProcessing"
            type="button"
            @click="takeSnapshotAndRead"
            class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-blue-600 border-2 border-white text-white font-bold py-2.5 px-6 rounded-full text-sm shadow-xl hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Jepret & Baca</span>
          </button>

          <div v-else class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-slate-800 border-2 border-slate-600 text-white font-bold py-2.5 px-6 rounded-full text-sm shadow-xl flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Menganalisa...
          </div>
        </div>

        <button type="button" @click="stopScanner" class="w-full bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-red-700 transition flex items-center justify-center gap-1.5 shadow-md">
          <span>Tutup Kamera OCR</span>
        </button>
      </div>

      <div class="relative">
        <input
          type="text"
          v-model="form.no_rangka"
          placeholder="Scan OCR atau ketik..."
          required
          class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs font-mono tracking-wide font-bold"
        />
      </div>
    </div>

    <!-- Tipe Otomatis -->
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tipe & Varian Kendaraan *</label>
      <div
        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-inner flex items-center justify-between transition-all duration-300"
        :class="{ 'bg-indigo-50 border-indigo-300': form.tipe && form.tipe !== 'Tipe Tidak Ditemukan' }"
      >
        <span v-if="form.tipe && form.tipe !== 'Tipe Tidak Ditemukan'" class="text-indigo-800 font-extrabold tracking-wide">
          {{ form.tipe }}
        </span>
        <span v-else-if="form.tipe === 'Tipe Tidak Ditemukan'" class="text-red-500 italic font-bold"> ⚠ Tipe tidak ditemukan di Master NIK </span>
        <span v-else class="text-slate-400 italic text-sm"> Terisi otomatis... </span>

        <svg v-if="form.tipe && form.tipe !== 'Tipe Tidak Ditemukan'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
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
          placeholder="Contoh: 1500"
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
      <button type="submit" :disabled="loading" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
        <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ loading ? "Memproses..." : editData ? "Update Data" : "Simpan Data" }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, onBeforeUnmount, nextTick, watch } from "vue";

const props = defineProps({
  loading: Boolean,
  editData: Object,
  qcId: String, // Menerima ID QC otomatis dari App.vue
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
  MHKV3FA3J: "NEW MINIBUS 1.5 D",
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
  MHKT3FA1J: "PICK UP 1.5 3W",
  MHKAA1AA1: "ROCKY R",
  MHKAA1AA2: "ROCKY R",
  MHKAA1AA3: "ROCKY R",
  MHKAA1AA4: "ROCKY R",
  MHKAA1AA5: "ROCKY R",
  MHKAA1AA7: "ROCKY R",
  MHKAA1AA8: "ROCKY R",
  MHKAA1AAX: "ROCKY R",
  MHKAA1AA6: "ROCKY R",
  MHKAA1AA0: "ROCKY R",
  MHKAA1AA9: "ROCKY R",
  MHKAB1AA0: "ROCKY 1.2",
  MHKAB1AA1: "ROCKY X-1.2",
  MHKAB1AA2: "ROCKY X-1.2",
  MHKAB1AA3: "ROCKY X-1.2",
  MHKAB1AA4: "ROCKY X-1.2",
  MHKAB1AA5: "ROCKY X-1.2",
  MHKAB1AA6: "ROCKY X-1.2",
  MHKAB1AA7: "ROCKY X-1.2",
  MHKAB1AA8: "ROCKY X-1.2",
  MHKAB1AA9: "ROCKY X-1.2",
  MHKAB1AAX: "ROCKY X-1.2",
  PM2M804S3: "SIRION STD",
  MHKAA1AY0: "NEW XENIA X 1.3",
  MHKAA1AY1: "NEW XENIA X 1.3",
  MHKAA1AY2: "NEW XENIA X 1.3",
  MHKAA1AY3: "NEW XENIA X 1.3",
  MHKAA1AY4: "NEW XENIA X 1.3",
  MHKAA1AY5: "NEW XENIA X 1.3",
  MHKAA1AY6: "NEW XENIA X 1.3",
  MHKAA1AY7: "NEW XENIA X 1.3",
  MHKAA1AY8: "NEW XENIA X 1.3",
  MHKAA1AY9: "NEW XENIA X 1.3",
  MHKAA1AYX: "NEW XENIA X 1.3",
  MHKAB1AY0: "NEW XENIA R 1.5",
  MHKAB1AY3: "NEW XENIA R 1.5",
  MHKAB1AY8: "NEW XENIA R 1.5",
  MHKAB1AY2: "NEW XENIA R 1.5",
  MHKAB1AY6: "NEW XENIA R 1.5",
  MHKAB1AY4: "NEW XENIA R 1.5",
  MHKAB1AY5: "NEW XENIA R 1.5",
  MHKAB1AY7: "NEW XENIA R 1.5",
  MHKAB1AYX: "NEW XENIA R 1.5",
  MHKAB1AY1: "NEW XENIA R 1.5",
  MHKAB1AY9: "NEW XENIA R 1.5",
  MHKAA1AC0: "NEW AYLA X",
  MHKAA1AC1: "NEW AYLA X",
  MHKAA1AC2: "NEW AYLA X",
  MHKAA1AC3: "NEW AYLA X",
  MHKAA1AC4: "NEW AYLA X",
  MHKAA1AC5: "NEW AYLA X",
  MHKAA1AC6: "NEW AYLA X",
  MHKAA1AC7: "NEW AYLA X",
  MHKAA1AC8: "NEW AYLA X",
  MHKAA1AC9: "NEW AYLA X",
  MHKAA1ACX: "NEW AYLA X",
  MHKAB1AC0: "NEW AYLA R",
  MHKAB1AC1: "NEW AYLA R",
  MHKAB1AC2: "NEW AYLA R",
  MHKAB1AC3: "NEW AYLA R",
  MHKAB1AC4: "NEW AYLA R",
  MHKAB1AC5: "NEW AYLA R",
  MHKAB1AC6: "NEW AYLA R",
  MHKAB1AC7: "NEW AYLA R",
  MHKAB1AC8: "NEW AYLA R",
  MHKAB1AC9: "NEW AYLA R",
  MHKAB1ACX: "NEW AYLA R",
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
const isScanning = ref(false);
const isProcessing = ref(false);
const videoElement = ref(null);
let mediaStream = null;

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
    if (newVal && newVal.length >= 9) {
      const prefix = newVal.substring(0, 9).toUpperCase();
      form.tipe = masterNik[prefix] || "Tipe Tidak Ditemukan";
    } else if (!props.editData) {
      form.tipe = "";
    }
  }
);

const toggleScanner = async () => {
  if (isScanning.value) {
    stopScanner();
  } else {
    isScanning.value = true;
    await nextTick();
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoElement.value) {
        videoElement.value.srcObject = mediaStream;
        videoElement.value.setAttribute("playsinline", true);
        videoElement.value.play();
      }
    } catch (err) {
      alert("Gagal mengakses kamera. Pastikan izin kamera aktif pada browser.");
      isScanning.value = false;
    }
  }
};

const stopScanner = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  isScanning.value = false;
};

const takeSnapshotAndRead = async () => {
  if (!videoElement.value) return;
  isProcessing.value = true;

  try {
    const video = videoElement.value;
    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;
    const cropWidth = vWidth * 0.9;
    const cropHeight = vHeight * 0.18;
    const startX = (vWidth - cropWidth) / 2;
    const startY = (vHeight - cropHeight) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
    const base64CroppedImage = canvas.toDataURL("image/jpeg", 1.0);

    const formData = new FormData();
    formData.append("base64Image", base64CroppedImage);
    formData.append("apikey", "helloworld");
    formData.append("OCREngine", "1");
    formData.append("scale", "true");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result && result.ParsedResults && result.ParsedResults.length > 0) {
      let rawText = result.ParsedResults[0].ParsedText.toUpperCase();

      // ========================================================
      // 1. FILTER DAFTAR PUTIH WARNA (Blokir selain 8 warna ini)
      // ========================================================
      let detectedColor = "";
      for (let w of options.warna) {
        if (rawText.includes(w)) {
          detectedColor = w;
          break;
        }
      }

      // Jika warna tidak tertangkap karena typo (kamera buram), perbaiki!
      if (!detectedColor) {
        if (rawText.includes("WH1TE") || rawText.includes("WHTE")) detectedColor = "WHITE";
        if (rawText.includes("S1LVER") || rawText.includes("SLVER")) detectedColor = "SILVER";
        if (rawText.includes("8LACK") || rawText.includes("BLCK")) detectedColor = "BLACK";
        if (rawText.includes("6REY")) detectedColor = "GREY";
      }

      // ========================================================
      // 2. FILTER DAFTAR PUTIH VIN (Blokir semua kecuali MHK/PM2)
      // ========================================================
      // Hapus Typo dulu sebelum dicari
      let cleanText = rawText.replace(/I/g, "1").replace(/O/g, "0").replace(/Q/g, "0");
      // Sapu bersih spasi dan simbol, jadikan 1 teks panjang
      cleanText = cleanText.replace(/[^A-Z0-9]/g, "");

      // LOGIKA BLOKIR MUTLAK: Ekstrak HANYA yang 17 digit berawalan MHK atau PM2.
      // Kata "VEHICLE" atau "ENGINE" akan sepenuhnya diabaikan dan terbuang otomatis.
      const vinRegex = /(MHK|PM2)[A-Z0-9]{14}/g;
      const foundVINs = cleanText.match(vinRegex);

      if (foundVINs) {
        form.no_rangka = foundVINs[0];
        if (detectedColor) form.warna = detectedColor;
        try {
          navigator.vibrate(200);
        } catch (e) {}
        stopScanner();
      } else {
        alert("Gagal mendeteksi VIN. Teks yang tertangkap:\n" + rawText);
      }
    } else {
      alert("Gambar tidak jelas. Pastikan cahaya cukup dan fokus.");
    }
  } catch (err) {
    alert("Koneksi OCR gagal. Pastikan sinyal stabil.");
  } finally {
    isProcessing.value = false;
  }
};

onBeforeUnmount(() => stopScanner());

const handleSubmit = () => {
  if (!form.tipe || form.tipe === "Tipe Tidak Ditemukan") {
    alert("No Rangka (VIN) tidak valid! Tipe Kendaraan harus terisi otomatis sebelum menyimpan.");
    return;
  }
  if (!form.warna) {
    alert("Pilih Warna!");
    return;
  }

  // Menggabungkan form data dengan ID QC pengguna dari sesi (dikirim dari App.vue)
  emit("submit", { ...form, stempel_qc: props.qcId });
};

const handleReset = () => {
  Object.assign(form, getInitialForm());
  emit("reset");
};
</script>
