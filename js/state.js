/**
 * State & Graph Index Module
 * Holds runtime state, adjacency maps, and localStorage completion persistence.
 */
(() => {
  const STORAGE_KEY = "bloodborne_map_completed_v1";
  const data = BLOODBORNE_MAP_DATA;

  const nodeById = new Map(data.nodes.map(n => [n.id, n]));
  const outgoingMap = new Map();
  const incomingMap = new Map();

  data.nodes.forEach(n => {
    outgoingMap.set(n.id, []);
    incomingMap.set(n.id, []);
  });

  data.edges.forEach(e => {
    if (outgoingMap.has(e.from)) outgoingMap.get(e.from).push(e);
    if (incomingMap.has(e.to)) incomingMap.get(e.to).push(e);
  });

  const state = {
    selectedId: null,
    filter: "all",
    showOrder: false,
    completed: new Set(),
    camera: {
      tx: 0,
      ty: 0,
      scale: 0.72
    },
    overlay: {
      url: data.overlayConfig.imageUrl || "",
      opacity: data.overlayConfig.opacity || 0.35,
      scale: data.overlayConfig.scale || 1
    }
  };

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        saved.forEach(id => {
          if (nodeById.has(id)) state.completed.add(id);
        });
      }
    } catch (_) {
      // Ignore storage errors (e.g. private browsing)
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completed]));
    } catch (_) {
      // Ignore storage errors
    }
  }

  function toggleCompleted(nodeId) {
    if (!nodeId || !nodeById.has(nodeId)) return false;
    if (state.completed.has(nodeId)) {
      state.completed.delete(nodeId);
    } else {
      state.completed.add(nodeId);
    }
    saveProgress();
    return state.completed.has(nodeId);
  }

  window.BloodborneMap = window.BloodborneMap || {};
  window.BloodborneMap.Store = {
    data,
    state,
    nodeById,
    outgoingMap,
    incomingMap,
    loadProgress,
    saveProgress,
    toggleCompleted
  };
})();
