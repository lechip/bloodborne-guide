/**
 * HUD Controls Module
 * Manages category filters, search dropdown, recommended route order toggle,
 * progress counter, and the map overlay popover.
 */
(() => {
  function createHud({
    store,
    onFilterChange,
    onSelectNode,
    onOrderToggle,
    onOverlayChange,
    onEscape
  }) {
    const { data, state } = store;

    const progressText = document.getElementById("progress-text");
    const hintToast = document.getElementById("hint-toast");
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const orderToggleBtn = document.getElementById("order-toggle-btn");

    const overlayToggleBtn = document.getElementById("overlay-toggle-btn");
    const overlayPopover = document.getElementById("overlay-popover");
    const overlayFileInput = document.getElementById("overlay-file");
    const overlayOpacityInput = document.getElementById("overlay-opacity");
    const overlayScaleInput = document.getElementById("overlay-scale");
    const overlayClearBtn = document.getElementById("overlay-clear");

    function updateProgress() {
      const total = data.nodes.length;
      const done = state.completed.size;
      progressText.innerHTML = `Slain / Cleared: <strong>${done} / ${total}</strong>`;
    }

    function hideHint() {
      hintToast.classList.add("hidden");
    }

    function renderSearchResults(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        searchResults.classList.remove("open");
        return;
      }

      const matches = data.nodes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.code.toLowerCase().includes(q) ||
        (n.bosses && n.bosses.some(b => b.toLowerCase().includes(q)))
      );

      searchResults.innerHTML = "";
      if (matches.length === 0) {
        searchResults.innerHTML = `<div class="search-item"><span class="search-item-title" style="color:var(--text-ash)">No matching locations</span></div>`;
      } else {
        matches.slice(0, 8).forEach(n => {
          const div = document.createElement("div");
          div.className = "search-item";
          div.innerHTML = `
            <span class="search-item-code">${n.code}</span>
            <span class="search-item-title">${n.title}</span>
          `;
          div.addEventListener("click", () => {
            searchResults.classList.remove("open");
            searchInput.value = "";
            onSelectNode(n.id, true);
          });
          searchResults.appendChild(div);
        });
      }
      searchResults.classList.add("open");
    }

    // Category filter buttons
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.filter = btn.dataset.filter;
        onFilterChange();
      });
    });

    // Recommended route order toggle
    orderToggleBtn.addEventListener("click", () => {
      state.showOrder = !state.showOrder;
      orderToggleBtn.classList.toggle("active", state.showOrder);
      document.body.classList.toggle("show-order", state.showOrder);
      onOrderToggle(state.showOrder);
    });

    // Search input
    searchInput.addEventListener("input", (e) => renderSearchResults(e.target.value));

    // Overlay popover controls
    overlayToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      overlayPopover.classList.toggle("open");
    });

    overlayFileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.overlay.url = reader.result;
        onOverlayChange();
      };
      reader.readAsDataURL(file);
    });

    overlayOpacityInput.addEventListener("input", (e) => {
      state.overlay.opacity = parseFloat(e.target.value);
      onOverlayChange();
    });

    overlayScaleInput.addEventListener("input", (e) => {
      state.overlay.scale = parseFloat(e.target.value);
      onOverlayChange();
    });

    overlayClearBtn.addEventListener("click", () => {
      state.overlay.url = "";
      overlayFileInput.value = "";
      onOverlayChange();
    });

    // Global dismiss handlers
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrap")) searchResults.classList.remove("open");
      if (!e.target.closest("#overlay-popover") && !e.target.closest("#overlay-toggle-btn")) {
        overlayPopover.classList.remove("open");
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        overlayPopover.classList.remove("open");
        onEscape();
      }
    });

    return { updateProgress, hideHint };
  }

  window.BloodborneMap = window.BloodborneMap || {};
  window.BloodborneMap.createHud = createHud;
})();
