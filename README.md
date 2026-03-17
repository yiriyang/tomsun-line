# TomSun Line

> 一个通用的开源连线插件，支持从左侧列表拖拽或点击连接到右侧列表项

![Version](https://img.shields.io/npm/v/tomsun-line)
![License](https://img.shields.io/npm/l/tomsun-line)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## 特性

- 框架无关的核心库，支持原生 JavaScript、TypeScript
- 提供 React 和 Vue 组件封装，开箱即用
- 支持两种连线样式：直线和贝塞尔曲线
- 支持两种连接模式：拖拽模式和点击模式
- 支持双向连接（左→右 或 右→左）
- 自动在节点边缘添加连接点
- 点击模式时显示连接状态图标（+ 和 ✓）
- 支持隐藏实线，连接后显示自定义连接点状态
- TypeScript 类型支持
- 响应式设计，自动适应窗口大小变化

## 安装

```bash
npm install tomsun-line
```

## 快速开始

### 原生 JavaScript / TypeScript

```typescript
import { LineConnector, LineStyle, ConnectionMode } from "tomsun-line";

// 创建连接器
const connector = new LineConnector(container, {
  lineColor: "#1890ff",
  lineWidth: 2,
  lineStyle: LineStyle.Bezier,
  curvature: 0.5,
  connectionMode: ConnectionMode.Drag,
  onConnectionAdded: (conn) => {
    console.log("New connection:", conn);
  },
  onConnectionRemoved: (conn) => {
    console.log("Connection removed:", conn);
  },
});

// 设置节点
connector.setLeftNodes([
  { id: "1", label: "用户登录" },
  { id: "2", label: "注册账号" },
]);

connector.setRightNodes([
  { id: "3", label: "首页" },
  { id: "4", label: "产品页" },
]);

// 添加连接
connector.addConnection({ fromNodeId: "1", toNodeId: "3" });
```

### React

```tsx
import { LineConnector } from "tomsun-line/adapters/React";
import { LineStyle, ConnectionMode } from "tomsun-line";

function App() {
  const leftNodes = [
    { id: "1", label: "用户登录" },
    { id: "2", label: "注册账号" },
  ];

  const rightNodes = [
    { id: "3", label: "首页" },
    { id: "4", label: "产品页" },
  ];

  return (
    <LineConnector
      leftNodes={leftNodes}
      rightNodes={rightNodes}
      options={{
        lineStyle: LineStyle.Bezier,
        connectionMode: ConnectionMode.Drag,
      }}
      onConnectionAdded={(conn) => console.log("Connected:", conn)}
      onConnectionRemoved={(conn) => console.log("Removed:", conn)}
    >
      <div className="columns">
        <div className="column">
          {leftNodes.map((node) => (
            <div key={node.id} data-line-node-id={node.id} className="node">
              {node.label}
            </div>
          ))}
        </div>
        <div className="column">
          {rightNodes.map((node) => (
            <div key={node.id} data-line-node-id={node.id} className="node">
              {node.label}
            </div>
          ))}
        </div>
      </div>
    </LineConnector>
  );
}
```

### Vue

```vue
<script setup>
import LineConnector from "tomsun-line/adapters/Vue";
import { ref } from "vue";

const leftNodes = ref([
  { id: "1", label: "用户登录" },
  { id: "2", label: "注册账号" },
]);

const rightNodes = ref([
  { id: "3", label: "首页" },
  { id: "4", label: "产品页" },
]);

const handleConnectionAdded = (conn) => {
  console.log("Connected:", conn);
};
</script>

<template>
  <LineConnector
    :leftNodes="leftNodes"
    :rightNodes="rightNodes"
    @connection-added="handleConnectionAdded"
  >
    <div class="columns">
      <div class="column">
        <div
          v-for="node in leftNodes"
          :key="node.id"
          :data-line-node-id="node.id"
          class="node"
        >
          {{ node.label }}
        </div>
      </div>
      <div class="column">
        <div
          v-for="node in rightNodes"
          :key="node.id"
          :data-line-node-id="node.id"
          class="node"
        >
          {{ node.label }}
        </div>
      </div>
    </div>
  </LineConnector>
</template>
```

## API 文档

### Node

节点类型定义

```typescript
interface Node {
  id: string; // 节点唯一标识
  label: string; // 节点显示文本
}
```

### Connection

连接类型定义

```typescript
interface Connection {
  fromNodeId: string; // 起始节点ID
  toNodeId: string; // 目标节点ID
}
```

### LineOptions

配置选项

| 选项                | 类型           | 默认值    | 描述                                               |
| ------------------- | -------------- | --------- | -------------------------------------------------- |
| lineColor           | string         | '#1890ff' | 线条颜色                                           |
| lineWidth           | number         | 2         | 线条宽度                                           |
| lineStyle           | LineStyle      | Bezier    | 连线样式（Straight/Bezier）                        |
| curvature           | number         | 0.5       | 贝塞尔曲线曲率 (0-1)                               |
| connectionMode      | ConnectionMode | Drag      | 连接模式（Drag/Click）                             |
| showLine            | boolean        | true      | 是否显示连接线（false 时隐藏实线，显示连接点状态） |
| connectedIcon       | string         | '✓'       | 连接完成后的连接点图标（showLine 为 false 时生效） |
| onConnectionAdded   | function       | -         | 连接添加时的回调                                   |
| onConnectionRemoved | function       | -         | 连接删除时的回调                                   |

### LineStyle

连线样式枚举

- `Straight` - 直线
- `Bezier` - 贝塞尔曲线

### ConnectionMode

连接模式枚举

- `Drag` - 拖拽模式：拖拽节点连接点直接连接到目标节点
- `Click` - 点击模式：先点击起始节点（显示 + 图标），再点击目标节点完成连接

### LineConnector 类方法

#### setLeftNodes(nodes: Node[])

设置左侧节点列表

```typescript
connector.setLeftNodes([
  { id: "1", label: "节点1" },
  { id: "2", label: "节点2" },
]);
```

#### setRightNodes(nodes: Node[])

设置右侧节点列表

```typescript
connector.setRightNodes([
  { id: "3", label: "节点3" },
  { id: "4", label: "节点4" },
]);
```

#### addConnection(connection: Connection)

添加连接

```typescript
connector.addConnection({ fromNodeId: "1", toNodeId: "3" });
```

#### removeConnection(connection: Connection)

删除连接

```typescript
connector.removeConnection({ fromNodeId: "1", toNodeId: "3" });
```

#### getConnections(): Connection[]

获取所有连接

```typescript
const connections = connector.getConnections();
```

#### getAllLines(): LineData[]

获取所有线条数据（包含 SVG 元素引用）

```typescript
const lines = connector.getAllLines();
```

#### redrawLines()

重新绘制所有线条（用于节点位置变化后）

```typescript
connector.redrawLines();
```

#### clear()

清空所有连接

```typescript
connector.clear();
```

#### updateOptions(options: Partial<LineOptions>)

更新配置选项

```typescript
connector.updateOptions({
  lineColor: "#ff0000",
  lineWidth: 3,
  lineStyle: LineStyle.Straight,
});
```

#### setConnectionMode(mode: ConnectionMode)

设置连接模式

```typescript
connector.setConnectionMode(ConnectionMode.Click);
```

#### getOptions(): Required<LineOptions>

获取当前配置选项

```typescript
const options = connector.getOptions();
```

#### destroy()

销毁实例，清理资源

```typescript
connector.destroy();
```

## 使用说明

### HTML 节点要求

为了使连接器能够识别节点，需要在节点元素上添加 `data-line-node-id` 属性：

```html
<div data-line-node-id="node-id">节点内容</div>
```

### 连接模式说明

#### 拖拽模式 (ConnectionMode.Drag)

这是默认模式。使用方法：

1. 鼠标悬停在节点边缘的蓝色圆点上
2. 按住鼠标左键拖拽到目标节点
3. 松开鼠标完成连接

#### 点击模式 (ConnectionMode.Click)

使用方法：

1. 点击起始节点的连接点（显示 + 图标）
2. 点击目标节点的连接点
3. 完成连接，两个节点都显示 ✓ 图标

### 删除连线

可以通过调用 `removeConnection` 方法删除连接：

```typescript
connector.removeConnection({ fromNodeId: "1", toNodeId: "3" });
```

### 清空所有连接

```typescript
connector.clear();
```

### 获取所有连接

```typescript
const connections = connector.getConnections();
```

### 动态更新节点

当节点列表发生变化时，只需重新调用 `setLeftNodes` 或 `setRightNodes`：

```typescript
// 添加新节点
connector.setLeftNodes([
  { id: "1", label: "节点1" },
  { id: "2", label: "节点2" },
  { id: "3", label: "新节点" }, // 新增节点
]);
```

### 动态更新样式

可以通过 `updateOptions` 方法动态更新样式：

```typescript
// 切换到直线样式
connector.updateOptions({ lineStyle: LineStyle.Straight });

// 修改颜色和宽度
connector.updateOptions({
  lineColor: "#52c41a",
  lineWidth: 3,
});
```

## React 组件 API

### LineConnector Props

```typescript
interface LineConnectorProps {
  leftNodes: Node[]; // 左侧节点列表
  rightNodes: Node[]; // 右侧节点列表
  options?: Partial<LineOptions>; // 配置选项
  onConnectionAdded?: (connection: Connection) => void; // 连接添加回调
  onConnectionRemoved?: (connection: Connection) => void; // 连接删除回调
  children?: React.ReactNode; // 子元素
}
```

### LineConnectorHandle

通过 ref 可以访问的方法：

```typescript
interface LineConnectorHandle {
  setLeftNodes: (nodes: Node[]) => void;
  setRightNodes: (nodes: Node[]) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (connection: Connection) => void;
  getConnections: () => Connection[];
  clear: () => void;
  redrawLines: () => void;
  setConnectionMode: (mode: ConnectionMode) => void;
}
```

### useLineConnector Hook

如果需要更灵活的控制，可以使用 `useLineConnector` hook：

```typescript
import { useLineConnector } from 'tomsun-line/adapters/React';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const connector = useLineConnector(containerRef, {
    lineColor: '#1890ff',
    lineStyle: LineStyle.Bezier
  });

  useEffect(() => {
    connector.setLeftNodes([...]);
    connector.setRightNodes([...]);
  }, []);

  return <div ref={containerRef}>...</div>;
}
```

## Vue 组件 API

### Props

```typescript
{
  leftNodes: Node[];                      // 左侧节点列表（必需）
  rightNodes: Node[];                     // 右侧节点列表（必需）
  options?: Partial<LineOptions>;         // 配置选项（可选）
}
```

### Events

```typescript
{
  'connection-added': (connection: Connection) => void;   // 连接添加时触发
  'connection-removed': (connection: Connection) => void; // 连接删除时触发
}
```

### 通过 ref 访问的方法

```typescript
{
  setLeftNodes: (nodes: Node[]) => void;
  setRightNodes: (nodes: Node[]) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (connection: Connection) => void;
  getConnections: () => Connection[];
  clear: () => void;
  redrawLines: () => void;
  setConnectionMode: (mode: ConnectionMode) => void;
}
```

## 运行示例

### React 示例

```bash
cd examples/react-demo
pnpm install
pnpm run dev
```

### Vue 示例

```bash
cd examples/vue-demo
pnpm install
pnpm run dev
```

## 开发

### 构建

```bash
pnpm run build
```

### 类型检查

```bash
pnpm run type-check
```

### 开发模式（监听文件变化）

```bash
pnpm run dev
```

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

MIT

## 作者

TomSun

## 贡献

欢迎提交 Issue 和 Pull Request！
