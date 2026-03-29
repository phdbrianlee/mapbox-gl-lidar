import mapboxgl from 'mapbox-gl';
import { LidarControl } from '../src/index';
import '../src/index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const urlFormContainer = document.getElementById('url-form-container') as HTMLDivElement;
const urlForm = document.getElementById('url-form') as HTMLFormElement;
const urlInput = document.getElementById('url-input') as HTMLInputElement;
const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
const loadingIndicator = document.getElementById('loading-indicator') as HTMLDivElement;

let map: mapboxgl.Map | null = null;
let lidarControl: LidarControl | null = null;

function initMap(): mapboxgl.Map {
  if (map) return map;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [0, 0],
    zoom: 2,
    pitch: 60,
    maxPitch: 85,
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
  map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

  map.on('style.load', () => {
    if (!map) return;

    map.addSource('google-satellite', {
      type: 'raster',
      tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
      tileSize: 256,
      attribution: '&copy; Google',
    });

    map.addLayer({
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
  });

  return map;
}

function initLidarControl(): LidarControl {
  if (lidarControl) return lidarControl;

  lidarControl = new LidarControl({
    title: 'LiDAR Viewer',
    collapsed: false,
    panelWidth: 360,
    pointSize: 2,
    opacity: 1.0,
    colorScheme: 'elevation',
  });

  return lidarControl;
}

async function loadPointCloud(url: string): Promise<void> {
  loadingIndicator.style.display = 'block';
  loadBtn.disabled = true;

  try {
    const mapInstance = initMap();

    if (!mapInstance.loaded()) {
      await new Promise<void>((resolve) => {
        mapInstance.on('load', () => resolve());
      });
    }

    const control = initLidarControl();

    if (!mapInstance.hasControl(control)) {
      mapInstance.addControl(control, 'top-right');
    }

    const existingClouds = control.getPointClouds();
    for (const cloud of existingClouds) {
      control.unloadPointCloud(cloud.id);
    }

    const info = await control.loadPointCloud(url);
    console.log('Point cloud loaded:', info.name);
    console.log(`  - Points: ${info.pointCount.toLocaleString()}`);

    control.flyToPointCloud(info.id);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('url', url);
    window.history.pushState({}, '', newUrl.toString());

    const filename = url.split('/').pop() || 'Point Cloud';
    document.title = `${filename} - Mapbox GL LiDAR`;

    urlFormContainer.style.display = 'none';
  } catch (err) {
    console.error('Failed to load point cloud:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    alert(`Failed to load point cloud: ${message}`);
  } finally {
    loadingIndicator.style.display = 'none';
    loadBtn.disabled = false;
  }
}

urlForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (url) {
    loadPointCloud(url);
  }
});

document.querySelectorAll('.sample-urls button[data-url]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const url = btn.getAttribute('data-url');
    if (url) {
      urlInput.value = url;
      loadPointCloud(url);
    }
  });
});

const params = new URLSearchParams(window.location.search);
const initialUrl = params.get('url');

if (initialUrl) {
  urlInput.value = initialUrl;
  loadPointCloud(initialUrl);
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    map?.remove();
    map = null;
    lidarControl = null;
  });
}
