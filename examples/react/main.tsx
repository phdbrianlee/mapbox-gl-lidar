import { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl, { Map } from 'mapbox-gl';
import { LidarControlReact, useLidarState } from '../../src/react';
import type { PointCloudInfo, LidarState } from '../../src/react';
import '../../src/index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

let hotMap: Map | null = null;

function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const {
    state,
    toggle,
    setPointSize,
    setOpacity,
    setColorScheme,
  } = useLidarState({
    collapsed: false,
    pointSize: 2,
    colorScheme: 'elevation',
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-123.06171, 44.0499],
      zoom: 14,
      pitch: 60,
      maxPitch: 85,
      bearing: -17,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapInstance.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    hotMap = mapInstance;

    mapInstance.on('load', () => {
      mapInstance.addSource('google-satellite', {
        type: 'raster',
        tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
        tileSize: 256,
        attribution: '&copy; Google',
      });

      mapInstance.addLayer({
        id: 'google-satellite',
        type: 'raster',
        source: 'google-satellite',
        paint: {
          'raster-opacity': 1,
        },
        layout: {
          visibility: 'visible',
        },
        minzoom: 16,
      });

      setMap(mapInstance);
    });

    return () => {
      mapInstance.remove();
      if (hotMap === mapInstance) {
        hotMap = null;
      }
    };
  }, []);

  const handleStateChange = (newState: LidarState) => {
    console.log('LiDAR state changed:', newState);
  };

  const handleLoad = (pointCloud: PointCloudInfo) => {
    console.log('Point cloud loaded:', pointCloud);
  };

  const handleError = (error: Error) => {
    console.error('Error loading point cloud:', error);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <button onClick={toggle} style={buttonStyle}>
          {state.collapsed ? 'Expand' : 'Collapse'} Panel
        </button>

        <div style={sectionStyle}>
          <span style={labelStyle}>Color Scheme</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button
              onClick={() => setColorScheme('elevation')}
              style={{
                ...smallButtonStyle,
                background: state.colorScheme === 'elevation' ? '#159895' : '#e0e0e0',
                color: state.colorScheme === 'elevation' ? 'white' : '#333',
              }}
            >
              Elevation
            </button>
            <button
              onClick={() => setColorScheme('intensity')}
              style={{
                ...smallButtonStyle,
                background: state.colorScheme === 'intensity' ? '#159895' : '#e0e0e0',
                color: state.colorScheme === 'intensity' ? 'white' : '#333',
              }}
            >
              Intensity
            </button>
            <button
              onClick={() => setColorScheme('classification')}
              style={{
                ...smallButtonStyle,
                background: state.colorScheme === 'classification' ? '#159895' : '#e0e0e0',
                color: state.colorScheme === 'classification' ? 'white' : '#333',
              }}
            >
              Classification
            </button>
            <button
              onClick={() => setColorScheme('rgb')}
              style={{
                ...smallButtonStyle,
                background: state.colorScheme === 'rgb' ? '#159895' : '#e0e0e0',
                color: state.colorScheme === 'rgb' ? 'white' : '#333',
              }}
            >
              RGB
            </button>
          </div>
        </div>

        <div style={sectionStyle}>
          <span style={labelStyle}>Point Size: {state.pointSize}</span>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={state.pointSize}
            onChange={(e) => setPointSize(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={sectionStyle}>
          <span style={labelStyle}>Opacity: {state.opacity.toFixed(2)}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {map && (
        <LidarControlReact
          map={map}
          title="LiDAR Viewer"
          collapsed={state.collapsed}
          panelWidth={330}
          pointSize={state.pointSize}
          opacity={state.opacity}
          colorScheme={state.colorScheme}
          onStateChange={handleStateChange}
          onLoad={handleLoad}
          onError={handleError}
          defaultUrl="https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz"
        />
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#159895',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: 13,
};

const smallButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: 'none',
  borderRadius: 3,
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: 11,
};

const sectionStyle: React.CSSProperties = {
  background: 'white',
  padding: '8px 12px',
  borderRadius: 4,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#666',
  display: 'block',
  marginBottom: 6,
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    hotMap?.remove();
    hotMap = null;
  });
}
