<template>
  <div class="app">
    <div class="header">
      <h1>TomSun Line - Vue Demo</h1>
      <p v-if="connectionMode === 'drag'">
        当前模式：拖拽模式 - 拖拽节点右侧的圆点连接到另一侧的节点
      </p>
      <p v-else>
        当前模式：点击模式 - 点击节点连接点，先点击左侧再点击右侧来创建连接
      </p>
    </div>

    <div class="controls">
      <button class="control-btn" @click="toggleLineStyle">
        切换线条样式: {{ lineStyle === "bezier" ? "贝塞尔曲线" : "直线" }}
      </button>
      <button class="control-btn secondary" @click="clearConnections">
        清空连接
      </button>
    </div>

    <LineConnector
      ref="lineConnectorRef"
      :leftNodes="leftNodes"
      :rightNodes="rightNodes"
      :options="{ lineStyle, connectionMode }"
      @connection-added="handleConnectionAdded"
      @connection-removed="handleConnectionRemoved"
    >
      <div class="connector-container">
        <div class="column">
          <div
            v-for="node in leftNodes"
            :key="node.id"
            :data-line-node-id="node.id"
            class="node-item"
          >
            {{ node.label }}
          </div>
        </div>
        <div class="column">
          <div
            v-for="node in rightNodes"
            :key="node.id"
            :data-line-node-id="node.id"
            class="node-item"
          >
            {{ node.label }}
          </div>
        </div>
      </div>
    </LineConnector>

    <div class="connections-panel">
      <div class="connections-title">当前连接 ({{ connections.length }})</div>
      <div
        v-if="connections.length === 0"
        style="color: #999; text-align: center; padding: 20px"
      >
        暂无连接，请{{
          connectionMode === "drag" ? "拖拽" : "点击"
        }}节点连接点来创建连接
      </div>
      <div
        v-for="(conn, index) in connections"
        :key="index"
        class="connection-item"
      >
        <span
          >{{ getNodeLabel(conn.fromNodeId) }} →
          {{ getNodeLabel(conn.toNodeId) }}</span
        >
        <button class="delete-btn" @click="removeConnection(conn)">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import LineConnector from "tomsun-line/adapters/Vue";
import { Node, Connection, LineStyle, ConnectionMode } from "tomsun-line";

const lineConnectorRef = ref<any>(null);
const lineStyle = ref<LineStyle>(LineStyle.Bezier);

// 连接模式，默认拖拽模式 drag 拖拽连接，点击模式 click 点击连接
const connectionMode: ConnectionMode = ConnectionMode.Drag;

const leftNodes = ref<Node[]>([
  { id: "1", label: "用户登录" },
  { id: "2", label: "注册账号" },
  { id: "3", label: "找回密码" },
  { id: "4", label: "个人中心" },
]);

const rightNodes = ref<Node[]>([
  { id: "5", label: "首页" },
  { id: "6", label: "产品页" },
  { id: "7", label: "关于我们" },
  { id: "8", label: "联系客服" },
]);

const connections = ref<Connection[]>([]);

const handleConnectionAdded = (conn: Connection) => {
  console.log("连接添加:", conn);
  connections.value.push(conn);
};

const handleConnectionRemoved = (conn: Connection) => {
  connections.value = connections.value.filter(
    (c) =>
      !(
        (c.fromNodeId === conn.fromNodeId && c.toNodeId === conn.toNodeId) ||
        (c.fromNodeId === conn.toNodeId && c.toNodeId === conn.fromNodeId)
      ),
  );
};

const removeConnection = (conn: Connection) => {
  console.log("删除连接:", conn);
  lineConnectorRef.value?.removeConnection(conn);
};

const clearConnections = () => {
  lineConnectorRef.value?.clear();
  connections.value = [];
};

const toggleLineStyle = () => {
  lineStyle.value =
    lineStyle.value === LineStyle.Bezier
      ? LineStyle.Straight
      : LineStyle.Bezier;
};

const getNodeLabel = (nodeId: string): string => {
  const leftNode = leftNodes.value.find((n) => n.id === nodeId);
  if (leftNode) return leftNode.label;
  const rightNode = rightNodes.value.find((n) => n.id === nodeId);
  return rightNode?.label || nodeId;
};
</script>
