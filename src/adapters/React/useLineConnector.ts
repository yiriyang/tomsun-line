import { useEffect, useRef } from "react"
import { LineConnector } from "../../core/LineConnector"
import type {
  Node,
  Connection,
  LineOptions,
  ConnectionMode,
} from "../../core/types"

export function useLineConnector(
  containerRef: React.RefObject<HTMLElement>,
  options: Partial<LineOptions> = {},
) {
  const connectorRef = useRef<LineConnector | null>(null)

  useEffect(() => {
    if (containerRef.current && !connectorRef.current) {
      connectorRef.current = new LineConnector(containerRef.current, options)
    }

    return () => {
      if (connectorRef.current) {
        connectorRef.current.destroy()
        connectorRef.current = null
      }
    }
  }, [])

  const setLeftNodes = (nodes: Node[]) => {
    connectorRef.current?.setLeftNodes(nodes)
  }

  const setRightNodes = (nodes: Node[]) => {
    connectorRef.current?.setRightNodes(nodes)
  }

  const addConnection = (connection: Connection) => {
    connectorRef.current?.addConnection(connection)
  }

  const removeConnection = (connection: Connection) => {
    connectorRef.current?.removeConnection(connection)
  }

  const getConnections = (): Connection[] => {
    return connectorRef.current?.getConnections() ?? []
  }

  const clear = () => {
    connectorRef.current?.clear()
  }

  const redrawLines = () => {
    connectorRef.current?.redrawLines()
  }

  const setConnectionMode = (mode: ConnectionMode) => {
    connectorRef.current?.setConnectionMode(mode)
  }

  return {
    setLeftNodes,
    setRightNodes,
    addConnection,
    removeConnection,
    getConnections,
    clear,
    redrawLines,
    setConnectionMode,
  }
}
