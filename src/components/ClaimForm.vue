<template>
  <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-w-xl mx-auto pb-28">
    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tanggal *</label>
      <input type="date" v-model="form.tanggal" required class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
    </div>

    <!-- No Rangka + Input File iOS Asli (Metode Foto) -->
    <div class="space-y-1.5">
      <div class="flex justify-between items-center">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">No Rangka (VIN) *</label>
      </div>

      <!-- Tombol Pemanggil Kamera Bawaan HP -->
      <div class="relative w-full">
        <!-- Input File disembunyikan tapi diakses lewat label/tombol -->
        <input type="file" id="cameraInput" accept="image/*" capture="environment" @change="handleNativeCamera" class="hidden" :disabled="isProcessing" />

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
            <span class="text-sm">Buka Kamera HP (Lebih Jernih)</span>
            <span class="text-[10px] text-slate-400 font-normal">Menggunakan OCR Engine 2</span>
          </div>

          <div v-else class="flex items-center gap-3">
            <span class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            <span>Menganalisa Foto...</span>
          </div>
        </label>
      </div>

      <div class="relative mt-2">
        <input
          type="text"
          v-model="form.no_rangka"
          placeholder="Scan OCR atau ketik singkatan manual..."
          required
          class="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-4 py-3 uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs font-mono tracking-wide font-bold"
        />
      </div>
    </div>

    <!-- Tipe Otomatis / Manual -->
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
      <p class="text-[10px] text-slate-500">Terisi otomatis dari 17 digit VIN. Bebas ketik manual jika input singkatan cacat.</p>
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
      <button type="submit" :disabled="loading" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
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
const isProcessing = ref(false);

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

// Auto-fill Tipe hanya jika panjangnya cukup, membiarkan override manual
watch(
  () => form.no_rangka,
  (newVal) => {
    if (newVal) {
      const cleanVal = newVal.replace(/\s/g, "").toUpperCase();
      if (cleanVal.length >= 9) {
        const prefix = cleanVal.substring(0, 9);
        if (masterNik[prefix]) {
          form.tipe = masterNik[prefix]; // Auto-fill jika terdaftar di Master NIK
        }
      }
    } else if (!props.editData) {
      form.tipe = "";
    }
  }
);

// FUNGSI NATIVE KAMERA IPHONE & OCR ENGINE 2
const handleNativeCamera = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isProcessing.value = true;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 1200;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const base64Image = canvas.toDataURL("image/jpeg", 0.8);

      const formData = new FormData();
      formData.append("base64Image", base64Image);
      formData.append("apikey", "helloworld");
      formData.append("OCREngine", "2");
      formData.append("isTable", "true");
      formData.append("scale", "true");

      try {
        const response = await fetch("https://api.ocr.space/parse/image", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result && result.ParsedResults && result.ParsedResults.length > 0) {
          let rawText = result.ParsedResults[0].ParsedText.toUpperCase();

          let detectedColor = "";
          for (let w of options.warna) {
            if (rawText.includes(w)) {
              detectedColor = w;
              break;
            }
          }
          if (!detectedColor) {
            if (rawText.includes("WH1TE") || rawText.includes("WHTE")) detectedColor = "WHITE";
            if (rawText.includes("S1LVER") || rawText.includes("SLVER")) detectedColor = "SILVER";
            if (rawText.includes("8LACK") || rawText.includes("BLCK")) detectedColor = "BLACK";
            if (rawText.includes("6REY") || rawText.includes("GPEY")) detectedColor = "GREY";
          }

          let cleanText = rawText.replace(/I/g, "1").replace(/L/g, "1").replace(/\|/g, "1").replace(/!/g, "1").replace(/O/g, "0").replace(/Q/g, "0").replace(/D/g, "0");
          cleanText = cleanText.replace(/[^A-Z0-9]/g, "");

          let mhkIndex = cleanText.indexOf("MHK");
          if (mhkIndex === -1) mhkIndex = cleanText.indexOf("PM2");

          if (mhkIndex !== -1 && cleanText.length >= mhkIndex + 17) {
            let finalVin = cleanText.substring(mhkIndex, mhkIndex + 17);

            finalVin = finalVin.replace("8A1", "BA1");
            finalVin = finalVin.replace("B41", "BA1");
            finalVin = finalVin.replace("P38A1", "P3BA1");

            form.no_rangka = finalVin;
            if (detectedColor) form.warna = detectedColor;

            try {
              navigator.vibrate(200);
            } catch (e) {}
          } else {
            alert("Gagal mendeteksi VIN 17 digit.\n\nJika label cacat, silakan ketik manual.");
          }
        } else {
          alert("Gagal membaca foto. Pastikan gambar jelas dan terang.");
        }
      } catch (err) {
        alert("Gagal menghubungi server OCR. Periksa koneksi internet Anda.");
      } finally {
        isProcessing.value = false;
        event.target.value = "";
      }
    };
    img.src = e.target.result;
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
