# mapbox-gl-lidar

基于 Mapbox GL JS 和 deck.gl 的 LiDAR 点云可视化插件。

[![npm 版本](https://img.shields.io/npm/v/mapbox-gl-lidar.svg)](https://www.npmjs.com/package/mapbox-gl-lidar)
[![许可证: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 功能特性

- 加载并可视化 LAS/LAZ/COPC 点云文件（LAS 1.0 - 1.4）
- **动态 COPC 流式加载** - 基于视口的加载方式，适用于大型云优化点云
- **EPT (Entwine Point Tile) 支持** - 从 EPT 服务器流式加载大型点云数据集
- 多种配色方案：高程、强度、分类、RGB
- **分类图例与切换** - 交互式图例，可显示/隐藏各分类类型
- **基于百分比的配色** - 使用 2-98% 百分位范围获得更好的色彩分布（裁剪异常值）
- 可滚动的交互式 GUI 控制面板
- **点云拾取** - 悬停查看所有可用属性（坐标、高程、强度、分类、RGB、GPS时间、回波数等）
- **Z 轴偏移调整** - 垂直移动点云进行对齐
- **高程过滤** - 按高程范围过滤点
- 自动坐标转换（投影坐标系转 WGS84）
- 编程式 API，支持加载和样式控制
- React 集成与 Hooks
- deck.gl PointCloudLayer，针对大数据集优化分块
- TypeScript 支持

## 安装

```bash
npm install mapbox-gl-lidar
```

## 快速开始

### 基础用法（原生 JS/TypeScript）

```typescript
import mapboxgl from "mapbox-gl";
import { LidarControl } from "mapbox-gl-lidar";
import "mapbox-gl-lidar/style.css";
import "mapbox-gl/dist/mapbox-gl.css";

// 设置 Mapbox 访问令牌
mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v11",
  center: [-122.4, 37.8],
  zoom: 12,
  pitch: 60,
  maxPitch: 85,
});

map.on("load", () => {
  const lidarControl = new LidarControl({
    title: "LiDAR 查看器",
    collapsed: true,
    pointSize: 2,
    colorScheme: "elevation",
    pickable: true,
  });

  map.addControl(lidarControl, "top-right");

  lidarControl.on("load", (event) => {
    console.log("点云已加载:", event.pointCloud);
    lidarControl.flyToPointCloud();
  });

  lidarControl.loadPointCloud(
    "https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz"
  );
});
```

### React 用法

```tsx
import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import { LidarControlReact, useLidarState } from "mapbox-gl-lidar/react";
import "mapbox-gl-lidar/style.css";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const { state, setColorScheme, setPointSize } = useLidarState();

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-122.4, 37.8],
      zoom: 12,
      pitch: 60,
      maxPitch: 85,
    });

    mapInstance.on("load", () => setMap(mapInstance));

    return () => mapInstance.remove();
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {map && (
        <LidarControlReact
          map={map}
          title="LiDAR 查看器"
          pointSize={state.pointSize}
          colorScheme={state.colorScheme}
          onLoad={(pc) => console.log("已加载:", pc)}
          defaultUrl="https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz"
        />
      )}
    </div>
  );
}
```

## API 参考

### LidarControl

实现 Mapbox GL `IControl` 接口的主控制类。

#### 构造函数选项

```typescript
interface LidarControlOptions {
  collapsed?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  title?: string;
  panelWidth?: number;
  panelMaxHeight?: number;
  className?: string;
  pointSize?: number;
  opacity?: number;
  colorScheme?: ColorScheme;
  usePercentile?: boolean;
  pointBudget?: number;
  elevationRange?: [number, number] | null;
  zOffsetEnabled?: boolean;
  zOffset?: number;
  pickable?: boolean;
  pickInfoFields?: string[];
  autoZoom?: boolean;
  copcLoadingMode?: "full" | "dynamic";
  streamingPointBudget?: number;
  streamingMaxConcurrentRequests?: number;
  streamingViewportDebounceMs?: number;
}
```

#### 方法

```typescript
loadPointCloud(source: string | File | ArrayBuffer, options?: { loadingMode?: 'full' | 'dynamic' }): Promise<PointCloudInfo>
loadPointCloudStreaming(source: string | File | ArrayBuffer, options?: StreamingLoaderOptions): Promise<PointCloudInfo>
stopStreaming(): void
unloadPointCloud(id?: string): void
getPointClouds(): PointCloudInfo[]
flyToPointCloud(id?: string): void
setPointSize(size: number): void
setOpacity(opacity: number): void
setColorScheme(scheme: ColorScheme): void
setUsePercentile(usePercentile: boolean): void
getUsePercentile(): boolean
setElevationRange(min: number, max: number): void
clearElevationRange(): void
setPickable(pickable: boolean): void
setZOffsetEnabled(enabled: boolean): void
setZOffset(offset: number): void
getZOffset(): number
setPickInfoFields(fields?: string[]): void
getPickInfoFields(): string[] | undefined
setClassificationVisibility(code: number, visible: boolean): void
showAllClassifications(): void
hideAllClassifications(): void
getHiddenClassifications(): number[]
getAvailableClassifications(): number[]
toggle(): void
expand(): void
collapse(): void
on(event: LidarControlEvent, handler: LidarControlEventHandler): void
off(event: LidarControlEvent, handler: LidarControlEventHandler): void
getState(): LidarState
getMap(): MapboxMap | undefined
```

#### 事件

- `load` - 点云加载成功
- `loadstart` - 开始加载
- `loaderror` - 加载失败
- `unload` - 点云卸载
- `statechange` - 控制状态改变
- `stylechange` - 样式改变
- `collapse` - 面板折叠
- `expand` - 面板展开
- `streamingstart` - 开始动态流式加载
- `streamingstop` - 停止动态流式加载
- `streamingprogress` - 流式加载进度更新
- `budgetreached` - 达到点数量限制

### 配色方案

- `'elevation'` - 基于 Z 值的类 Viridis 色彩渐变
- `'intensity'` - 基于强度属性的灰度
- `'classification'` - ASPRS 标准分类颜色
- `'rgb'` - 使用内置 RGB 颜色（如果有）

## 支持的格式

- LAS 1.0 - 1.4（通过 copc.js + loaders.gl 回退支持所有版本）
- LAZ（压缩 LAS）
- COPC（云优化点云）- 支持动态流式加载
- EPT（Entwine Point Tile）- 基于 HTTP 服务器的视口流式加载

## 开发构建指南

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 开发命令

```bash
# 运行测试
npm test

# 类型检查
npm run lint

# 代码格式化
npm run format

# 构建库（输出到 dist/）
npm run build

# 构建示例（输出到 dist-examples/）
npm run build:examples

# 预览构建结果
npm run preview
```

### 本地预览示例

构建示例后，使用任意静态服务器预览：

```bash
# 使用 npx serve
npx serve dist-examples -l 3000

# 或使用 npx http-server
npx http-server dist-examples -p 3000
```

然后在浏览器中打开 http://localhost:3000/

### 构建产物

| 目录 | 说明 |
|------|------|
| `dist/` | 库的核心构建产物 |
| `dist-examples/` | 示例应用的构建产物 |

`dist/` 目录包含：
- `index.mjs` / `index.cjs` - 主入口
- `react.mjs` / `react.cjs` - React 入口
- `mapbox-gl-lidar.css` - 样式文件
- `types/` - TypeScript 类型声明

## Docker

可以使用 Docker 运行示例：

```bash
# 构建镜像
docker build -t mapbox-gl-lidar .

# 运行容器
docker run -p 8080:80 mapbox-gl-lidar
```

然后在浏览器中打开 http://localhost:8080/mapbox-gl-lidar/

## 依赖

- [deck.gl](https://deck.gl/) - WebGL 可视化层
- [copc.js](https://github.com/connormanning/copc.js) - COPC/LAS/LAZ 解析（LAS 1.2/1.4）
- [@loaders.gl/las](https://loaders.gl/modules/las/docs) - LAS 解析回退（LAS 1.0/1.1/1.3）
- [laz-perf](https://github.com/hobu/laz-perf) - LAZ 解压缩
- [proj4](http://proj4js.org/) - 坐标转换
- [mapbox-gl](https://www.mapbox.com/) - 地图渲染

## 许可证

MIT
