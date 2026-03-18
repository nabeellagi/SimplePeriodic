<script setup>
import { ref, onMounted, watch } from "vue";
import Lenis from "lenis";
import Chart from "chart.js/auto";
import { API_BASE } from "@/utils/api";

const lenis = new Lenis({ autoRaf: true });

// State
const type = ref("");
const value = ref("");
const property = ref("");
const chartInstance = ref(null);
const canvasRef = ref(null);

// Options
const properties = [
  "atomic_radius",
  "electronegativity",
  "ionization_energy",
  "density",
  "boiling_point",
];

// Fetch + render
const fetchData = async () => {
  if (!type.value || !value.value || !property.value) return;

  const res = await fetch(
    `${API_BASE}/api/trend?property=${property.value}&type=${type.value}&value=${value.value}`,
  );

  const json = await res.json();

  const labels = json.data.map((d) => d.symbol);
  const values = json.data.map((d) => (d.value === null ? 0 : d.value));

  renderChart(labels, values);
};

const renderChart = (labels, values) => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  const milk = "#fffdf1";
  const ultramarine = "#1e3a8a"; // adjust if your custom color differs

  chartInstance.value = new Chart(canvasRef.value, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: property.value.replaceAll("_", " "),
          data: values,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          borderColor: milk,
          backgroundColor: milk,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          labels: {
            color: milk,
          },
        },
      },

      scales: {
        x: {
          ticks: { color: milk },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
        y: {
          ticks: { color: milk },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
      },
    },

    plugins: [
      {
        id: "bg-color",
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          ctx.save();
          ctx.globalCompositeOperation = "destination-over";
          ctx.fillStyle = ultramarine;
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        },
      },
    ],
  });
};

const handleVisualize = () => {
  fetchData();
};
</script>

<template>
  <section
    class="hero bg-ultramarine p-6 sm:p-10 flex flex-col justify-center items-center gap-y-4 relative"
  >
    <div
      style="background-image: url(&quot;/tr.gif&quot;)"
      class="absolute inset-0 bg-center opacity-20 z-0"
    ></div>

    <h3
      class="relative z-10 font-delius text-milk tracking-widest text-base sm:text-lg"
    >
      Welcome to
    </h3>
    <h1
      class="relative z-10 font-rubikBubbles text-milk text-3xl sm:text-6xl lg:text-8xl tracking-normal text-center leading-tight"
    >
      Trends Visualizer
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
      Choose which period or groups and see the trends!
    </h4>
    <!-- Controls -->
    <div
      class="bg-white shadow-xl rounded-2xl p-6 flex flex-col sm:flex-row gap-4 font-dynaPuff font-light w-full max-w-5xl"
    >
      <!-- Type -->
      <select
        v-model="type"
        class="p-3 rounded-lg border border-gray-300 focus:outline-none w-full"
      >
        <option disabled value="">Type</option>
        <option value="group">Group</option>
        <option value="period">Period</option>
      </select>

      <!-- Value -->
      <input
        v-if="type"
        v-model="value"
        type="number"
        :min="1"
        :max="type === 'group' ? 18 : 7"
        placeholder="Value"
        class="p-3 rounded-lg border border-gray-300 focus:outline-none w-full"
      />

      <!-- Property -->
      <select
        v-if="type && value"
        v-model="property"
        class="p-3 rounded-lg border border-gray-300 focus:outline-none w-full"
      >
        <option disabled value="">Property</option>
        <option v-for="p in properties" :key="p" :value="p">
          {{ p }}
        </option>
      </select>

      <!-- Button -->
      <button
        @click="handleVisualize"
        class="bg-ultramarine text-milk px-6 py-3 rounded-lg w-full sm:w-auto cursor-pointer transition-all duration-200 ease-out hover:opacity-90 hover:scale-105 hover:shadow-lg active:scale-95 active:shadow-md focus:outline-none focus:ring-2 focus:ring-milk/50"
      >
        Visualize!
      </button>
    </div>

    <!-- Chart -->
    <div
      v-if="property"
      class="bg-ultramarine shadow-xl rounded-2xl p-4 h-[300px] sm:h-[400px] w-[80vw]"
    >
      <canvas ref="canvasRef"></canvas>
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
