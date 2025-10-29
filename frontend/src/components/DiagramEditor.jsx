import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useMutation } from 'react-query'
import { diagramsAPI } from '../api'
import { Lock, Save, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import ShapeNode from './nodes/ShapeNode'

const DiagramEditor = ({ diagram, diagramType, isLocked, lockUser }) => {
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
        setEdges(content.edges || [])
      } catch (error) {
        console.error('Error parsing diagram content:', error)
        setNodes([])
        setEdges([])
      }
    } else {
      setNodes([])
      setEdges([])
    }
  }, [diagram])

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
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
