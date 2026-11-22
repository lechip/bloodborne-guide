/**
 * Application Entry Point
 * Wires together Store, Camera, Renderer, Drawer, and HUD modules.
 */
(() => {
  const { Store, createCamera, createRenderer, createDrawer, createHud } = window.BloodborneMap;
  const { state, nodeById } = Store;

  let renderer;
  let camera;
  let drawer;
  let hud;

  function selectNode(id, shouldPan = false) {
    const node = nodeById.get(id);
    if (!node) return;

    state.selectedId = id;
    hud.hideHint();
    renderer.updateVisualStates();
    drawer.open(node);

    if (shouldPan) {
      camera.centerOnNode(node);
    }
  }

  function clearSelection() {
    state.selectedId = null;
    drawer.close();
    renderer.updateVisualStates();
  }

  function handleToggleComplete() {
    if (!state.selectedId) return;
    Store.toggleCompleted(state.selectedId);
    hud.updateProgress();
    renderer.updateVisualStates();
    drawer.render(nodeById.get(state.selectedId));
  }

  // Initialize modules
  Store.loadProgress();

  camera = createCamera({
    store: Store,
    onBackgroundClick: clearSelection
  });

  renderer = createRenderer({
    store: Store,
    onSelectNode: selectNode,
    isDragging: camera.isDragging
  });

  drawer = createDrawer({
    store: Store,
    onSelectNode: selectNode,
    onToggleComplete: handleToggleComplete,
    onClose: clearSelection
  });

  hud = createHud({
    store: Store,
    onFilterChange: () => renderer.updateVisualStates(),
    onSelectNode: selectNode,
    onOrderToggle: (visible) => renderer.setOrderLineVisible(visible),
    onOverlayChange: () => renderer.renderOverlayImage(),
    onEscape: clearSelection
  });

  // Initial render & camera framing
  renderer.renderAll();
  hud.updateProgress();
  camera.focusInitialView(nodeById.get("father_gascoigne"));
})();
