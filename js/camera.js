/**
 * Camera Controller Module
 * Handles pan, wheel zoom, 1-finger touch drag, 2-finger pinch-to-zoom, and framing.
 */
(() => {
  function createCamera({ store, onBackgroundClick }) {
    const { data, state } = store;
    const cam = state.camera;

    const viewport = document.getElementById("map-viewport");
    const svg = document.getElementById("map-svg");
    const worldGroup = document.getElementById("world-group");
    const drawer = document.getElementById("detail-drawer");

    let isPanning = false;
    let didDrag = false;
    let panStartX = 0;
    let panStartY = 0;
    let panOriginX = 0;
    let panOriginY = 0;

    let touchMode = null; // "pan" | "pinch"
    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let pinchMidX = 0;
    let pinchMidY = 0;
    let pinchOriginTx = 0;
    let pinchOriginTy = 0;

    function applyTransform() {
      worldGroup.setAttribute(
        "transform",
        `translate(${cam.tx}, ${cam.ty}) scale(${cam.scale})`
      );
    }

    function fitToScreen() {
      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const isMobile = vw <= 768;
      const padX = isMobile ? 20 : 60;
      const padY = isMobile ? 120 : 100;
      const { width, height } = data.worldBounds;

      const scaleX = (vw - padX * 2) / width;
      const scaleY = (vh - padY * 2) / height;
      cam.scale = Math.max(0.2, Math.min(1.0, Math.min(scaleX, scaleY)));
      cam.tx = (vw - width * cam.scale) / 2;
      cam.ty = (vh - height * cam.scale) / 2 + (isMobile ? 36 : 18);
      applyTransform();
    }

    function focusInitialView(startNode) {
      if (viewport.clientWidth <= 768 && startNode) {
        cam.scale = 0.65;
        cam.tx = viewport.clientWidth / 2 - startNode.x * cam.scale;
        cam.ty = viewport.clientHeight / 2 - startNode.y * cam.scale + 20;
        applyTransform();
      } else {
        fitToScreen();
      }
    }

    function centerOnNode(node) {
      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const isMobile = vw <= 768;

      if (isMobile) {
        cam.scale = Math.min(Math.max(cam.scale, 0.72), 1.05);
        const topBarH = 104;
        const visibleH = vh * 0.46 - topBarH;
        const targetY = topBarH + Math.max(visibleH / 2, 70);
        cam.tx = vw / 2 - node.x * cam.scale;
        cam.ty = targetY - node.y * cam.scale;
      } else {
        const drawerOffset = drawer.classList.contains("open") && vw > 900 ? -160 : 0;
        cam.scale = Math.min(Math.max(cam.scale, 0.85), 1.15);
        cam.tx = vw / 2 + drawerOffset - node.x * cam.scale;
        cam.ty = vh / 2 - node.y * cam.scale;
      }
      applyTransform();
    }

    function zoomAt(factor, clientX, clientY) {
      const prevScale = cam.scale;
      const nextScale = Math.max(0.2, Math.min(2.2, prevScale * factor));
      const ratio = nextScale / prevScale;

      cam.tx = clientX - (clientX - cam.tx) * ratio;
      cam.ty = clientY - (clientY - cam.ty) * ratio;
      cam.scale = nextScale;
      applyTransform();
    }

    function getTouchDist(t1, t2) {
      return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }

    function bindEvents() {
      // Mouse pan
      viewport.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        isPanning = true;
        didDrag = false;
        panStartX = e.clientX;
        panStartY = e.clientY;
        panOriginX = cam.tx;
        panOriginY = cam.ty;
        viewport.classList.add("dragging");
      });

      window.addEventListener("mousemove", (e) => {
        if (!isPanning) return;
        const dx = e.clientX - panStartX;
        const dy = e.clientY - panStartY;
        if (Math.hypot(dx, dy) > 5) didDrag = true;
        cam.tx = panOriginX + dx;
        cam.ty = panOriginY + dy;
        applyTransform();
      });

      window.addEventListener("mouseup", () => {
        isPanning = false;
        viewport.classList.remove("dragging");
      });

      // Mouse wheel zoom
      viewport.addEventListener("wheel", (e) => {
        e.preventDefault();
        zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX, e.clientY);
      }, { passive: false });

      // Touch pan & pinch-to-zoom
      viewport.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
          touchMode = "pan";
          didDrag = false;
          panStartX = e.touches[0].clientX;
          panStartY = e.touches[0].clientY;
          panOriginX = cam.tx;
          panOriginY = cam.ty;
        } else if (e.touches.length === 2) {
          touchMode = "pinch";
          didDrag = true;
          const [t1, t2] = e.touches;
          pinchStartDist = getTouchDist(t1, t2) || 1;
          pinchStartScale = cam.scale;
          pinchMidX = (t1.clientX + t2.clientX) / 2;
          pinchMidY = (t1.clientY + t2.clientY) / 2;
          pinchOriginTx = cam.tx;
          pinchOriginTy = cam.ty;
        }
      }, { passive: true });

      viewport.addEventListener("touchmove", (e) => {
        if (touchMode === "pan" && e.touches.length === 1) {
          const dx = e.touches[0].clientX - panStartX;
          const dy = e.touches[0].clientY - panStartY;
          if (Math.hypot(dx, dy) > 6) {
            didDrag = true;
            e.preventDefault();
          }
          cam.tx = panOriginX + dx;
          cam.ty = panOriginY + dy;
          applyTransform();
        } else if (touchMode === "pinch" && e.touches.length === 2) {
          e.preventDefault();
          const [t1, t2] = e.touches;
          const dist = getTouchDist(t1, t2) || 1;
          const curMidX = (t1.clientX + t2.clientX) / 2;
          const curMidY = (t1.clientY + t2.clientY) / 2;
          const nextScale = Math.max(0.2, Math.min(2.2, pinchStartScale * (dist / pinchStartDist)));
          const ratio = nextScale / pinchStartScale;

          cam.scale = nextScale;
          cam.tx = curMidX - (pinchMidX - pinchOriginTx) * ratio;
          cam.ty = curMidY - (pinchMidY - pinchOriginTy) * ratio;
          applyTransform();
        }
      }, { passive: false });

      viewport.addEventListener("touchend", (e) => {
        if (e.touches.length === 0) {
          touchMode = null;
        } else if (e.touches.length === 1) {
          touchMode = "pan";
          panStartX = e.touches[0].clientX;
          panStartY = e.touches[0].clientY;
          panOriginX = cam.tx;
          panOriginY = cam.ty;
        }
      });

      // Background click clears selection
      svg.addEventListener("click", () => {
        if (didDrag) return;
        onBackgroundClick();
      });

      // Zoom control buttons
      document.getElementById("zoom-in").addEventListener("click", () => {
        zoomAt(1.22, viewport.clientWidth / 2, viewport.clientHeight / 2);
      });
      document.getElementById("zoom-out").addEventListener("click", () => {
        zoomAt(0.82, viewport.clientWidth / 2, viewport.clientHeight / 2);
      });
      document.getElementById("zoom-fit").addEventListener("click", fitToScreen);

      window.addEventListener("resize", () => {
        if (!state.selectedId && viewport.clientWidth > 768) fitToScreen();
      });
    }

    bindEvents();

    return {
      fitToScreen,
      focusInitialView,
      centerOnNode,
      zoomAt,
      isDragging: () => didDrag
    };
  }

  window.BloodborneMap = window.BloodborneMap || {};
  window.BloodborneMap.createCamera = createCamera;
})();
