import {
  NodePosition,
  Connection,
  LineOptions,
  DEFAULT_OPTIONS,
  ConnectionMode,
} from "./types";

export class DraggableManager {
  private options: Required<LineOptions>;
  private leftNodes = new Map<string, NodePosition>();
  private rightNodes = new Map<string, NodePosition>();
  private connections = new Map<string, Connection>();

  private isDraggingLine = false;
  private dragStartNodeId: string | null = null;

  private clickStartNodeId: string | null = null;
  private clickStartSide: "left" | "right" | null = null;

  public onAddConnection?: (connection: Connection) => void;
  public onRemoveConnection?: (connection: Connection) => void;

  private drawTempLine: (
    nodeId: string,
    clientX: number,
    clientY: number,
  ) => void;
  private updateTempLine: (clientX: number, clientY: number) => void;
  private removeTempLine: () => void;
  private updateNodeIcon?: (
    nodeId: string,
    icon: "default" | "plus" | "connected",
  ) => void;

  constructor(
    options: LineOptions,
    tempLineHandlers: {
      draw: (nodeId: string, clientX: number, clientY: number) => void;
      update: (clientX: number, clientY: number) => void;
      remove: () => void;
    },
    updateNodeIcon?: (
      nodeId: string,
      icon: "default" | "plus" | "connected",
    ) => void,
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.drawTempLine = tempLineHandlers.draw;
    this.updateTempLine = tempLineHandlers.update;
    this.removeTempLine = tempLineHandlers.remove;
    this.updateNodeIcon = updateNodeIcon;

    this.onAddConnection = options.onConnectionAdded;
    this.onRemoveConnection = options.onConnectionRemoved;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  private initNodeDrag(nodePosition: NodePosition): void {
    const { element, side } = nodePosition;

    if (element.querySelector(".line-drag-handle")) return;

    const handle = document.createElement("div");
    handle.className = "line-drag-handle";

    const isLeft = side === "left";
    Object.assign(handle.style, {
      position: "absolute",
      width: "12px",
      height: "12px",
      background: "#1890ff",
      borderRadius: "50%",
      cursor:
        this.options.connectionMode === ConnectionMode.Click
          ? "pointer"
          : "crosshair",
      zIndex: "1001",
      top: "50%",
      transform: "translateY(-50%)",
      [isLeft ? "right" : "left"]: "-6px",
    });

    element.style.position = "relative";
    element.appendChild(handle);

    if (this.options.connectionMode === ConnectionMode.Click) {
      handle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleClick(nodePosition.id, side, e as MouseEvent);
      });
    } else {
      handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.startLineDrag(nodePosition.id, side, e);
      });
    }
  }

  private startLineDrag(
    nodeId: string,
    side: "left" | "right",
    event: MouseEvent,
  ): void {
    const node =
      side === "left"
        ? this.leftNodes.get(nodeId)
        : this.rightNodes.get(nodeId);
    if (node) {
      this.isDraggingLine = true;
      this.dragStartNodeId = nodeId;
      this.drawTempLine(nodeId, event.clientX, event.clientY);
    }
  }

  private handleClick(
    nodeId: string,
    side: "left" | "right",
    event: MouseEvent,
  ): void {
    const isNodeConnected = this.checkNodeConnected(nodeId);

    if (this.clickStartNodeId === null) {
      if (isNodeConnected) return;

      this.clickStartNodeId = nodeId;
      this.clickStartSide = side;
      if (this.updateNodeIcon) this.updateNodeIcon(nodeId, "plus");

      const node =
        side === "left"
          ? this.leftNodes.get(nodeId)
          : this.rightNodes.get(nodeId);
      if (node) this.drawTempLine(nodeId, event.clientX, event.clientY);
    } else {
      if (this.clickStartNodeId === nodeId) {
        if (this.updateNodeIcon) this.updateNodeIcon(nodeId, "default");
        this.clickStartNodeId = null;
        this.clickStartSide = null;
        this.removeTempLine();
      } else {
        const isLeftToRight =
          this.clickStartSide === "left" && side === "right";
        const isRightToLeft =
          this.clickStartSide === "right" && side === "left";

        if (isLeftToRight || isRightToLeft) {
          const fromNodeId = isLeftToRight ? this.clickStartNodeId : nodeId;
          const toNodeId = isLeftToRight ? nodeId : this.clickStartNodeId;

          const existingConnectionId = `${fromNodeId}-${toNodeId}`;
          const connectionExists = this.connections.has(existingConnectionId);

          if (!connectionExists) {
            this.tryConnect(fromNodeId, toNodeId);
          }
        } else if (this.updateNodeIcon) {
          this.updateNodeIcon(this.clickStartNodeId, "default");
        }
        this.clickStartNodeId = null;
        this.clickStartSide = null;
        this.removeTempLine();
      }
    }
  }

  private checkNodeConnected(nodeId: string): boolean {
    return Array.from(this.connections.values()).some(
      (conn) => conn.fromNodeId === nodeId || conn.toNodeId === nodeId,
    );
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.isDraggingLine && this.dragStartNodeId) {
      this.updateTempLine(event.clientX, event.clientY);
    }
    if (this.clickStartNodeId && this.clickStartSide) {
      this.updateTempLine(event.clientX, event.clientY);
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.isDraggingLine && this.dragStartNodeId) {
      const target = event.target as HTMLElement;
      const targetNodeElement = target.closest("[data-line-node]");

      if (targetNodeElement) {
        const targetNodeId =
          targetNodeElement.getAttribute("data-line-node-id");
        if (targetNodeId) this.tryConnect(this.dragStartNodeId, targetNodeId);
      }

      this.isDraggingLine = false;
      this.dragStartNodeId = null;
      this.removeTempLine();
    }
  }

  private tryConnect(fromNodeId: string, toNodeId: string): void {
    if (fromNodeId === toNodeId) return;

    const isLeftToRight =
      this.leftNodes.has(fromNodeId) && this.rightNodes.has(toNodeId);
    const isRightToLeft =
      this.rightNodes.has(fromNodeId) && this.leftNodes.has(toNodeId);

    if (!isLeftToRight && !isRightToLeft) return;

    const connectionId = `${fromNodeId}-${toNodeId}`;
    if (this.connections.has(connectionId)) return;

    const connection: Connection = { fromNodeId, toNodeId };
    this.connections.set(connectionId, connection);

    if (this.onAddConnection) this.onAddConnection(connection);
  }

  updateLeftNodes(nodes: Map<string, NodePosition>): void {
    this.leftNodes = nodes;
    nodes.forEach((nodePosition) => this.initNodeDrag(nodePosition));
  }

  updateRightNodes(nodes: Map<string, NodePosition>): void {
    this.rightNodes = nodes;
    nodes.forEach((nodePosition) => this.initNodeDrag(nodePosition));
  }

  addConnection(connection: Connection): void {
    this.connections.set(
      `${connection.fromNodeId}-${connection.toNodeId}`,
      connection,
    );
  }

  removeConnection(connection: Connection): void {
    const connectionId = `${connection.fromNodeId}-${connection.toNodeId}`;

    if (this.connections.has(connectionId)) {
      this.connections.delete(connectionId);
      if (this.onRemoveConnection) this.onRemoveConnection(connection);
    }
  }

  clearConnections(): void {
    this.connections.clear();
  }

  getConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  updateOptions(options: Partial<LineOptions>): void {
    this.options = { ...this.options, ...options };
    this.onRemoveConnection =
      options.onConnectionRemoved || this.onRemoveConnection;

    if (options.connectionMode !== undefined) {
      const cursor =
        options.connectionMode === ConnectionMode.Click
          ? "pointer"
          : "crosshair";
      const allNodes = [
        ...this.leftNodes.values(),
        ...this.rightNodes.values(),
      ];

      allNodes.forEach((nodePosition) => {
        const handle = nodePosition.element.querySelector(
          ".line-drag-handle",
        ) as HTMLElement;
        if (handle) handle.style.cursor = cursor;
      });

      this.resetNodeIcons();

      allNodes.forEach((nodePosition) => {
        this.reinitNodeDrag(nodePosition);
      });
    }
  }

  private reinitNodeDrag(nodePosition: NodePosition): void {
    const { element, side } = nodePosition;
    const handle = element.querySelector(".line-drag-handle") as HTMLElement;

    if (!handle) return;

    const newHandle = handle.cloneNode(true) as HTMLElement;
    handle.replaceWith(newHandle);

    if (this.options.connectionMode === ConnectionMode.Click) {
      newHandle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleClick(nodePosition.id, side, e as MouseEvent);
      });
    } else {
      newHandle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.startLineDrag(nodePosition.id, side, e);
      });
    }
  }

  resetNodeIcons(): void {
    const allNodes = [...this.leftNodes.values(), ...this.rightNodes.values()];
    allNodes.forEach((nodePosition) => {
      if (this.updateNodeIcon) this.updateNodeIcon(nodePosition.id, "default");
    });
  }

  destroy(): void {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    this.clearConnections();

    const allNodes = [...this.leftNodes.values(), ...this.rightNodes.values()];
    allNodes.forEach((nodePosition) => {
      const handle = nodePosition.element.querySelector(".line-drag-handle");
      if (handle) handle.remove();
    });
  }
}
