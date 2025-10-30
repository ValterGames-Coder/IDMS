import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useMutation } from 'react-query'
import { diagramsAPI } from '../api'
import { Lock, Save, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import ShapeNode from './nodes/ShapeNode'

const DiagramEditor = ({ diagram, diagramType, isLocked, lockUser, connectionType = 'sequence-flow' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isSaving, setIsSaving] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  const nodeTypes = useMemo(
    () => ({
      shape: ShapeNode,
    }),
    []
  )

  const getEdgeConfig = useCallback((flowType) => {
    switch (flowType) {
      case 'default-flow':
        return {
          style: { stroke: '#1f2937', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#1f2937' },
          label: 'default',
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#f8fafc', color: '#1f2937' },
        }
      case 'conditional-flow':
        return {
          style: { stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '6 4' },
          markerStart: { type: MarkerType.Diamond, color: '#2563eb' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' },
          label: 'condition',
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#1d4ed8', color: '#ffffff' },
        }
      case 'message-flow':
        return {
          style: { stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '8 4' },
          markerStart: { type: MarkerType.Circle, color: '#0ea5e9' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' },
          animated: true,
        }
      case 'association':
        return {
          style: { stroke: '#6b7280', strokeWidth: 1.5, strokeDasharray: '4 4' },
          type: 'straight',
        }
      case 'data-association':
        return {
          style: { stroke: '#047857', strokeWidth: 1.5, strokeDasharray: '4 4' },
          type: 'straight',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#047857' },
        }
      case 'compensation-flow':
        return {
          style: { stroke: '#9333ea', strokeWidth: 2, strokeDasharray: '3 3' },
          markerEnd: { type: MarkerType.Arrow, color: '#9333ea' },
        }
      case 'sequence-flow':
      default:
        return {
          style: { stroke: '#111827', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#111827' },
        }
    }
  }, [])

  const applyEdgeVisuals = useCallback(
    (edge) => {
      const flowType = edge?.data?.flowType || 'sequence-flow'
      const config = getEdgeConfig(flowType)
      const mergedData = {
        ...(edge.data || {}),
        flowType,
      }

      const mergedEdge = {
        ...edge,
        data: mergedData,
        style: { ...(edge.style || {}), ...(config.style || {}) },
        markerStart: config.markerStart || edge.markerStart,
        markerEnd: config.markerEnd || edge.markerEnd,
        type: config.type || edge.type,
        animated: typeof config.animated === 'boolean' ? config.animated : edge.animated,
      }

      if (config.label && !edge.label) {
        mergedEdge.label = config.label
        mergedEdge.labelBgPadding = config.labelBgPadding
        mergedEdge.labelBgBorderRadius = config.labelBgBorderRadius
        mergedEdge.labelBgStyle = config.labelBgStyle
      }

      return mergedEdge
    },
    [getEdgeConfig]
  )

  // Update diagram mutation
  const updateDiagramMutation = useMutation(
    (data) => diagramsAPI.updateDiagram(diagram.id, data),
    {
      onSuccess: () => {
        toast.success('Diagram saved successfully!')
        setIsSaving(false)
      },
      onError: (error) => {
        toast.error('Failed to save diagram')
        setIsSaving(false)
      },
    }
  )

  // Load diagram content when diagram changes
  useEffect(() => {
    if (diagram?.content) {
      try {
        const content = JSON.parse(diagram.content)
        setNodes(content.nodes || [])
        const enrichedEdges = (content.edges || []).map((edge) => applyEdgeVisuals(edge))
        setEdges(enrichedEdges)
      } catch (error) {
        console.error('Error parsing diagram content:', error)
        setNodes([])
        setEdges([])
      }
    } else {
      setNodes([])
      setEdges([])
    }
  }, [diagram, applyEdgeVisuals, setEdges])

  // Auto-save functionality
  useEffect(() => {
    if (diagram && !isSaving) {
      const timer = setTimeout(() => {
        handleSave()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer)
    }
  }, [nodes, edges, diagram])

  const onConnect = useCallback(
    (params) => {
      if (isLocked) return

      setEdges((eds) => {
        const config = getEdgeConfig(connectionType)
        const mergedParams = {
          ...params,
          ...config,
          data: {
            ...(params.data || {}),
            flowType: connectionType,
          },
        }

        const updated = addEdge(mergedParams, eds)
        return updated.map((edge) => applyEdgeVisuals(edge))
      })
    },
    [applyEdgeVisuals, connectionType, getEdgeConfig, isLocked]
  )

  const handleNodeDoubleClick = useCallback(
    (event, node) => {
      event.preventDefault()
      if (isLocked) return

      const currentLabel = node?.data?.label ?? ''
      const newLabel = window.prompt('Введите новое название элемента', currentLabel)
      if (newLabel === null) {
        return
      }

      const trimmedLabel = newLabel.trim()
      if (!trimmedLabel || trimmedLabel === currentLabel) {
        return
      }

      setNodes((existingNodes) =>
        existingNodes.map((existingNode) =>
          existingNode.id === node.id
            ? {
                ...existingNode,
                data: {
                  ...existingNode.data,
                  label: trimmedLabel,
                },
              }
            : existingNode
        )
      )
    },
    [isLocked, setNodes]
  )

  const handleSave = useCallback(() => {
    if (!diagram || isLocked) return

    setIsSaving(true)
    const content = JSON.stringify({ nodes, edges })
    updateDiagramMutation.mutate({ content })
  }, [diagram, nodes, edges, isLocked, updateDiagramMutation])

  const handleExport = (format) => {
    // This would implement actual export functionality
    toast.info(`Export to ${format.toUpperCase()} feature coming soon!`)
  }

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      if (isLocked) {
        return
      }

      const transferData = event.dataTransfer.getData('application/reactflow')
      if (!transferData) {
        return
      }

      let parsedData
      try {
        parsedData = JSON.parse(transferData)
      } catch (error) {
        console.error('Failed to parse dropped element:', error)
        return
      }

      const reactFlowBounds = event.currentTarget.getBoundingClientRect()

      const position = reactFlowInstance
        ? reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          })
        : {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          }

      const nodeConfig = parsedData.nodeConfig || {}
      const label = nodeConfig.label || parsedData.name || 'Element'
      const nodeType = nodeConfig.type || 'shape'

      const newNode = {
        id: `${parsedData.id || 'node'}-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          ...nodeConfig,
          label,
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [isLocked, reactFlowInstance, setNodes]
  )

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = isLocked ? 'none' : 'move'
    },
    [isLocked]
  )

  const handleInit = useCallback((instance) => {
    setReactFlowInstance(instance)
  }, [])

  const getDiagramTitle = () => {
    switch (diagramType) {
      case 'bpmn':
        return 'Business Process Model and Notation'
      case 'erd':
        return 'Entity Relationship Diagram'
      case 'dfd':
        return 'Data Flow Diagram'
      default:
        return 'Diagram Editor'
    }
  }

  // ReactFlow component with useReactFlow hook
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900">
            {diagram?.name || 'Untitled Diagram'}
          </h2>
          <span className="text-sm text-gray-500">
            {getDiagramTitle()}
          </span>
          {isLocked && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <Lock className="h-4 w-4" />
              <span>Locked by {lockUser}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={isLocked || isSaving}
            className="btn btn-primary btn-sm"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <div className="relative group">
            <button className="btn btn-secondary btn-sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="py-1">
                <button
                  onClick={() => handleExport('png')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as PNG
                </button>
                <button
                  onClick={() => handleExport('svg')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagram Canvas */}
      <div className="flex-1">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={handleNodeDoubleClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={handleInit}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-t text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{nodes.length} nodes</span>
          <span>{edges.length} connections</span>
        </div>
        <div>
          {isSaving && <span className="text-blue-600">Saving...</span>}
        </div>
      </div>
    </div>
  )
}

export default DiagramEditor
