<template>
  <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-w-xl mx-auto pb-28">
    <!-- ELEMEN TERSEMBUNYI UNTUK MESIN BARCODE -->
    <div id="qr-reader" style="position: absolute; top: -9999px; width: 300px; height: 300px"></div>

    <div class="space-y-1.5">
      <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">Tanggal *</label>
      <input type="date" v-model="form.tanggal" required class="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs" />
    </div>

    <!-- No Rangka + Input File iOS Asli untuk BARCODE -->
    <div class="space-y-1.5">
      <div class="flex justify-between items-center">
        <label class="text-xs font-bold tracking-wider text-slate-600 uppercase">No Rangka (VIN) *</label>
      </div>

      <!-- Tombol Pemanggil Kamera Asli (Aman untuk iPhone) -->
      <div class="relative w-full">
        <input type="file" id="cameraInput" accept="image/*" capture="environment" @change="handleBarcodeScan" class="hidden" :disabled="isProcessing" />

        <label
          for="cameraInput"
          class="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg cursor-pointer hover:bg-slate-800 transition border-2 border-green-500"
          :class="{ 'opacity-75 pointer-events-none': isProcessing }"
        >
          <div v-if="!isProcessing" class="flex flex-col items-center">
            <svg class="w-8 h-8 text-green-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <span class="text-sm">Jepret Barcode VIN (Kamera HP)</span>
            <span class="text-[10px] text-green-300 font-normal">Fokuskan Kamera pada Garis Barcode VIN</span>
          </div>

          <div v-else class="flex items-center gap-3">
            <span class="w-6 h-6 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></span>
            <span>Membaca Barcode...</span>
          </div>
        </label>
      </div>

      <div class="relative mt-2">
        <input
          type="text"
          v-model="form.no_rangka"
          placeholder="Scan Barcode atau ketik..."
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
import { Html5Qrcode } from "html5-qrcode";

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

// FUNGSI UTAMA PEMBACAAN BARCODE DARI FOTO
const handleBarcodeScan = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isProcessing.value = true;

  try {
    // Inisialisasi engine barcode lokal (tidak butuh internet)
    const html5QrCode = new Html5Qrcode("qr-reader");

    // Baca barcode langsung dari file gambar yang di-upload iOS
    const decodedText = await html5QrCode.scanFileV2(file, true);

    // Jika berhasil terbaca
    const text = decodedText.decodedText.toUpperCase();

    // Filter hanya mencari barcode VIN (MHK / PM2 dengan total 17 digit)
    const vinRegex = /(MHK|PM2)[A-Z0-9]{14}/g;
    const match = text.match(vinRegex);

    if (match) {
      form.no_rangka = match[0];
      try {
        navigator.vibrate(200);
      } catch (e) {}
    } else {
      alert("Barcode yang terbaca bukan VIN Daihatsu.\n\nYang terbaca: " + text + "\n\nPastikan foto fokus ke garis barcode VIN (bawah teks).");
    }

    // Bersihkan instance
    html5QrCode.clear();
  } catch (err) {
    alert("Gagal menemukan Barcode di gambar ini.\n\nTIPS: Saat memotret, pastikan garis-garis Barcode terlihat tajam dan tidak silau.");
  } finally {
    isProcessing.value = false;
    event.target.value = ""; // Reset input file
  }
};

const handleSubmit = () => {
  if (!form.tipe || form.tipe === "Tipe Tidak Ditemukan") {
    alert("No Rangka (VIN) tidak valid! Tipe Kendaraan harus terisi otomatis sebelum menyimpan.");
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
