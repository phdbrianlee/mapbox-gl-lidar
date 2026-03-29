import type { LidarControl } from '../core/LidarControl';

/**
 * Adapter interface for integrating LiDAR point cloud layers with layer controls.
 * This is a compatibility interface - for Mapbox GL JS, you may need to implement
 * a custom adapter based on your specific layer control library.
 */
export interface LidarLayerAdapterInterface {
  readonly type: string;
  getLayerIds(): string[];
  getLayerState(layerId: string): { visible: boolean; opacity: number; name: string } | null;
  setVisibility(layerId: string, visible: boolean): void;
  setOpacity(layerId: string, opacity: number): void;
  getName(layerId: string): string;
  getSymbolType(layerId: string): string;
  removeLayer(layerId: string): void;
  onLayerChange(callback: (event: 'add' | 'remove', layerId: string) => void): () => void;
  destroy(): void;
}

/**
 * Adapter for integrating LiDAR point cloud layers with layer control panels.
 * 
 * Note: This adapter is designed for MapLibre GL. For Mapbox GL JS,
 * you may need to implement a custom adapter for your layer control solution.
 *
 * @example
 * ```typescript
 * import { LidarControl, LidarLayerAdapter } from 'mapbox-gl-lidar';
 * 
 * const lidarControl = new LidarControl({ ... });
 * map.addControl(lidarControl, 'top-right');
 * 
 * // Create adapter after adding lidar control
 * const lidarAdapter = new LidarLayerAdapter(lidarControl);
 * ```
 */
export class LidarLayerAdapter implements LidarLayerAdapterInterface {
  readonly type = 'lidar';

  private _lidarControl: LidarControl;
  private _changeCallbacks: Array<(event: 'add' | 'remove', layerId: string) => void> = [];
  private _unsubscribe?: () => void;

  constructor(lidarControl: LidarControl) {
    this._lidarControl = lidarControl;
    this._setupEventListeners();
  }

  private _setupEventListeners(): void {
    const handleLoad = (event: { pointCloud?: { id: string } }) => {
      if (event.pointCloud?.id) {
        this._notifyLayerAdded(event.pointCloud.id);
      }
    };

    const handleUnload = (event: { pointCloud?: { id: string } }) => {
      if (event.pointCloud?.id) {
        this.notifyLayerRemoved(event.pointCloud.id);
      }
    };

    this._lidarControl.on('load', handleLoad as any);
    this._lidarControl.on('unload', handleUnload as any);

    this._unsubscribe = () => {
      this._lidarControl.off('load', handleLoad as any);
      this._lidarControl.off('unload', handleUnload as any);
    };
  }

  getLayerIds(): string[] {
    return this._lidarControl.getPointClouds().map((pc) => pc.id);
  }

  getLayerState(layerId: string): { visible: boolean; opacity: number; name: string } | null {
    const pointClouds = this._lidarControl.getPointClouds();
    const pc = pointClouds.find((p) => p.id === layerId);
    if (!pc) return null;

    const state = this._lidarControl.getState();
    const manager = (this._lidarControl as any)._pointCloudManager;

    const visible = manager?.getPointCloudVisibility(layerId) ?? true;
    const opacity = manager?.getPointCloudOpacity(layerId) ?? state.opacity;

    return {
      visible,
      opacity,
      name: this.getName(layerId),
    };
  }

  setVisibility(layerId: string, visible: boolean): void {
    const manager = (this._lidarControl as any)._pointCloudManager;
    manager?.setPointCloudVisibility(layerId, visible);
  }

  setOpacity(layerId: string, opacity: number): void {
    const manager = (this._lidarControl as any)._pointCloudManager;
    manager?.setPointCloudOpacity(layerId, opacity);
  }

  getName(layerId: string): string {
    const pointClouds = this._lidarControl.getPointClouds();
    const pc = pointClouds.find((p) => p.id === layerId);
    if (pc) {
      return pc.name;
    }
    return layerId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  getSymbolType(_layerId: string): string {
    return 'circle';
  }

  removeLayer(layerId: string): void {
    this._lidarControl.unloadPointCloud(layerId);
  }

  onLayerChange(callback: (event: 'add' | 'remove', layerId: string) => void): () => void {
    this._changeCallbacks.push(callback);
    return () => {
      const idx = this._changeCallbacks.indexOf(callback);
      if (idx >= 0) this._changeCallbacks.splice(idx, 1);
    };
  }

  private _notifyLayerAdded(layerId: string): void {
    this._changeCallbacks.forEach((cb) => cb('add', layerId));
  }

  notifyLayerRemoved(layerId: string): void {
    this._changeCallbacks.forEach((cb) => cb('remove', layerId));
  }

  destroy(): void {
    this._unsubscribe?.();
    this._changeCallbacks = [];
  }
}
