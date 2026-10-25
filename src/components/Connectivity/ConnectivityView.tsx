import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  BatteryCharging,
  Radio,
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Inbox,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MessagePriority } from '../../types';

export const ConnectivityView: React.FC = () => {
  const {
    nodes,
    messages,
    toggleNodeConnection,
    queueMessageForNode,
    deliverQueuedMessages
  } = useApp();

  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || 'NODE-LORA-01');
  const [testPriority, setTestPriority] = useState<MessagePriority>('High Safety Alert');
  const [testPayload, setTestPayload] = useState<string>('');

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const nodeMessages = messages.filter(m => m.nodeId === selectedNodeId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPayload.trim()) return;

    queueMessageForNode(selectedNodeId, testPriority, testPayload);
    setTestPayload('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Online':
      case 'Reconnected':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Weak link':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  const getMessagePriorityBadge = (p: MessagePriority) => {
    switch (p) {
      case 'Critical Emergency':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'High Safety Alert':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Protocol Overview */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
            <Radio className="w-4 h-4" />
            <span>RESILIENT LORAWAN &amp; SATELLITE STORE-AND-FORWARD PROTOCOL</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Connectivity Resilience &amp; Mesh Gateway Telemetry
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl">
            Demonstrates network survivability during massive cellular tower congestion. When backhaul fails, messages queue safely in node local non-volatile memory and sync upon reconnect.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Mesh Network Health
          </span>
          <div className="font-mono text-xl font-bold text-emerald-400">
            {nodes.filter(n => n.connectivityStatus === 'Online' || n.connectivityStatus === 'Reconnected').length} / {nodes.length} Nodes Synchronized
          </div>
        </div>
      </div>

      {/* Simulator Guidance Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-xs flex items-center gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Interactive Demonstration:</strong> Toggle node connectivity below to simulate link disruption. Send emergency packets to observe store-and-forward queuing in real time.
        </span>
      </div>

      {/* Grid: Nodes Grid and Selected Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Node Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Field Monitoring Nodes &amp; LoRa Gateways
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodes.map(node => {
              const isOffline = node.connectivityStatus === 'Offline';
              const isSelected = node.id === selectedNodeId;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-400 shadow-xs ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {node.id}
                        </span>
                        <span>·</span>
                        <span className="text-[11px] text-slate-500">{node.type}</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 mt-0.5">{node.name}</h3>
                      <span className="text-[11px] text-slate-500">{node.zoneName}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getStatusBadge(
                        node.connectivityStatus
                      )}`}
                    >
                      {node.connectivityStatus}
                    </span>
                  </div>

                  {/* Telemetry info */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] font-mono text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Signal</span>
                      <span className="font-semibold text-slate-800">{node.signalStatus}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Battery</span>
                      <span className="font-semibold text-slate-800">{node.batteryPercent}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Queue</span>
                      <span
                        className={`font-semibold ${
                          node.pendingMessages > 0 ? 'text-amber-600 font-bold' : 'text-slate-800'
                        }`}
                      >
                        {node.pendingMessages} pkts
                      </span>
                    </div>
                  </div>

                  {/* Control Toggle */}
                  <div className="pt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Last Ping: {node.lastSeen}</span>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleNodeConnection(node.id);
                      }}
                      className={`px-3 py-1 rounded font-semibold text-xs transition-colors border ${
                        isOffline
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isOffline ? 'Restore Connection' : 'Disconnect Node'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Inspector & Message Dispatch Tester */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Node Packet Console
                </h3>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {selectedNode.id}
                </span>
              </div>

              {selectedNode.pendingMessages > 0 && selectedNode.connectivityStatus !== 'Offline' && (
                <button
                  onClick={() => deliverQueuedMessages(selectedNode.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded font-semibold"
                >
                  Flush Queue
                </button>
              )}
            </div>

            {/* Simulated Packet Dispatch Form */}
            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              <span className="font-semibold text-slate-700 block">
                Transmit Test Message to Node:
              </span>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Packet Priority</label>
                <select
                  value={testPriority}
                  onChange={e => setTestPriority(e.target.value as MessagePriority)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="Critical Emergency">Critical Emergency (Immediate Broadcast)</option>
                  <option value="High Safety Alert">High Safety Alert (Priority Buffer)</option>
                  <option value="Routine Status Update">Routine Status Update (Normal)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Payload Content</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Water station relief requested at Gate 4..."
                  value={testPayload}
                  onChange={e => setTestPayload(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Packet</span>
              </button>
            </form>

            {/* Store and Forward Queue Log */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="font-semibold text-xs text-slate-800 block">
                Packet Transmission History ({nodeMessages.length}):
              </span>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {nodeMessages.length === 0 ? (
                  <span className="text-slate-400 italic text-xs block py-2">
                    No packets recorded on this node.
                  </span>
                ) : (
                  nodeMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        msg.status === 'Queued'
                          ? 'bg-amber-50 border-amber-200 text-amber-950'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded border uppercase font-bold ${getMessagePriorityBadge(
                            msg.priority
                          )}`}
                        >
                          {msg.priority.replace('Routine Status Update', 'Routine')}
                        </span>
                        <span
                          className={`font-bold ${
                            msg.status === 'Queued' ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {msg.status === 'Queued' ? '⏳ Buffered on Node' : '✓ Delivered'}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{msg.payload}</p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Logged: {msg.timestamp}
                        {msg.deliveredAt && ` · Delivered: ${msg.deliveredAt}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
