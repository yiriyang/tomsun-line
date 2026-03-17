import React, { useState, useEffect, useRef } from 'react';
import { LineConnector } from 'tomsun-line/adapters/React';
import type { LineConnectorHandle } from 'tomsun-line/adapters/React';
import { LineStyle, ConnectionMode } from 'tomsun-line';
import type { Node, Connection } from 'tomsun-line';

const App: React.FC = () => {
  const connectorRef = useRef<LineConnectorHandle>(null);

  const [leftNodes, setLeftNodes] = useState<Node[]>([
    { id: '1', label: '用户登录' },
    { id: '2', label: '注册账号' },
    { id: '3', label: '找回密码' },
    { id: '4', label: '个人中心' }
  ]);

  const [rightNodes, setRightNodes] = useState<Node[]>([
    { id: '5', label: '首页' },
    { id: '6', label: '产品页' },
    { id: '7', label: '关于我们' },
    { id: '8', label: '联系客服' }
  ]);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [lineStyle, setLineStyle] = useState<LineStyle>(LineStyle.Bezier);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(ConnectionMode.Drag);

  const handleConnectionAdded = (connection: Connection) => {
    setConnections(prev => [...prev, connection]);
  };

  const handleConnectionRemoved = (connection: Connection) => {
    setConnections(prev =>
      prev.filter(
        c =>
          !(
            (c.fromNodeId === connection.fromNodeId && c.toNodeId === connection.toNodeId) ||
            (c.fromNodeId === connection.toNodeId && c.toNodeId === connection.fromNodeId)
          )
      )
    );
  };

  const removeConnection = (connection: Connection) => {
    connectorRef.current?.removeConnection(connection);
  };

  const clearConnections = () => {
    connectorRef.current?.clear();
  };

  const toggleLineStyle = () => {
    setLineStyle(prev =>
      prev === LineStyle.Bezier ? LineStyle.Straight : LineStyle.Bezier
    );
  };

  const toggleConnectionMode = () => {
    const newMode = connectionMode === ConnectionMode.Drag ? ConnectionMode.Click : ConnectionMode.Drag;
    setConnectionMode(newMode);
    connectorRef.current?.setConnectionMode(newMode);
  };

  const getNodeLabel = (nodeId: string): string => {
    const leftNode = leftNodes.find(n => n.id === nodeId);
    if (leftNode) return leftNode.label;
    const rightNode = rightNodes.find(n => n.id === nodeId);
    return rightNode?.label || nodeId;
  };

  return (
    <div className="app">
      <div className="header">
        <h1>TomSun Line - React Demo</h1>
        <p>{connectionMode === ConnectionMode.Drag 
          ? '拖拽节点右侧的圆点连接到另一侧的节点' 
          : '点击节点连接点，先点击左侧再点击右侧来创建连接'}</p>
      </div>

      <div className="controls">
        <button className="control-btn" onClick={toggleConnectionMode}>
          切换连接模式: {connectionMode === ConnectionMode.Drag ? '拖拽模式' : '点击模式'}
        </button>
        <button className="control-btn" onClick={toggleLineStyle}>
          切换线条样式: {lineStyle === LineStyle.Bezier ? '贝塞尔曲线' : '直线'}
        </button>
        <button className="control-btn secondary" onClick={clearConnections}>
          清空连接
        </button>
      </div>

      <LineConnector
        ref={connectorRef}
        leftNodes={leftNodes}
        rightNodes={rightNodes}
        onConnectionAdded={handleConnectionAdded}
        onConnectionRemoved={handleConnectionRemoved}
        options={{ lineStyle, connectionMode }}
      >
        <div className="connector-container">
          <div className="column">
            <div className="column-title">左侧功能</div>
            {leftNodes.map(node => (
              <div key={node.id} data-line-node-id={node.id} className="node-item">
                {node.label}
              </div>
            ))}
          </div>
          <div className="column">
            <div className="column-title">右侧页面</div>
            {rightNodes.map(node => (
              <div key={node.id} data-line-node-id={node.id} className="node-item">
                {node.label}
              </div>
            ))}
          </div>
        </div>
      </LineConnector>

      <div className="connections-panel">
        <div className="connections-title">当前连接 ({connections.length})</div>
        {connections.length === 0 ? (
          <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            暂无连接，请{connectionMode === ConnectionMode.Drag ? '拖拽' : '点击'}节点连接点来创建连接
          </div>
        ) : (
          connections.map((conn, index) => (
            <div key={index} className="connection-item">
              <span>
                {getNodeLabel(conn.fromNodeId)} → {getNodeLabel(conn.toNodeId)}
              </span>
              <button className="delete-btn" onClick={() => removeConnection(conn)}>
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
