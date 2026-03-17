import { LineCanvas } from "./LineCanvas"
import { DraggableManager } from "./DraggableManager"
import {
  Node,
  NodePosition,
  Connection,
  LineOptions,
  LineData,
  LineStyle,
  ConnectionMode,
} from "./types"

export class LineConnector {
  private options: Required<LineOptions>
  private canvas: LineCanvas
  private manager: DraggableManager
  private isDestroyed = false
  private resizeObserver: ResizeObserver
  private leftNodes = new Map<string, NodePosition>()
  private rightNodes = new Map<string, NodePosition>()

  constructor(container: HTMLElement, options: Partial<LineOptions> = {}) {
    this.options = {
      lineColor: options.lineColor ?? "#1890ff",
      lineWidth: options.lineWidth ?? 2,
      lineStyle: options.lineStyle ?? LineStyle.Bezier,
      curvature: options.curvature ?? 0.5,
      connectionMode: options.connectionMode ?? ConnectionMode.Drag,
      showLine: options.showLine ?? true,
      connectedIcon: options.connectedIcon ?? "✓",
      onConnectionAdded: options.onConnectionAdded ?? (() => {}),
      onConnectionRemoved: options.onConnectionRemoved ?? (() => {}),
    }

    this.canvas = new LineCanvas(container, this.options)

    this.manager = new DraggableManager(
      this.options,
      {
        draw: (nodeId, x, y) => this.canvas.drawTempLine(nodeId, x, y),
        update: (x, y) => this.canvas.updateTempLine(x, y),
        remove: () => this.canvas.removeTempLine(),
      },
      (nodeId, icon) => this.canvas.updateNodeIcon(nodeId, icon),
    )

    this.manager.onAddConnection = (conn) => {
      this.canvas.drawLine(conn)
      this.options.onConnectionAdded(conn)
    }

    this.manager.onRemoveConnection = (conn) => {
      this.canvas.removeLine(conn)
      this.options.onConnectionRemoved(conn)
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.redrawLines()
    })
    this.resizeObserver.observe(container)
  }

  private updateNodes(nodes: Node[], side: "left" | "right"): void {
    const nodesMap = side === "left" ? this.leftNodes : this.rightNodes

    nodes.forEach((node) => {
      const element = document.querySelector(
        `[data-line-node-id="${node.id}"]`,
      ) as HTMLElement

      if (!element) return

      if (nodesMap.has(node.id)) {
        const existing = nodesMap.get(node.id)!
        if (existing.element === element && element.isConnected) return
      }

      element.setAttribute("data-line-node", "true")
      element.setAttribute("data-line-node-id", node.id)
      nodesMap.set(node.id, { id: node.id, element, side })
    })

    if (side === "left") {
      this.canvas.updateLeftNodes(this.leftNodes)
      this.manager.updateLeftNodes(this.leftNodes)
    } else {
      this.canvas.updateRightNodes(this.rightNodes)
      this.manager.updateRightNodes(this.rightNodes)
    }
  }

  setLeftNodes(nodes: Node[]): void {
    this.updateNodes(nodes, "left")
  }

  setRightNodes(nodes: Node[]): void {
    this.updateNodes(nodes, "right")
  }

  addConnection(connection: Connection): void {
    this.manager.addConnection(connection)
    this.canvas.drawLine(connection)
  }

  removeConnection(connection: Connection): void {
    this.manager.removeConnection(connection)
    this.canvas.removeLine(connection)
  }

  getConnections(): Connection[] {
    return this.manager.getConnections()
  }

  getAllLines(): LineData[] {
    return this.canvas.getAllLines()
  }

  redrawLines(): void {
    this.getConnections().forEach((conn) => {
      this.canvas.updateLine(conn)
    })
  }

  clear(): void {
    this.manager.clearConnections()
    this.canvas.clearLines()
  }

  updateOptions(options: Partial<LineOptions>): void {
    this.options = { ...this.options, ...options }
    this.canvas.updateOptions(options)
    this.manager.updateOptions(options)

    if (options.connectionMode !== undefined) {
      this.manager.resetNodeIcons()
    }
  }

  setConnectionMode(mode: ConnectionMode): void {
    this.updateOptions({ connectionMode: mode })
  }

  getOptions(): Required<LineOptions> {
    return { ...this.options }
  }

  destroy(): void {
    if (this.isDestroyed) return

    this.resizeObserver.disconnect()
    this.canvas.destroy()
    this.manager.destroy()
    this.isDestroyed = true
  }
}
