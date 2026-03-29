import mapboxgl from 'mapbox-gl';
import { LidarControl } from '../../src/index';
import '../../src/index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const BASEMAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

const map = new mapboxgl.Map({
  container: 'map',
  style: BASEMAP_STYLE,
  center: [-123.06171, 44.0499],
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
    title: 'LiDAR Viewer',
    collapsed: true,
    panelWidth: 360,
    pointSize: 2,
    opacity: 1.0,
    colorScheme: 'elevation',
    colormap: 'viridis',
    showColorbar: true,
    colorRange: {
      mode: 'percentile',
      percentileLow: 2,
      percentileHigh: 98,
    },
  });

  map.addControl(lidarControl, 'top-right');

  lidarControl.loadPointCloud('https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz');

  lidarControl.on('load', (event) => {
    console.log('Point cloud loaded:', event.pointCloud);
    if (event.pointCloud) {
      console.log(`  - Name: ${event.pointCloud.name}`);
      console.log(`  - Points: ${event.pointCloud.pointCount.toLocaleString()}`);
      console.log(`  - Has RGB: ${event.pointCloud.hasRGB}`);
      console.log(`  - Has Intensity: ${event.pointCloud.hasIntensity}`);
      console.log(`  - Has Classification: ${event.pointCloud.hasClassification}`);
    }
  });
});
