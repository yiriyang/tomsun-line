import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useLineConnector } from './useLineConnector'
import type { Node, Connection, LineOptions, ConnectionMode } from '../../core/types'

export interface LineConnectorHandle {
  setLeftNodes: (nodes: Node[]) => void
  setRightNodes: (nodes: Node[]) => void
  addConnection: (connection: Connection) => void
  removeConnection: (connection: Connection) => void
  getConnections: () => Connection[]
  clear: () => void
  redrawLines: () => void
  setConnectionMode: (mode: ConnectionMode) => void
}

export interface LineConnectorProps {
  leftNodes: Node[]
  rightNodes: Node[]
  options?: Partial<LineOptions>
  onConnectionAdded?: (connection: Connection) => void
  onConnectionRemoved?: (connection: Connection) => void
  children?: React.ReactNode
}

export const LineConnector = forwardRef<LineConnectorHandle, LineConnectorProps>(
  (
    {
      leftNodes,
      rightNodes,
      options = {},
      onConnectionAdded,
      onConnectionRemoved,
      children
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const combinedOptions = {
      ...options,
      onConnectionAdded,
      onConnectionRemoved
    }

    const connector = useLineConnector(containerRef, combinedOptions)

    useImperativeHandle(
      ref,
      () => ({
        setLeftNodes: connector.setLeftNodes,
        setRightNodes: connector.setRightNodes,
        addConnection: connector.addConnection,
        removeConnection: connector.removeConnection,
        getConnections: connector.getConnections,
        clear: connector.clear,
        redrawLines: connector.redrawLines,
        setConnectionMode: connector.setConnectionMode
      }),
      [connector]
    )

    useEffect(() => {
      connector.setLeftNodes(leftNodes)
    }, [leftNodes, connector.setLeftNodes])

    useEffect(() => {
      connector.setRightNodes(rightNodes)
    }, [rightNodes, connector.setRightNodes])

    return (
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    )
  }
)

LineConnector.displayName = 'LineConnector'

export { useLineConnector }
