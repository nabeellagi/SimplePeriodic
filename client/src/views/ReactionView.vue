<script setup>
import { API_BASE } from "@/utils/api";
import Lenis from "lenis";
import { ref } from "vue";

const lenis = new Lenis({ autoRaf: true });

const equation = ref("");
const data = ref(null);
const loading = ref(false);
const error = ref(null);

async function analyzeReaction() {
  if (!equation.value) return;

  loading.value = true;
  error.value = null;

  try {
    const url = `${API_BASE}/api/reaction?eq=${encodeURIComponent(
      equation.value,
    )}`;

    const res = await fetch(url);
    const json = await res.json();

    data.value = json;
  } catch (err) {
    error.value = "Failed to analyze reaction.";
  }

  loading.value = false;
}
</script>

<template>
  <section
    class="hero bg-ultramarine p-6 sm:p-10 flex flex-col justify-center items-center gap-y-4 relative"
  >
    <div
      style="background-image: url(&quot;/eq.gif&quot;)"
      class="absolute inset-0 bg-center opacity-20 z-0"
    ></div>

    <h3
      class="relative z-10 font-delius text-milk tracking-widest text-base sm:text-lg"
    >
      Welcome to
    </h3>
    <h1
      class="relative z-10 font-rubikBubbles text-milk text-3xl sm:text-6xl lg:text-8xl  tracking-normal text-center leading-tight"
    >
      Reaction <br />
      Analyzer
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
      Paste your reaction and we'll balance it. As well as doing further
      analysis!
    </h4>
    <div class="w-full max-w-md flex flex-col justify-center items-center">
      <input
        v-model="equation"
        placeholder="Fe + S = FeS"
        class="w-[70vw] px-4 py-3 border-2 border-ultramarine rounded-lg focus:outline-none focus:ring-2 focus:ring-ultramarine focus:border-transparent transition-all duration-300 ease-in-out placeholder-gray-400 text-black font-semibold"
      />
      <button
        @click="analyzeReaction"
        class="mt-4 px-6 py-2 bg-ultramarine text-milk rounded-lg hover:opacity-90 font-dynaPuff"
      >
        Analyze
      </button>
      <div
        v-if="data"
        class="mt-8 text-2xl font-mono text-center text-milk p-4 rounded-lg shadow w-[80vw] bg-ultramarine"
      >
        {{ data.balanced_equation }}
      </div>
      <div v-if="data" class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
  
  <!-- Reactants -->
  <div>
    <h3 class="text-xl font-semibold mb-4 font-dynaPuff text-center">Reactants</h3>

    <div
      v-for="r in data.reactants"
      :key="r.formula"
      class="bg-cherry p-4 rounded-lg shadow mb-4 text-milk"
    >
      <h4 class="text-lg font-semibold">{{ r.formula }}</h4>
      <p>Molar Mass: {{ r.molar_mass.toFixed(3) }} g/mol</p>

      <div class="mt-2">
        <p class="font-semibold">Composition</p>
        <ul class="text-sm">
          <li v-for="(percent, el) in r.percent_composition" :key="el">
            {{ el }} — {{ percent.toFixed(2) }}%
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Products -->
  <div>
    <h3 class="text-xl font-semibold mb-4 font-dynaPuff text-center">Products</h3>

    <div
      v-for="p in data.products"
      :key="p.formula"
      class="bg-amberglow p-4 rounded-lg shadow mb-4"
    >
      <h4 class="text-lg font-semibold">{{ p.formula }}</h4>
      <p>Molar Mass: {{ p.molar_mass.toFixed(3) }} g/mol</p>

      <div class="mt-2">
        <p class="font-semibold">Composition</p>
        <ul class="text-sm">
          <li v-for="(percent, el) in p.percent_composition" :key="el">
            {{ el }} — {{ percent.toFixed(2) }}%
          </li>
        </ul>
      </div>
    </div>
  </div>

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
