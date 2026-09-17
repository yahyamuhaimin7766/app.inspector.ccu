<template>
  <header class="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-30 px-4 py-3 flex items-center justify-between shadow-xs">
    <div class="flex items-center gap-3">
      <!-- Logo Astra Daihatsu -->
      <div class="h-8 flex items-center bg-white px-1.5 py-0.5 rounded-lg border border-slate-100 shadow-2xs">
        <img src="/logo.png" alt="Astra Daihatsu Logo" class="h-6 w-auto object-contain" />
      </div>
      <div>
        <h1 class="font-extrabold text-slate-900 tracking-wide text-xs md:text-sm">CCU IN QC System</h1>
      </div>
    </div>
    <div class="flex gap-2">
      <slot></slot>
    </div>
  </header>
</template>
