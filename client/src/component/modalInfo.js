import { API_BASE } from "@/utils/api";
import { el, mount, setChildren } from "redom";

function safe(val) {
  return val === null || val === undefined ? "-" : val;
}

function row(label, value) {
  return el(
    "div",
    { className: "flex justify-between border-b border-gray-100 py-2" },
    [
      el(
        "span",
        { className: "font-semibold text-gray-800 font-dynaPuff" },
        label,
      ),
      el(
        "span",
        { className: "text-gray-700 font-dynaPuff text-right max-w-[60%]" },
        String(value),
      ),
    ],
  );
}

class ModalInfo {
  constructor() {
    // overlay
    this.overlay = el("div", {
      className:
        "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 opacity-0 pointer-events-none transition-opacity duration-300",
    });

    // modal panel
    this.modal = el(
      "div",
      {
        className:
          "bg-white rounded-xl shadow-2xl w-[92%] max-w-xl max-h-[85vh] overflow-y-auto transform scale-95 transition-all duration-300",
      },
      [
        el(
          "div",
          {
            className:
              "flex justify-between items-center border-b border-gray-200 px-6 py-4",
          },
          [
            (this.title = el("h2", {
              className: "text-xl text-gray-800 tracking-wide",
            })),

            (this.closeBtn = el(
              "button",
              {
                className:
                  "text-gray-500 hover:text-red-500 text-xl leading-none transition cursor-pointer",
              },
              "✕",
            )),
          ],
        ),

        (this.content = el("div", {
          className:
            "p-6 text-gray-700 font-delius text-base leading-relaxed space-y-2",
        })),
      ],
    );

    mount(this.overlay, this.modal);
    mount(document.body, this.overlay);

    this.closeBtn.onclick = () => this.close();

    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    };
  }

  async loadElement(symbol) {
    try {
      const res = await fetch(
        `${API_BASE}/api/element?symbol=${symbol}`,
      );

      const data = await res.json();

      const massNumber =
        safe(data.protons) !== "-" && safe(data.neutrons) !== "-"
          ? data.protons + data.neutrons
          : "-";

      const rows = [
        row("Atomic Number", safe(data.atomic_number)),
        row("Symbol", safe(data.symbol)),
        row("Name", safe(data.name)),
        row("Mass Number", massNumber),
        row("Protons", safe(data.protons)),
        row("Neutrons", safe(data.neutrons)),
        row("Electrons", safe(data.electrons)),
        row("Atomic Weight", safe(data.atomic_weight)),
        row("Atomic Radius", safe(data.atomic_radius)),
        row("Atomic Volume", safe(data.atomic_volume)),
        row("Density", safe(data.density)),
        row("Block", safe(data.block)),
        row("Group", safe(data.group_id)),
        row("Period", safe(data.period)),
        row("Electron Configuration", safe(data.econf)),
        row("Electron Affinity", safe(data.electron_affinity)),
        row("Melting Point", safe(data.melting_point)),
        row("Boiling Point", safe(data.boiling_point)),
        row("Heat of Formation", safe(data.heat_of_formation)),
        row("Molar Heat Capacity", safe(data.molar_heat_capacity)),
        row("Abundance (Crust)", safe(data.abundance_crust)),
        row("Abundance (Sea)", safe(data.abundance_sea)),
        row("Geochemical Class", safe(data.geochemical_classification)),
        row("Discovery Year", safe(data.discovery_year)),
        row("Discovery Location", safe(data.discovery_location)),
        row("Discoverers", safe(data.discoverers)),
      ];

      setChildren(this.content, rows);
    } catch (err) {
      setChildren(this.content, [
        el(
          "div",
          { className: "text-red-500 font-dynaPuff" },
          "Failed to load element data.",
        ),
      ]);
    }
  }

  open(symbol) {
    this.title.textContent = `Element: ${symbol}`;
    setChildren(this.content, [
      el("div", { className: "text-gray-500 font-delius" }, "Loading..."),
    ]);

    this.overlay.classList.remove("pointer-events-none");

    requestAnimationFrame(() => {
      this.overlay.classList.remove("opacity-0");
      this.modal.classList.remove("scale-95");
      this.modal.classList.add("scale-100");
    });

    // fetch API AFTER opening
    this.loadElement(symbol);
  }

  close() {
    this.overlay.classList.add("opacity-0");
    this.modal.classList.remove("scale-100");
    this.modal.classList.add("scale-95");

    setTimeout(() => {
      this.overlay.classList.add("pointer-events-none");
    }, 300);
  }
}

// singleton
const modalInstance = new ModalInfo();

export function openInfo(symbol) {
  modalInstance.open(symbol);
}
