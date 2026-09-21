<template>
  <nav class="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
    <div class="flex items-center gap-3">
      <div class="font-extrabold text-slate-800 text-lg tracking-tight">CCU<span class="text-blue-600">QC</span></div>
      <!-- Indikator User Login -->
      <span v-if="qcId" class="bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[10px] px-2.5 py-1 rounded-md tracking-wider"> ID: {{ qcId }} </span>
    </div>

    <div class="flex items-center gap-2">
      <slot></slot>
      <!-- Tombol Logout -->
      <button v-if="qcId" @click="$emit('logout')" class="text-[10px] font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition shadow-xs uppercase">Keluar</button>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  qcId: { type: String, default: null },
});
defineEmits(["logout"]);
</script>
