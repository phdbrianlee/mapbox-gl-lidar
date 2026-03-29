import mapboxgl from 'mapbox-gl';
import { LidarControl } from '../../src/index';
import '../../src/index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const BASEMAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

const EPT_URL = 'https://na-c.entwine.io/dublin/ept.json';

const map = new mapboxgl.Map({
  container: 'map',
  style: BASEMAP_STYLE,
  center: [-6.26, 53.35],
  zoom: 14,
  pitch: 60,
  maxPitch: 85,
  bearing: -17,
});

map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

map.on('load', () => {
  const lidarControl = new LidarControl({
    title: 'EPT Viewer',
    collapsed: true,
    panelWidth: 360,
    pointSize: 2,
    opacity: 1.0,
    colorScheme: 'elevation',
    streamingPointBudget: 5_000_000,
  });

  map.addControl(lidarControl, 'top-right');

  lidarControl.loadPointCloud(EPT_URL);

  lidarControl.on('load', (event) => {
    console.log('EPT dataset loaded:', event.pointCloud);
    const pc = event.pointCloud;
    if (pc && 'name' in pc) {
      console.log(`  - Name: ${pc.name}`);
      console.log(`  - Total Points: ${pc.pointCount.toLocaleString()}`);
      console.log(`  - Has RGB: ${pc.hasRGB}`);
    }
  });

  lidarControl.on('streamingprogress', () => {
    const progress = lidarControl.getStreamingProgress();
    if (progress) {
      console.log(`Streaming: ${progress.loadedPoints.toLocaleString()} points loaded`);
    }
  });

  lidarControl.on('loaderror', (event) => {
    console.error('Failed to load EPT:', event.error);
  });
});
