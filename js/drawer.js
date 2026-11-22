/**
 * Hunter's Journal Drawer Module
 * Renders selected node details, outgoing/incoming paths, completion toggle,
 * and mobile swipe-down dismissal.
 */
(() => {
  function createDrawer({ store, onSelectNode, onToggleComplete, onClose }) {
    const { state, nodeById, outgoingMap, incomingMap } = store;

    const drawer = document.getElementById("detail-drawer");
    const drawerHeader = document.getElementById("drawer-header");
    const drawerHandle = drawer.querySelector(".drawer-handle");
    const drawerClose = document.getElementById("drawer-close");
    const drawerMeta = document.getElementById("drawer-meta");
    const drawerTitle = document.getElementById("drawer-title");
    const drawerSubtitle = document.getElementById("drawer-subtitle");
    const drawerSummary = document.getElementById("drawer-summary");
    const drawerKeyItem = document.getElementById("drawer-key-item");
    const drawerRecLevel = document.getElementById("drawer-rec-level");
    const completeBtn = document.getElementById("complete-btn");
    const nextPathsList = document.getElementById("next-paths-list");
    const prevPathsList = document.getElementById("prev-paths-list");

    function renderPathCards(container, edges, isIncoming) {
      container.innerHTML = "";
      if (edges.length === 0) {
        container.innerHTML = isIncoming
          ? `<div class="empty-note">Starting point of the hunt.</div>`
          : `<div class="empty-note">End of this branch. Return to another hub or continue the main hunt.</div>`;
        return;
      }

      edges.forEach(edge => {
        const linkedNode = nodeById.get(isIncoming ? edge.from : edge.to);
        const btn = document.createElement("button");
        btn.className = `path-card ${isIncoming ? "is-incoming " : ""}type-${edge.type}`;
        btn.innerHTML = `
          <div class="path-card-main">
            <div class="path-card-top">
              <span class="path-code">${edge.id}</span>
              <span class="path-target-name">${linkedNode.code} · ${linkedNode.title}</span>
            </div>
            <div class="path-req">${edge.label}</div>
          </div>
          <span class="path-arrow">${isIncoming ? "←" : "→"}</span>
        `;
        btn.addEventListener("click", () => onSelectNode(linkedNode.id, true));
        container.appendChild(btn);
      });
    }

    function render(node) {
      drawerHeader.classList.toggle("is-dlc", node.category === "dlc");

      const catLabel =
        node.category === "main" ? "Main Route" :
        node.category === "dlc" ? "The Old Hunters DLC" :
        "Optional";

      drawerMeta.innerHTML = `
        <span class="badge badge-code">Node ${node.code}</span>
        <span class="badge badge-${node.category}">${catLabel}</span>
        <span class="badge badge-order">Route #${node.order}</span>
      `;

      drawerTitle.textContent = node.title;
      drawerSubtitle.textContent = node.subtitle;
      drawerSummary.textContent = node.summary;
      drawerKeyItem.textContent = node.keyItem || "None";
      drawerRecLevel.textContent = `BL ${node.recommendedLevel || "—"}`;

      const isDone = state.completed.has(node.id);
      completeBtn.classList.toggle("is-done", isDone);
      completeBtn.textContent = isDone ? "✓ Marked as Completed" : "Mark Node Completed";

      renderPathCards(nextPathsList, outgoingMap.get(node.id) || [], false);
      renderPathCards(prevPathsList, incomingMap.get(node.id) || [], true);
    }

    function open(node) {
      render(node);
      drawer.classList.add("open");
      document.body.classList.add("drawer-open");
    }

    function close() {
      drawer.classList.remove("open");
      document.body.classList.remove("drawer-open");
    }

    // Bind controls
    drawerClose.addEventListener("click", onClose);
    completeBtn.addEventListener("click", onToggleComplete);

    // Mobile swipe-down on handle or header to dismiss bottom sheet
    let sheetStartY = 0;
    [drawerHandle, drawerHeader].forEach(el => {
      if (!el) return;
      el.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) sheetStartY = e.touches[0].clientY;
      }, { passive: true });
      el.addEventListener("touchend", (e) => {
        if (!e.changedTouches.length) return;
        const dy = e.changedTouches[0].clientY - sheetStartY;
        if (dy > 55 && window.innerWidth <= 768) onClose();
      }, { passive: true });
    });

    return { open, close, render };
  }

  window.BloodborneMap = window.BloodborneMap || {};
  window.BloodborneMap.createDrawer = createDrawer;
})();
