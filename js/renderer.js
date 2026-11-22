/**
 * SVG Map Renderer Module
 * Renders phases, directed paths, progression nodes, overlay image, and highlight states.
 */
(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const NODE_W = 216;
  const NODE_H = 76;

  function createSvgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    return el;
  }

  function fitSvgText(textEl, fullText, maxWidth) {
    textEl.textContent = fullText;
    if (typeof textEl.getComputedTextLength !== "function") return;
    if (textEl.getComputedTextLength() <= maxWidth) return;

    let lo = 0;
    let hi = fullText.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      textEl.textContent = fullText.slice(0, mid).trimEnd() + "…";
      if (textEl.getComputedTextLength() <= maxWidth) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    textEl.textContent = fullText.slice(0, Math.max(1, lo)).trimEnd() + "…";
  }

  function createRenderer({ store, onSelectNode, isDragging }) {
    const { data, state, nodeById, outgoingMap, incomingMap } = store;

    const overlayLayer = document.getElementById("overlay-layer");
    const phaseLayer = document.getElementById("phase-layer");
    const recommendedLayer = document.getElementById("recommended-layer");
    const edgeLayer = document.getElementById("edge-layer");
    const nodeLayer = document.getElementById("node-layer");

    const nodeEls = new Map();
    const edgeEls = new Map();
    const textFitQueue = [];

    function refitAllNodeText() {
      textFitQueue.forEach(({ el, text, maxWidth }) => {
        fitSvgText(el, text, maxWidth);
      });
    }

    function renderPhases() {
      phaseLayer.innerHTML = "";
      data.phases.forEach(phase => {
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
      const sorted = [...data.nodes].sort((a, b) => a.order - b.order);
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
        cx = mx;
        cy = y1 + (y2 - y1) * 0.35;
      }

      const bx = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
      const by = 0.25 * y1 + 0.5 * cy + 0.25 * y2;

      return { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, bx, by };
    }

    function renderEdges() {
      edgeLayer.innerHTML = "";
      edgeEls.clear();

      data.edges.forEach(edge => {
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

        const hitPath = createSvgEl("path", {
          d,
          fill: "none",
          stroke: "transparent",
          "stroke-width": "14",
          style: "cursor:pointer"
        });

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
          if (isDragging()) return;
          onSelectNode(edge.to, true);
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
      textFitQueue.length = 0;

      data.nodes.forEach(node => {
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

        const codeRect = createSvgEl("rect", {
          x: 12,
          y: 12,
          width: 34,
          height: 20,
          class: "node-code-badge"
        });
        const codeText = createSvgEl("text", {
          x: 29,
          y: 22.5,
          class: "node-code-text"
        });
        codeText.textContent = node.code;

        const title = createSvgEl("text", {
          x: 53,
          y: 26,
          class: "node-title"
        });
        title.textContent = node.title;

        const subtitle = createSvgEl("text", {
          x: 13,
          y: 54,
          class: "node-subtitle"
        });
        subtitle.textContent = node.subtitle;

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

        const checkG = createSvgEl("g", {
          class: "node-check-seal",
          transform: `translate(${NODE_W - 18}, ${NODE_H - 18})`
        });
        const checkCircle = createSvgEl("circle", {
          cx: 0,
          cy: 0,
          r: 10.5,
          fill: "#1b7a42",
          stroke: "#5ce08d",
          "stroke-width": 1.6
        });
        const checkMark = createSvgEl("path", {
          d: "M -4.5 0.2 L -1.2 3.5 L 5 -3.2",
          fill: "none",
          stroke: "#ecfff2",
          "stroke-width": 2,
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
          if (isDragging()) return;
          onSelectNode(node.id, window.innerWidth <= 768);
        });

        nodeLayer.appendChild(g);
        nodeEls.set(node.id, g);

        // Measure & fit text to exact box bounds (prevents any overflow)
        const titleMaxW = NODE_W - 65;
        const subMaxW = NODE_W - 46;
        fitSvgText(title, node.title, titleMaxW);
        fitSvgText(subtitle, node.subtitle, subMaxW);
        textFitQueue.push({ el: title, text: node.title, maxWidth: titleMaxW });
        textFitQueue.push({ el: subtitle, text: node.subtitle, maxWidth: subMaxW });
      });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(refitAllNodeText);
      }
    }

    function renderOverlayImage() {
      overlayLayer.innerHTML = "";
      if (!state.overlay.url) return;
      const { width, height } = data.worldBounds;
      const img = createSvgEl("image", {
        href: state.overlay.url,
        x: 0,
        y: 0,
        width: width * state.overlay.scale,
        height: height * state.overlay.scale,
        opacity: state.overlay.opacity,
        preserveAspectRatio: "xMidYMid meet"
      });
      overlayLayer.appendChild(img);
    }

    function updateVisualStates() {
      const selected = state.selectedId;
      const outgoingEdges = selected ? outgoingMap.get(selected) || [] : [];
      const incomingEdges = selected ? incomingMap.get(selected) || [] : [];

      const outgoingEdgeIds = new Set(outgoingEdges.map(e => e.id));
      const incomingEdgeIds = new Set(incomingEdges.map(e => e.id));
      const nextNodeIds = new Set(outgoingEdges.map(e => e.to));
      const prevNodeIds = new Set(incomingEdges.map(e => e.from));

      data.nodes.forEach(node => {
        const el = nodeEls.get(node.id);
        if (!el) return;

        const matchesFilter = state.filter === "all" || node.category === state.filter;
        el.classList.toggle("is-completed", state.completed.has(node.id));
        el.classList.toggle("is-selected", node.id === selected);
        el.classList.toggle("is-next-target", nextNodeIds.has(node.id));

        let dimmed = !matchesFilter;
        if (selected && !dimmed) {
          const isRelated =
            node.id === selected || nextNodeIds.has(node.id) || prevNodeIds.has(node.id);
          dimmed = !isRelated;
        }
        el.classList.toggle("is-dimmed", dimmed);
      });

      data.edges.forEach(edge => {
        const el = edgeEls.get(edge.id);
        if (!el) return;

        const pathEl = el.querySelector(".edge-path");
        const isOutgoing = outgoingEdgeIds.has(edge.id);
        const isIncoming = incomingEdgeIds.has(edge.id);

        el.classList.toggle("is-outgoing", isOutgoing);
        el.classList.toggle("is-incoming", isIncoming);

        if (isOutgoing) {
          pathEl.setAttribute(
            "marker-end",
            edge.type === "dlc" ? "url(#arrow-dlc-bright)" : "url(#arrow-blood)"
          );
        } else if (isIncoming) {
          pathEl.setAttribute("marker-end", "url(#arrow-gold)");
        } else {
          pathEl.setAttribute(
            "marker-end",
            edge.type === "dlc" ? "url(#arrow-dlc)" : "url(#arrow-default)"
          );
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

    function setOrderLineVisible(visible) {
      const poly = document.getElementById("recommended-polyline");
      if (poly) poly.style.display = visible ? "block" : "none";
    }

    function renderAll() {
      renderPhases();
      renderRecommendedOrderLine();
      renderEdges();
      renderNodes();
      renderOverlayImage();
      updateVisualStates();
    }

    return {
      renderAll,
      renderOverlayImage,
      updateVisualStates,
      setOrderLineVisible
    };
  }

  window.BloodborneMap = window.BloodborneMap || {};
  window.BloodborneMap.createRenderer = createRenderer;
})();
