"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const react = require("react");
const LidarLayerAdapter = require("./LidarLayerAdapter-m50TdGjF.cjs");
function LidarControlReact({
  map,
  defaultUrl,
  onStateChange,
  onLoad,
  onError,
  onControlReady,
  ...options
}) {
  const controlRef = react.useRef(null);
  react.useEffect(() => {
    if (!map) return;
    const control = new LidarLayerAdapter.LidarControl(options);
    controlRef.current = control;
    if (onStateChange) {
      control.on("statechange", (event) => {
        onStateChange(event.state);
      });
    }
    if (onLoad) {
      control.on("load", (event) => {
        if (event.pointCloud && "name" in event.pointCloud) {
          onLoad(event.pointCloud);
        }
      });
    }
    if (onError) {
      control.on("loaderror", (event) => {
        if (event.error) {
          onError(event.error);
        }
      });
    }
    map.addControl(control, options.position || "top-right");
    if (onControlReady) {
      onControlReady(control);
    }
    if (defaultUrl) {
      control.loadPointCloud(defaultUrl).catch((err) => {
        console.error("Failed to load default URL:", err);
      });
    }
    return () => {
      if (map.hasControl(control)) {
        map.removeControl(control);
      }
      controlRef.current = null;
    };
  }, [map]);
  react.useEffect(() => {
    if (controlRef.current) {
      const currentState = controlRef.current.getState();
      if (options.collapsed !== void 0 && options.collapsed !== currentState.collapsed) {
        if (options.collapsed) {
          controlRef.current.collapse();
        } else {
          controlRef.current.expand();
        }
      }
      if (options.pointSize !== void 0 && options.pointSize !== currentState.pointSize) {
        controlRef.current.setPointSize(options.pointSize);
      }
      if (options.opacity !== void 0 && options.opacity !== currentState.opacity) {
        controlRef.current.setOpacity(options.opacity);
      }
      if (options.colorScheme !== void 0 && options.colorScheme !== currentState.colorScheme) {
        controlRef.current.setColorScheme(options.colorScheme);
      }
    }
  }, [options.collapsed, options.pointSize, options.opacity, options.colorScheme]);
  return null;
}
const DEFAULT_STATE = {
  collapsed: true,
  panelWidth: 365,
  maxHeight: 500,
  pointClouds: [],
  activePointCloudId: null,
  pointSize: 2,
  opacity: 1,
  colorScheme: "elevation",
  colormap: "viridis",
  colorRange: {
    mode: "percentile",
    percentileLow: 2,
    percentileHigh: 98
  },
  showColorbar: true,
  usePercentile: true,
  elevationRange: null,
  pointBudget: 1e6,
  pickable: false,
  loading: false,
  error: null,
  zOffsetEnabled: false,
  zOffset: 0,
  hiddenClassifications: /* @__PURE__ */ new Set(),
  availableClassifications: /* @__PURE__ */ new Set(),
  terrainEnabled: false
};
function useLidarState(initialState) {
  const [state, setState] = react.useState({
    ...DEFAULT_STATE,
    ...initialState
  });
  const setCollapsed = react.useCallback((collapsed) => {
    setState((prev) => ({ ...prev, collapsed }));
  }, []);
  const setPanelWidth = react.useCallback((panelWidth) => {
    setState((prev) => ({ ...prev, panelWidth }));
  }, []);
  const setPointSize = react.useCallback((pointSize) => {
    setState((prev) => ({ ...prev, pointSize }));
  }, []);
  const setOpacity = react.useCallback((opacity) => {
    setState((prev) => ({ ...prev, opacity }));
  }, []);
  const setColorScheme = react.useCallback((colorScheme) => {
    setState((prev) => ({ ...prev, colorScheme }));
  }, []);
  const setUsePercentile = react.useCallback((usePercentile) => {
    setState((prev) => ({ ...prev, usePercentile }));
  }, []);
  const setElevationRange = react.useCallback((elevationRange) => {
    setState((prev) => ({ ...prev, elevationRange }));
  }, []);
  const setPointBudget = react.useCallback((pointBudget) => {
    setState((prev) => ({ ...prev, pointBudget }));
  }, []);
  const setZOffsetEnabled = react.useCallback((zOffsetEnabled) => {
    setState((prev) => ({ ...prev, zOffsetEnabled }));
  }, []);
  const setZOffset = react.useCallback((zOffset) => {
    setState((prev) => ({ ...prev, zOffset }));
  }, []);
  const setTerrainEnabled = react.useCallback((terrainEnabled) => {
    setState((prev) => ({ ...prev, terrainEnabled }));
  }, []);
  const reset = react.useCallback(() => {
    setState({ ...DEFAULT_STATE, ...initialState });
  }, [initialState]);
  const toggle = react.useCallback(() => {
    setState((prev) => ({ ...prev, collapsed: !prev.collapsed }));
  }, []);
  return {
    state,
    setState,
    setCollapsed,
    setPanelWidth,
    setPointSize,
    setOpacity,
    setColorScheme,
    setUsePercentile,
    setElevationRange,
    setPointBudget,
    setZOffsetEnabled,
    setZOffset,
    setTerrainEnabled,
    reset,
    toggle
  };
}
function usePointCloud(options) {
  const [data, setData] = react.useState(null);
  const [loading, setLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  const [progress, setProgress] = react.useState(0);
  const load = react.useCallback(
    async (source) => {
      setLoading(true);
      setError(null);
      setProgress(0);
      try {
        const loader = new LidarLayerAdapter.PointCloudLoader();
        const result = await loader.load(source);
        setData(result);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );
  const reset = react.useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setProgress(0);
  }, []);
  return { data, loading, error, progress, load, reset };
}
exports.LidarControl = LidarLayerAdapter.LidarControl;
exports.LidarLayerAdapter = LidarLayerAdapter.LidarLayerAdapter;
exports.LidarControlReact = LidarControlReact;
exports.useLidarState = useLidarState;
exports.usePointCloud = usePointCloud;
//# sourceMappingURL=react.cjs.map
