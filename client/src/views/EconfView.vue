<script setup>
import { ref, onMounted } from "vue";
import Lenis from "lenis";

const lenis = new Lenis({ autoRaf: true });

const electrons = ref("");
const result = ref("");

let wasm;
let memory;

onMounted(async () => {
  const response = await fetch("/wasm/econf.wasm");
  const bytes = await response.arrayBuffer();

  const wasmModule = await WebAssembly.instantiate(bytes);

  wasm = wasmModule.instance.exports;
  memory = wasm.memory;
});

function compute() {
  if (!wasm) return;

  const z = Number(electrons.value);
  if (!z || z < 1 || z > 118) {
    result.value = "Enter a number between 1 and 118";
    return;
  }

  wasm.wasm_compute(z);

  const ptr = wasm.wasm_output_ptr();
  const len = wasm.wasm_output_len();

  const bytes = new Uint8Array(memory.buffer, ptr, len);
  result.value = new TextDecoder().decode(bytes);
}
</script>
<template>
  <section
    class="hero bg-ultramarine p-6 sm:p-10 flex flex-col justify-center items-center gap-y-4 relative"
  >
    <div
      style="background-image: url('/conf.gif')"
      class="absolute inset-0 bg-center opacity-20 z-0"
    ></div>

    <h3
      class="relative z-10 font-delius text-milk tracking-widest text-base sm:text-lg"
    >
      Welcome to
    </h3>
    <h1
      class="relative z-10 font-rubikBubbles text-milk text-3xl sm:text-9xl tracking-normal text-center leading-tight"
    >
      Electron Configuration <br />
      Calculator
    </h1>
    <svg
      class="absolute bottom-[-2px] left-0 w-full"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,0 C360,80 1080,80 1440,0 L1440,80 L0,80 Z" fill="#fffdf1" />
    </svg>
  </section>
  <section
    class="p-6 sm:p-10 flex flex-col justify-center items-center gap-y-6 min-h-auto sm:min-h-screen"
  >
    <h4
      class="text-xl sm:text-3xl font-dynaPuff text-bold text-black text-center"
    >
      Put the number of electrons, and see the configuration
    </h4>
    <div class="w-full max-w-md flex flex-col justify-center items-center">
      <input
        v-model="electrons"
        @input="compute"
        type="number"
        min="1"
        max="118"
        placeholder="Enter number (1-118)"
        class="w-1/2 px-4 py-3 border-2 border-ultramarine rounded-lg focus:outline-none focus:ring-2 focus:ring-ultramarine focus:border-transparent transition-all duration-300 ease-in-out placeholder-gray-400 text-black font-semibold"
      />
      <div
        v-if="result"
        class="mt-6 w-[90vw] max-w-xl bg-ultramarine text-milk p-4 rounded-lg font-mono whitespace-pre-wrap"
      >
        {{ result }}
      </div>
    </div>
  </section>
</template>

<style scoped>
body {
  color: #fffdf1;
}

/* Mobile: hero + canvas = exactly 100dvh */
.hero {
  height: 25dvh;
  min-height: unset;
}

@media (min-width: 640px) {
  .hero {
    height: auto;
    min-height: 100dvh;
  }
}
</style>
