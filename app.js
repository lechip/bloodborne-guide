/**
 * Bloodborne Interactive Progression Map — Controller
 */
(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const STORAGE_KEY = "bloodborne_map_completed_v1";

  const NODE_W = 204;
  const NODE_H = 74;

  const state = {
    selectedId: null,
    filter: "all",
    showOrder: false,
    completed: new Set(),
    // Pan / zoom state
    tx: 0,
    ty: 0,
    scale: 0.72,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    panOriginX: 0,
    panOriginY: 0,
    // Overlay image state
    overlayUrl: BLOODBORNE_MAP_DATA.overlayConfig.imageUrl || "",
    overlayOpacity: BLOODBORNE_MAP_DATA.overlayConfig.opacity || 0.35,
    overlayScale: BLOODBORNE_MAP_DATA.overlayConfig.scale || 1
  };

  // Lookup maps
  const nodeById = new Map(BLOODBORNE_MAP_DATA.nodes.map(n => [n.id, n]));
  const outgoingMap = new Map();
  const incomingMap = new Map();
  BLOODBORNE_MAP_DATA.nodes.forEach(n => {
    outgoingMap.set(n.id, []);
    incomingMap.set(n.id, []);
  });
  BLOODBORNE_MAP_DATA.edges.forEach(e => {
    if (outgoingMap.has(e.from)) outgoingMap.get(e.from).push(e);
    if (incomingMap.has(e.to)) incomingMap.get(e.to).push(e);
  });

  // DOM references
  const viewport = document.getElementById("map-viewport");
  const svg = document.getElementById("map-svg");
  const worldGroup = document.getElementById("world-group");
  const overlayLayer = document.getElementById("overlay-layer");
  const phaseLayer = document.getElementById("phase-layer");
  const recommendedLayer = document.getElementById("recommended-layer");
  const edgeLayer = document.getElementById("edge-layer");
  const nodeLayer = document.getElementById("node-layer");

  const drawer = document.getElementById("detail-drawer");
  const drawerHeader = document.getElementById("drawer-header");
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

  // Element registries
  const nodeEls = new Map();
  const edgeEls = new Map();

  function createSvgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    return el;
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        saved.forEach(id => {
          if (nodeById.has(id)) state.completed.add(id);
        });
      }
    } catch (_) {
      // Ignore storage errors
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completed]));
    } catch (_) {
      // Ignore storage errors
    }
  }

  function updateProgressPill() {
    const total = BLOODBORNE_MAP_DATA.nodes.length;
    const done = state.completed.size;
    progressText.innerHTML = `Slain / Cleared: <strong>${done} / ${total}</strong>`;
  }

  // =========================================================
  // Rendering
  // =========================================================
  function renderPhases() {
    phaseLayer.innerHTML = "";
    BLOODBORNE_MAP_DATA.phases.forEach(phase => {
      const rect = createSvgEl("rect", {
        x: phase.x,
        y: phase.y,
        width: phase.width,
        height: phase.height,
        class: phase.isDlc ? "phase-frame dlc-frame" : "phase-frame"
      });
      const label = createSvgEl("text", {
        x: phase.x + 18,
        y: phase.y + 26,
        class: phase.isDlc ? "phase-label dlc-label" : "phase-label"
      });
      label.textContent = phase.label;
      phaseLayer.appendChild(rect);
      phaseLayer.appendChild(label);
    });
  }

  function renderRecommendedOrderLine() {
    recommendedLayer.innerHTML = "";
    const sorted = [...BLOODBORNE_MAP_DATA.nodes].sort((a, b) => a.order - b.order);
    const points = sorted.map(n => `${n.x},${n.y}`).join(" ");
    const poly = createSvgEl("polyline", {
      points,
      class: "recommended-line",
      id: "recommended-polyline"
    });
    poly.style.display = state.showOrder ? "block" : "none";
    recommendedLayer.appendChild(poly);
  }

  function computeEdgePath(edge) {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const halfW = NODE_W / 2;
    const halfH = NODE_H / 2;

    // Pick anchor points on card borders for clean arrowheads
    let x1 = from.x;
    let y1 = from.y;
    let x2 = to.x;
    let y2 = to.y;

    if (Math.abs(dx) > Math.abs(dy) * 0.9) {
      x1 = from.x + (dx >= 0 ? halfW : -halfW);
      x2 = to.x + (dx >= 0 ? -halfW - 6 : halfW + 6);
    } else {
      y1 = from.y + (dy >= 0 ? halfH : -halfH);
      y2 = to.y + (dy >= 0 ? -halfH - 6 : halfH + 6);
    }

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    let cx = mx;
    let cy = my;

    if (edge.curveOffset) {
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const nx = -(y2 - y1) / len;
      const ny = (x2 - x1) / len;
      cx = mx + nx * edge.curveOffset;
      cy = my + ny * edge.curveOffset;
    } else if (Math.abs(dx) > 40 && Math.abs(dy) > 40) {
      // Gentle S-like quadratic bend
      cx = mx;
      cy = y1 + (y2 - y1) * 0.35;
    }

    // Point on quadratic bezier at t=0.5 for badge placement
    const bx = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
    const by = 0.25 * y1 + 0.5 * cy + 0.25 * y2;

    const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
    return { d, bx, by };
  }

  function renderEdges() {
    edgeLayer.innerHTML = "";
    edgeEls.clear();

    BLOODBORNE_MAP_DATA.edges.forEach(edge => {
      const { d, bx, by } = computeEdgePath(edge);
      const g = createSvgEl("g", {
        class: `edge-group type-${edge.type}`,
        "data-edge-id": edge.id
      });

      const markerId = edge.type === "dlc" ? "url(#arrow-dlc)" : "url(#arrow-default)";
      const path = createSvgEl("path", {
        d,
        class: `edge-path type-${edge.type}`,
        "marker-end": markerId
      });

      // Invisible wider hit area for easier clicking
      const hitPath = createSvgEl("path", {
        d,
        fill: "none",
        stroke: "transparent",
        "stroke-width": "14",
        style: "cursor:pointer"
      });

      // Numbered path badge (e.g., P04, PD1)
      const badgeG = createSvgEl("g", {
        class: "edge-badge",
        transform: `translate(${bx}, ${by})`
      });
      const badgeRect = createSvgEl("rect", {
        x: -17,
        y: -9,
        width: 34,
        height: 18,
        class: "edge-badge-bg"
      });
      const badgeText = createSvgEl("text", {
        x: 0,
        y: 0.5,
        class: "edge-badge-text"
      });
      badgeText.textContent = edge.id;

      badgeG.appendChild(badgeRect);
      badgeG.appendChild(badgeText);

      const onEdgeClick = (ev) => {
        ev.stopPropagation();
        selectNode(edge.to, true);
      };
      badgeG.addEventListener("click", onEdgeClick);
      hitPath.addEventListener("click", onEdgeClick);

      g.appendChild(path);
      g.appendChild(hitPath);
      g.appendChild(badgeG);
      edgeLayer.appendChild(g);
      edgeEls.set(edge.id, g);
    });
  }

  function renderNodes() {
    nodeLayer.innerHTML = "";
    nodeEls.clear();

    BLOODBORNE_MAP_DATA.nodes.forEach(node => {
      const g = createSvgEl("g", {
        class: `node-group cat-${node.category} type-${node.type}`,
        transform: `translate(${node.x - NODE_W / 2}, ${node.y - NODE_H / 2})`,
        "data-node-id": node.id
      });

      const card = createSvgEl("rect", {
        x: 0,
        y: 0,
        width: NODE_W,
        height: NODE_H,
        class: "node-card"
      });

      const accent = createSvgEl("rect", {
        x: 0,
        y: 8,
        width: 4,
        height: NODE_H - 16,
        class: "node-accent-bar"
      });

      // Code badge (01, 02, D1, ...)
      const codeRect = createSvgEl("rect", {
        x: 12,
        y: 11,
        width: 34,
        height: 20,
        class: "node-code-badge"
      });
      const codeText = createSvgEl("text", {
        x: 29,
        y: 21.5,
        class: "node-code-text"
      });
      codeText.textContent = node.code;

      // Title
      const title = createSvgEl("text", {
        x: 54,
        y: 25,
        class: "node-title"
      });
      title.textContent = truncate(node.title, 20);

      // Subtitle
      const subtitle = createSvgEl("text", {
        x: 13,
        y: 52,
        class: "node-subtitle"
      });
      subtitle.textContent = truncate(node.subtitle, 28);

      // Recommended order pill (#1 .. #25)
      const orderG = createSvgEl("g", {
        class: "node-order-pill",
        transform: `translate(${NODE_W - 14}, -2)`
      });
      const orderBg = createSvgEl("rect", {
        x: -14,
        y: -9,
        width: 28,
        height: 18,
        class: "node-order-bg"
      });
      const orderTxt = createSvgEl("text", {
        x: 0,
        y: 0.5,
        class: "node-order-text"
      });
      orderTxt.textContent = `#${node.order}`;
      orderG.appendChild(orderBg);
      orderG.appendChild(orderTxt);

      // Completed checkmark seal
      const checkG = createSvgEl("g", {
        class: "node-check-seal",
        transform: `translate(${NODE_W - 18}, ${NODE_H - 17})`
      });
      const checkCircle = createSvgEl("circle", {
        cx: 0,
        cy: 0,
        r: 9,
        fill: "#202b19",
        stroke: "#7f9a65",
        "stroke-width": 1.4
      });
      const checkMark = createSvgEl("path", {
        d: "M -4 0 L -1 3 L 4.5 -3",
        fill: "none",
        stroke: "#cbe0b6",
        "stroke-width": 1.8,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      });
      checkG.appendChild(checkCircle);
      checkG.appendChild(checkMark);

      g.appendChild(card);
      g.appendChild(accent);
      g.appendChild(codeRect);
      g.appendChild(codeText);
      g.appendChild(title);
      g.appendChild(subtitle);
      g.appendChild(orderG);
      g.appendChild(checkG);

      g.addEventListener("click", (ev) => {
        ev.stopPropagation();
        selectNode(node.id, false);
      });

      nodeLayer.appendChild(g);
      nodeEls.set(node.id, g);
    });
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max - 1) + "…" : str;
  }

  // =========================================================
  // Selection, Highlighting & Drawer
  // =========================================================
  function selectNode(id, shouldPan = false) {
    const node = nodeById.get(id);
    if (!node) return;

    state.selectedId = id;
    hintToast.classList.add("hidden");
    updateVisualStates();
    renderDrawer(node);
    drawer.classList.add("open");

    if (shouldPan) {
      centerOnNode(node);
    }
  }

  function clearSelection() {
    state.selectedId = null;
    drawer.classList.remove("open");
    updateVisualStates();
  }

  function updateVisualStates() {
    const selected = state.selectedId;
    const outgoingEdges = selected ? outgoingMap.get(selected) || [] : [];
    const incomingEdges = selected ? incomingMap.get(selected) || [] : [];

    const outgoingEdgeIds = new Set(outgoingEdges.map(e => e.id));
    const incomingEdgeIds = new Set(incomingEdges.map(e => e.id));
    const nextNodeIds = new Set(outgoingEdges.map(e => e.to));
    const prevNodeIds = new Set(incomingEdges.map(e => e.from));

    // Nodes
    BLOODBORNE_MAP_DATA.nodes.forEach(node => {
      const el = nodeEls.get(node.id);
      if (!el) return;

      const matchesFilter = state.filter === "all" || node.category === state.filter;
      el.classList.toggle("is-completed", state.completed.has(node.id));
      el.classList.toggle("is-selected", node.id === selected);
      el.classList.toggle("is-next-target", nextNodeIds.has(node.id));

      let dimmed = !matchesFilter;
      if (selected && !dimmed) {
        const isRelated = node.id === selected || nextNodeIds.has(node.id) || prevNodeIds.has(node.id);
        dimmed = !isRelated;
      }
      el.classList.toggle("is-dimmed", dimmed);
    });

    // Edges
    BLOODBORNE_MAP_DATA.edges.forEach(edge => {
      const el = edgeEls.get(edge.id);
      if (!el) return;

      const pathEl = el.querySelector(".edge-path");
      const isOutgoing = outgoingEdgeIds.has(edge.id);
      const isIncoming = incomingEdgeIds.has(edge.id);

      el.classList.toggle("is-outgoing", isOutgoing);
      el.classList.toggle("is-incoming", isIncoming);

      // Update arrowhead marker color on outgoing
      if (isOutgoing) {
        pathEl.setAttribute("marker-end", edge.type === "dlc" ? "url(#arrow-dlc-bright)" : "url(#arrow-blood)");
      } else if (isIncoming) {
        pathEl.setAttribute("marker-end", "url(#arrow-gold)");
      } else {
        pathEl.setAttribute("marker-end", edge.type === "dlc" ? "url(#arrow-dlc)" : "url(#arrow-default)");
      }

      const fromNode = nodeById.get(edge.from);
      const toNode = nodeById.get(edge.to);
      const filterVisible =
        state.filter === "all" ||
        fromNode.category === state.filter ||
        toNode.category === state.filter;

      let dimmed = !filterVisible;
      if (selected && !dimmed) {
        dimmed = !(isOutgoing || isIncoming);
      }
      el.classList.toggle("is-dimmed", dimmed);
    });
  }

  function renderDrawer(node) {
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

    // Outgoing paths ("Next Possible Paths")
    const outgoing = outgoingMap.get(node.id) || [];
    nextPathsList.innerHTML = "";
    if (outgoing.length === 0) {
      nextPathsList.innerHTML = `<div class="empty-note">End of this branch. Return to another hub or continue the main hunt.</div>`;
    } else {
      outgoing.forEach(edge => {
        const target = nodeById.get(edge.to);
        const btn = document.createElement("button");
        btn.className = `path-card type-${edge.type}`;
        btn.innerHTML = `
          <div class="path-card-main">
            <div class="path-card-top">
              <span class="path-code">${edge.id}</span>
              <span class="path-target-name">${target.code} · ${target.title}</span>
            </div>
            <div class="path-req">${edge.label}</div>
          </div>
          <span class="path-arrow">→</span>
        `;
        btn.addEventListener("click", () => selectNode(target.id, true));
        nextPathsList.appendChild(btn);
      });
    }

    // Incoming paths ("Reached From")
    const incoming = incomingMap.get(node.id) || [];
    prevPathsList.innerHTML = "";
    if (incoming.length === 0) {
      prevPathsList.innerHTML = `<div class="empty-note">Starting point of the hunt.</div>`;
    } else {
      incoming.forEach(edge => {
        const source = nodeById.get(edge.from);
        const btn = document.createElement("button");
        btn.className = `path-card is-incoming type-${edge.type}`;
        btn.innerHTML = `
          <div class="path-card-main">
            <div class="path-card-top">
              <span class="path-code">${edge.id}</span>
              <span class="path-target-name">${source.code} · ${source.title}</span>
            </div>
            <div class="path-req">${edge.label}</div>
          </div>
          <span class="path-arrow">←</span>
        `;
        btn.addEventListener("click", () => selectNode(source.id, true));
        prevPathsList.appendChild(btn);
      });
    }
  }

  // =========================================================
  // Pan & Zoom Camera
  // =========================================================
  function applyTransform() {
    worldGroup.setAttribute("transform", `translate(${state.tx}, ${state.ty}) scale(${state.scale})`);
  }

  function fitToScreen() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const padX = 60;
    const padY = 100;
    const { width, height } = BLOODBORNE_MAP_DATA.worldBounds;

    const scaleX = (vw - padX * 2) / width;
    const scaleY = (vh - padY * 2) / height;
    state.scale = Math.max(0.32, Math.min(1.0, Math.min(scaleX, scaleY)));
    state.tx = (vw - width * state.scale) / 2;
    state.ty = (vh - height * state.scale) / 2 + 18;
    applyTransform();
  }

  function centerOnNode(node) {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    // Offset slightly left so the right drawer doesn't cover the focused node
    const drawerOffset = drawer.classList.contains("open") && vw > 900 ? -160 : 0;
    const targetScale = Math.max(state.scale, 0.85);
    state.scale = Math.min(targetScale, 1.15);
    state.tx = vw / 2 + drawerOffset - node.x * state.scale;
    state.ty = vh / 2 - node.y * state.scale;
    applyTransform();
  }

  function zoomAt(factor, clientX, clientY) {
    const prevScale = state.scale;
    const nextScale = Math.max(0.28, Math.min(2.2, prevScale * factor));
    const ratio = nextScale / prevScale;

    state.tx = clientX - (clientX - state.tx) * ratio;
    state.ty = clientY - (clientY - state.ty) * ratio;
    state.scale = nextScale;
    applyTransform();
  }

  // Mouse pan & wheel zoom
  viewport.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    state.isPanning = true;
    state.panStartX = e.clientX;
    state.panStartY = e.clientY;
    state.panOriginX = state.tx;
    state.panOriginY = state.ty;
    viewport.classList.add("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.isPanning) return;
    state.tx = state.panOriginX + (e.clientX - state.panStartX);
    state.ty = state.panOriginY + (e.clientY - state.panStartY);
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    state.isPanning = false;
    viewport.classList.remove("dragging");
  });

  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    zoomAt(factor, e.clientX, e.clientY);
  }, { passive: false });

  svg.addEventListener("click", () => {
    clearSelection();
  });

  // Zoom toolbar buttons
  document.getElementById("zoom-in").addEventListener("click", () => {
    zoomAt(1.22, viewport.clientWidth / 2, viewport.clientHeight / 2);
  });
  document.getElementById("zoom-out").addEventListener("click", () => {
    zoomAt(0.82, viewport.clientWidth / 2, viewport.clientHeight / 2);
  });
  document.getElementById("zoom-fit").addEventListener("click", fitToScreen);

  // =========================================================
  // HUD Interactions: Filters, Search, Order, Overlay
  // =========================================================
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.filter = btn.dataset.filter;
      updateVisualStates();
    });
  });

  orderToggleBtn.addEventListener("click", () => {
    state.showOrder = !state.showOrder;
    orderToggleBtn.classList.toggle("active", state.showOrder);
    document.body.classList.toggle("show-order", state.showOrder);
    const poly = document.getElementById("recommended-polyline");
    if (poly) poly.style.display = state.showOrder ? "block" : "none";
  });

  completeBtn.addEventListener("click", () => {
    if (!state.selectedId) return;
    if (state.completed.has(state.selectedId)) {
      state.completed.delete(state.selectedId);
    } else {
      state.completed.add(state.selectedId);
    }
    saveProgress();
    updateProgressPill();
    updateVisualStates();
    renderDrawer(nodeById.get(state.selectedId));
  });

  drawerClose.addEventListener("click", clearSelection);

  // Search
  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      searchResults.classList.remove("open");
      return;
    }
    const matches = BLOODBORNE_MAP_DATA.nodes.filter(n =>
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
          selectNode(n.id, true);
        });
        searchResults.appendChild(div);
      });
    }
    searchResults.classList.add("open");
  }

  searchInput.addEventListener("input", (e) => renderSearchResults(e.target.value));
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) {
      searchResults.classList.remove("open");
    }
    if (!e.target.closest("#overlay-popover") && !e.target.closest("#overlay-toggle-btn")) {
      overlayPopover.classList.remove("open");
    }
  });

  // Map Overlay controls (for future game map alignment)
  function renderOverlayImage() {
    overlayLayer.innerHTML = "";
    if (!state.overlayUrl) return;
    const { width, height } = BLOODBORNE_MAP_DATA.worldBounds;
    const img = createSvgEl("image", {
      href: state.overlayUrl,
      x: 0,
      y: 0,
      width: width * state.overlayScale,
      height: height * state.overlayScale,
      opacity: state.overlayOpacity,
      preserveAspectRatio: "xMidYMid meet"
    });
    overlayLayer.appendChild(img);
  }

  overlayToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    overlayPopover.classList.toggle("open");
  });

  overlayFileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.overlayUrl = reader.result;
      renderOverlayImage();
    };
    reader.readAsDataURL(file);
  });

  overlayOpacityInput.addEventListener("input", (e) => {
    state.overlayOpacity = parseFloat(e.target.value);
    renderOverlayImage();
  });

  overlayScaleInput.addEventListener("input", (e) => {
    state.overlayScale = parseFloat(e.target.value);
    renderOverlayImage();
  });

  overlayClearBtn.addEventListener("click", () => {
    state.overlayUrl = "";
    overlayFileInput.value = "";
    renderOverlayImage();
  });

  // Keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      clearSelection();
      overlayPopover.classList.remove("open");
    }
  });

  // =========================================================
  // Initialize
  // =========================================================
  loadProgress();
  renderPhases();
  renderRecommendedOrderLine();
  renderEdges();
  renderNodes();
  renderOverlayImage();
  updateProgressPill();
  updateVisualStates();
  fitToScreen();

  window.addEventListener("resize", () => {
    if (!state.selectedId) fitToScreen();
  });
})();
