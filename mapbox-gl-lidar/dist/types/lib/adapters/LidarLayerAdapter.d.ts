import { LidarControl } from '../core/LidarControl';
/**
 * Adapter interface for integrating LiDAR point cloud layers with layer controls.
 * This is a compatibility interface - for Mapbox GL JS, you may need to implement
 * a custom adapter based on your specific layer control library.
 */
export interface LidarLayerAdapterInterface {
    readonly type: string;
    getLayerIds(): string[];
    getLayerState(layerId: string): {
        visible: boolean;
        opacity: number;
        name: string;
    } | null;
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
export declare class LidarLayerAdapter implements LidarLayerAdapterInterface {
    readonly type = "lidar";
    private _lidarControl;
    private _changeCallbacks;
    private _unsubscribe?;
    constructor(lidarControl: LidarControl);
    private _setupEventListeners;
    getLayerIds(): string[];
    getLayerState(layerId: string): {
        visible: boolean;
        opacity: number;
        name: string;
    } | null;
    setVisibility(layerId: string, visible: boolean): void;
    setOpacity(layerId: string, opacity: number): void;
    getName(layerId: string): string;
    getSymbolType(_layerId: string): string;
    removeLayer(layerId: string): void;
    onLayerChange(callback: (event: 'add' | 'remove', layerId: string) => void): () => void;
    private _notifyLayerAdded;
    notifyLayerRemoved(layerId: string): void;
    destroy(): void;
}
