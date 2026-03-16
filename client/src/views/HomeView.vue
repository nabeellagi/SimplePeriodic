<script setup>
import Lenis from "lenis";
import { ref } from "vue";
import gsap from "gsap";

const lenis = new Lenis({
  autoRaf: true,
});

const rangeRef = ref(null)
const rangeSprite = ref("/range/range (9).png")

function spinRange() {
  // change sprite
  rangeSprite.value = "/range/range (8).png"

  // spin animation
  gsap.to(rangeRef.value, {
    rotation: "+=1080", // 3 spins (360 * 3)
    duration: 1.2,
    ease: "power2.inOut",
    onComplete: () => {
      rangeSprite.value = "/range/range (9).png"
    }
  })
}
</script>

<template>
  <section
    class="bg-ultramarine p-6 sm:p-10 flex flex-col justify-center items-center gap-y-4 min-h-[50vh] sm:min-h-screen relative pb-14 scallop-bottom
    border-0"
  >
    <div
      style="background-image: url(&quot;/bganim.gif&quot;)"
      class="absolute inset-0 bg-center opacity-20 -z-10"
    ></div>
    <h3 class="font-delius text-milk tracking-widest text-base sm:text-lg">
      Say hi to
    </h3>
    <h1
      class="font-rubikBubbles text-milk text-7xl sm:text-9xl tracking-normal text-center leading-tight"
    >
      Simple<br />Periodic
    </h1>
    <p
      class="font-delius text-milk tracking-widest text-xs sm:text-sm text-center"
    >
      Modern periodic table web app for your everyday chemistry!!
    </p>
  </section>
  <section
    class="p-2 mt-2 sm:p-4 flex flex-col justify- items-center gap-y-4 min-h-[50vh] sm:min-h-screen relative pb-14"
  >
    <div class="flex flex-col sm:flex-row justify-center items-center">
      <div class="flex flex-col gap-2">
        <h4 class="text-4xl sm:text-6xl font-dynaPuff text-bold">Explore</h4>
        <h5 class="text-l sm:text-xl font-delius">
          And find out what we can do!
        </h5>
      </div>
      <div class="flex flex-col items-center">
        <img
          :src="rangeSprite"
          ref="rangeRef"
          @click="spinRange"
          class="w-3/4 md:w-[20vw] cursor-pointer"
          id="range"
        />
      </div>
    </div>
    <div class="flex justify-center items-start mt-10 px-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 w-[80vw] max-w-5xl">
        <!-- LEFT BIG CARD -->
        <RouterLink to="/periodictable"
          v-ripple
          class="bg-cherry rounded-2xl p-8 flex flex-col items-center justify-center sm:justify-end sm:row-span-2
          aspect-square sm:aspect-auto
          btn-base"
        >
          <img v-ripple class="invert-0 pointer-events-none" src="/pt.gif"/>
          <h3 class="text-4xl sm:text-7xl font-rubikBubbles text-milk mb-4">Periodic Table</h3>
        </RouterLink>

        <!-- RIGHT TOP -->
        <RouterLink
          v-ripple
          class="bg-ultramarine rounded-2xl p-6 flex flex-col items-center justify-center aspect-square
          btn-base"
        >
          <img v-ripple class="invert-0 pointer-events-none" src="/conf.gif"/>
          <h3 class="text-2xl sm:text-6xl font-rubikBubbles text-milk mb-2 text-center">
            Electron Configuration
          </h3>
        </RouterLink>

        <!-- RIGHT BOTTOM (nested grid) -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Explorer -->
          <RouterLink
            v-ripple
            class="bg-ultramarine rounded-2xl p-6 flex flex-col items-center justify-center aspect-auto sm:aspect-square
            btn-base"
          >
            <img v-ripple class="invert-0 pointer-events-none" src="/eq.gif"/>
            <h3 class="text-2xl sm:text-3xl font-rubikBubbles text-milk mb-1">Reaction Analyzer</h3>
          </RouterLink>

          <!-- Trends -->
          <RouterLink
            v-ripple
            class="bg-ultramarine rounded-2xl p-6 flex flex-col items-center justify-center aspect-auto sm:aspect-square
            btn-base"
          >
            <img v-ripple class="invert-0 pointer-events-none" src="/tr.gif"/>
            <h3 class="text-2xl sm:text-3xl font-rubikBubbles text-milk mb-1">Trends</h3>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
  <section class="p-6 sm:p-10 flex flex-col justify-center items-center gap-y-4 min-h-[50vh] sm:min-h-screen relative pb-14">
    <h3 class="font-delius tracking-widest text-base sm:text-lg">
      Made with ❤️ by
    </h3>
    <h1
      class="font-rubikBubbles text-5xl sm:text-7xl tracking-normal text-center leading-tight"
    >
      Nabeel Adr.
    </h1>
    <a
      href="https://github.com/nabeellagi/SimplePeriodic"
      target="_blank"
      class="hover:text-amberglow transition-colors duration-200"
    >
      <i class="pi pi-github text-3xl"></i>
    </a>
  </section>
</template>

<style scoped>
.scallop-bottom {
  --r: 40px;
  --gap: 2.5;
  mask:
    linear-gradient(#000 0 0) no-repeat 50% 0 / 100% calc(100% - var(--r)),
    radial-gradient(farthest-side, #0000 80%, #000 82%) 50%
      calc(100% - var(--r)) / calc(var(--gap) * var(--r)) calc(2 * var(--r))
      round;
}
@media (min-width: 640px) {
  .scallop-bottom {
    --r: 52px;
  }
}
</style>
