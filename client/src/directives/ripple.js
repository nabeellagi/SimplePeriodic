export default {
  mounted(el) {
    el.style.position = "relative";
    el.style.overflow = "hidden";

    el.addEventListener("click", (e) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);

      const ripple = document.createElement("span");

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";

      ripple.className = "droplet-ripple";

      // trigger color swap
      el.classList.add("ripple-active");

      el.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
        el.classList.remove("ripple-active");
      }, 600);
    });
  }
};