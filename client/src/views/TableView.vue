<script setup>
import Lenis from "lenis";

const lenis = new Lenis({ autoRaf: true });
</script>

<template>
  <section
    class="hero bg-ultramarine p-6 sm:p-10 flex flex-col justify-center items-center gap-y-4 relative"
  >
    <div
      style="background-image: url(&quot;/bganim.gif&quot;)"
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
      Periodic Table
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
  <section class="canvas-section flex flex-col justify-center items-center">
    <iframe src="/table.html" class="table-frame"></iframe>
  </section>
</template>

<style scoped>
* {
  color: #fffdf1;
}

.table-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* Mobile: hero + canvas = exactly 100dvh */
.hero {
  height: 15dvh;
  min-height: unset;
}

.canvas-section {
  height: 87dvh;
}

canvas {
  touch-action: pan-y;
  display: block;
}

/* Desktop: hero takes full screen minimum, canvas is natural height below */
@media (min-width: 640px) {
  .hero {
    height: auto;
    min-height: 100dvh;
  }

  .canvas-section {
    height: 92vh;
  }

  canvas {
    height: 92vh;
  }
}
</style>
