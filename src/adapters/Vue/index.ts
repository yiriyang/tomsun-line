import { h, ref, onMounted, onUnmounted, watch, computed, nextTick } from "vue";
import { LineConnector as CoreLineConnector } from "../../core/LineConnector";
import type {
  Node,
  Connection,
  LineOptions,
  ConnectionMode,
} from "../../core/types";

interface Props {
  leftNodes: Node[];
  rightNodes: Node[];
  options?: Partial<LineOptions>;
}

const LineConnector = {
  name: "LineConnector",
  props: {
    leftNodes: {
      type: Array as () => Node[],
      required: true,
    },
    rightNodes: {
      type: Array as () => Node[],
      required: true,
    },
    options: {
      type: Object as () => Partial<LineOptions>,
      default: () => ({}),
    },
  },
  emits: ["connection-added", "connection-removed"],
  setup(props: Props, { emit }: any) {
    const containerRef = ref<HTMLElement | null>(null);
    const connector = ref<CoreLineConnector | null>(null);

    const combinedOptions = computed(() => ({
      ...props.options,
      onConnectionAdded: (conn: Connection) => emit("connection-added", conn),
      onConnectionRemoved: (conn: Connection) =>
        emit("connection-removed", conn),
    }));

    onMounted(async () => {
      if (containerRef.value) {
        connector.value = new CoreLineConnector(
          containerRef.value,
          combinedOptions.value,
        );
        await nextTick();
        connector.value.setLeftNodes(props.leftNodes);
        connector.value.setRightNodes(props.rightNodes);
      }
    });

    onUnmounted(() => {
      if (connector.value) {
        connector.value.destroy();
        connector.value = null;
      }
    });

    watch(
      () => props.leftNodes,
      (newNodes) => {
        connector.value?.setLeftNodes(newNodes);
      },
      { deep: true },
    );

    watch(
      () => props.rightNodes,
      (newNodes) => {
        connector.value?.setRightNodes(newNodes);
      },
      { deep: true },
    );

    return {
      containerRef,
      setLeftNodes: (nodes: Node[]) => connector.value?.setLeftNodes(nodes),
      setRightNodes: (nodes: Node[]) => connector.value?.setRightNodes(nodes),
      addConnection: (connection: Connection) =>
        connector.value?.addConnection(connection),
      removeConnection: (connection: Connection) =>
        connector.value?.removeConnection(connection),
      getConnections: () => connector.value?.getConnections() ?? [],
      clear: () => connector.value?.clear(),
      redrawLines: () => connector.value?.redrawLines(),
      setConnectionMode: (mode: ConnectionMode) =>
        connector.value?.setConnectionMode(mode),
    };
  },
  render() {
    return h(
      "div",
      {
        ref: "containerRef",
        class: "line-connector-container",
        style: {
          position: "relative",
          width: "100%",
          height: "100%",
        },
      },
      (this as any).$slots.default?.(),
    );
  },
};

export default LineConnector;
