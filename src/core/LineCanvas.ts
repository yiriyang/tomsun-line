import {
  NodePosition,
  Connection,
  LineOptions,
  LineStyle,
  DEFAULT_OPTIONS,
  LineData,
} from "./types";

const ICON_STYLES = {
  container: {
    position: "absolute",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white",
    border: "2px solid #1890ff",
    borderRadius: "50%",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#1890ff",
    zIndex: "1002",
    top: "50%",
    transform: "translateY(-50%)",
  },
  plus: {
    background: "white",
    color: "#1890ff",
  },
  connected: {
    background: "#1890ff",
    color: "white",
  },
};

export class LineCanvas {
  private svg: SVGSVGElement;
  private lines = new Map<string, LineData>();
  private options: Required<LineOptions>;
  private leftNodes = new Map<string, NodePosition>();
  private rightNodes = new Map<string, NodePosition>();
  private tempLine: SVGPathElement | null = null;
  private tempLineStart: { x: number; y: number } | null = null;
  private nodeIcons = new Map<string, HTMLElement>();

  constructor(container: HTMLElement, options: Partial<LineOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    Object.assign(this.svg.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "1000",
    });

    container.appendChild(this.svg);
  }

  updateLeftNodes(nodes: Map<string, NodePosition>): void {
    this.leftNodes = nodes;
    this.redrawAllLines();
  }

  updateRightNodes(nodes: Map<string, NodePosition>): void {
    this.rightNodes = nodes;
    this.redrawAllLines();
  }

  private findNode(nodeId: string): NodePosition | undefined {
    return this.leftNodes.get(nodeId) ?? this.rightNodes.get(nodeId);
  }

  drawLine(connection: Connection): void {
    const { fromNodeId, toNodeId } = connection;
    const lineId = `${fromNodeId}-${toNodeId}`;

    if (this.lines.has(lineId)) {
      this.updateLine(connection);
      return;
    }

    const fromNode = this.findNode(fromNodeId);
    const toNode = this.findNode(toNodeId);

    if (!fromNode || !toNode) return;

    const { startX, startY, endX, endY } = this.calculateLinePositions(
      fromNode.side,
      fromNode.element,
      toNode.element,
    );

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", this.options.lineColor);
    path.setAttribute("stroke-width", String(this.options.lineWidth));
    path.setAttribute("fill", "none");
    path.setAttribute("cursor", "pointer");
    path.style.pointerEvents = "stroke";

    path.setAttribute("d", this.calculatePath(startX, startY, endX, endY));
    this.svg.appendChild(path);

    this.lines.set(lineId, {
      id: lineId,
      fromNodeId,
      toNodeId,
      fromSide: fromNode.side,
      element: path,
    });
  }

  private calculateLinePositions(
    fromSide: "left" | "right",
    fromElement: HTMLElement,
    toElement: HTMLElement,
  ): { startX: number; startY: number; endX: number; endY: number } {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const svgRect = this.svg.getBoundingClientRect();

    const startX =
      fromSide === "left"
        ? fromRect.right - svgRect.left
        : fromRect.left - svgRect.left;
    const startY = fromRect.top + fromRect.height / 2 - svgRect.top;

    const toSide = this.getNodeSide(toRect, svgRect);
    const endX =
      toSide === "left"
        ? toRect.right - svgRect.left
        : toRect.left - svgRect.left;
    const endY = toRect.top + toRect.height / 2 - svgRect.top;

    return { startX, startY, endX, endY };
  }

  private getNodeSide(nodeRect: DOMRect, svgRect: DOMRect): "left" | "right" {
    const centerX = nodeRect.left + nodeRect.width / 2;
    const svgCenterX = svgRect.left + svgRect.width / 2;
    return centerX < svgCenterX ? "left" : "right";
  }

  updateLine(connection: Connection): void {
    const { fromNodeId, toNodeId } = connection;
    const lineData = this.lines.get(`${fromNodeId}-${toNodeId}`);

    if (!lineData) return;

    const fromNode = this.findNode(fromNodeId);
    const toNode = this.findNode(toNodeId);

    if (!fromNode || !toNode) return;

    const { startX, startY, endX, endY } = this.calculateLinePositions(
      lineData.fromSide,
      fromNode.element,
      toNode.element,
    );

    lineData.element.setAttribute(
      "d",
      this.calculatePath(startX, startY, endX, endY),
    );
  }

  removeLine(connection: Connection): void {
    const { fromNodeId, toNodeId } = connection;
    const lineId = `${fromNodeId}-${toNodeId}`;
    const lineData = this.lines.get(lineId);

    if (lineData) {
      this.svg.removeChild(lineData.element);
      this.lines.delete(lineId);
    }
  }

  clearLines(): void {
    this.lines.forEach((lineData) => {
      this.svg.removeChild(lineData.element);
    });
    this.lines.clear();
  }

  drawTempLine(startNodeId: string, clientX: number, clientY: number): void {
    this.removeTempLine();

    const startNode = this.findNode(startNodeId);
    if (!startNode) return;

    const startRect = startNode.element.getBoundingClientRect();
    const svgRect = this.svg.getBoundingClientRect();

    const startX =
      startNode.side === "left"
        ? startRect.right - svgRect.left
        : startRect.left - svgRect.left;
    const startY = startRect.top + startRect.height / 2 - svgRect.top;

    this.tempLineStart = { x: startX, y: startY };

    this.tempLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    this.tempLine.setAttribute("stroke", this.options.lineColor);
    this.tempLine.setAttribute("stroke-width", String(this.options.lineWidth));
    this.tempLine.setAttribute("fill", "none");
    this.tempLine.setAttribute("stroke-dasharray", "5,5");
    this.tempLine.setAttribute("opacity", "0.6");
    this.tempLine.setAttribute(
      "d",
      this.calculatePath(
        startX,
        startY,
        clientX - svgRect.left,
        clientY - svgRect.top,
      ),
    );

    this.svg.appendChild(this.tempLine);
  }

  updateTempLine(clientX: number, clientY: number): void {
    if (!this.tempLine || !this.tempLineStart) return;

    const svgRect = this.svg.getBoundingClientRect();
    this.tempLine.setAttribute(
      "d",
      this.calculatePath(
        this.tempLineStart.x,
        this.tempLineStart.y,
        clientX - svgRect.left,
        clientY - svgRect.top,
      ),
    );
  }

  removeTempLine(): void {
    if (this.tempLine) {
      this.svg.removeChild(this.tempLine);
      this.tempLine = null;
      this.tempLineStart = null;
    }
  }

  updateNodeIcon(nodeId: string, icon: "default" | "plus" | "connected"): void {
    const node = this.findNode(nodeId);
    if (!node) return;

    if (icon === "default") {
      const iconElement = this.nodeIcons.get(nodeId);
      if (iconElement) {
        iconElement.remove();
        this.nodeIcons.delete(nodeId);
      }
      return;
    }

    let iconElement = this.nodeIcons.get(nodeId);
    if (!iconElement) {
      iconElement = document.createElement("div");
      iconElement.className = "line-node-icon";
      Object.assign(iconElement.style, ICON_STYLES.container);
      iconElement.style[node.side === "left" ? "right" : "left"] = "-10px";
      node.element.style.position = "relative";
      node.element.appendChild(iconElement);
      this.nodeIcons.set(nodeId, iconElement);
    }

    if (icon === "plus") {
      iconElement.textContent = "+";
      Object.assign(iconElement.style, ICON_STYLES.plus);
    } else if (icon === "connected") {
      iconElement.textContent = "✓";
      Object.assign(iconElement.style, ICON_STYLES.connected);
    }
  }

  private calculatePath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ): string {
    if (this.options.lineStyle === LineStyle.Straight) {
      return `M ${startX},${startY} L ${endX},${endY}`;
    }

    const curvature = this.options.curvature;
    const controlDistance = Math.abs(endX - startX) * curvature;

    return `M ${startX},${startY} C ${startX + controlDistance},${startY} ${endX - controlDistance},${endY} ${endX},${endY}`;
  }

  private redrawAllLines(): void {
    this.lines.forEach((lineData) => {
      this.updateLine({
        fromNodeId: lineData.fromNodeId,
        toNodeId: lineData.toNodeId,
      });
    });
  }

  updateOptions(options: Partial<LineOptions>): void {
    this.options = { ...this.options, ...options };

    this.lines.forEach((lineData) => {
      if (options.lineColor)
        lineData.element.setAttribute("stroke", options.lineColor);
      if (options.lineWidth)
        lineData.element.setAttribute(
          "stroke-width",
          String(options.lineWidth),
        );
    });
  }

  getSvgElement(): SVGSVGElement {
    return this.svg;
  }

  getAllLines(): LineData[] {
    return Array.from(this.lines.values());
  }

  destroy(): void {
    this.clearLines();
    this.removeTempLine();

    this.nodeIcons.forEach((iconElement) => {
      if (iconElement.parentNode)
        iconElement.parentNode.removeChild(iconElement);
    });
    this.nodeIcons.clear();

    if (this.svg.parentNode) this.svg.parentNode.removeChild(this.svg);
  }
}
