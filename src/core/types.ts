export interface Node {
  id: string
  label: string
}

export interface Connection {
  fromNodeId: string
  toNodeId: string
}

export interface NodePosition {
  id: string
  element: HTMLElement
  side: "left" | "right"
}

export enum LineStyle {
  Straight = "straight",
  Bezier = "bezier",
}

export enum ConnectionMode {
  Drag = "drag",
  Click = "click",
}

export interface LineOptions {
  lineColor?: string
  lineWidth?: number
  lineStyle?: LineStyle
  curvature?: number
  connectionMode?: ConnectionMode
  onConnectionAdded?: (connection: Connection) => void
  onConnectionRemoved?: (connection: Connection) => void
}

export const DEFAULT_OPTIONS: Required<LineOptions> = {
  lineColor: "#1890ff",
  lineWidth: 2,
  lineStyle: LineStyle.Bezier,
  curvature: 0.5,
  connectionMode: ConnectionMode.Drag,
  onConnectionAdded: () => {},
  onConnectionRemoved: () => {},
}

export interface LineData {
  id: string
  fromNodeId: string
  toNodeId: string
  fromSide: "left" | "right"
  element: SVGPathElement
}
