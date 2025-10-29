import React, { useMemo } from 'react'
import { ArrowRight, Circle, Database, Square, Triangle } from 'lucide-react'

const DiagramPalette = ({ diagramType }) => {
  const elements = useMemo(() => {
    switch (diagramType) {
      case 'bpmn':
        return [
          {
            id: 'start-event',
            name: 'Start Event',
            icon: Circle,
            previewColor: '#22c55e',
            nodeConfig: {
              shape: 'circle',
              background: '#22c55e',
              borderColor: '#15803d',
              textColor: '#052e16',
              width: 80,
              height: 80,
            },
          },
          {
            id: 'end-event',
            name: 'End Event',
            icon: Circle,
            previewColor: '#ef4444',
            nodeConfig: {
              shape: 'circle',
              background: '#ef4444',
              borderColor: '#b91c1c',
              textColor: '#450a0a',
              width: 80,
              height: 80,
            },
          },
          {
            id: 'task',
            name: 'Task',
            icon: Square,
            previewColor: '#3b82f6',
            nodeConfig: {
              shape: 'rectangle',
              background: '#3b82f6',
              borderColor: '#1d4ed8',
              textColor: '#f8fafc',
              width: 180,
              height: 90,
              borderRadius: 12,
            },
          },
          {
            id: 'gateway',
            name: 'Gateway',
            icon: Triangle,
            previewColor: '#facc15',
            nodeConfig: {
              shape: 'diamond',
              background: '#facc15',
              borderColor: '#ca8a04',
              textColor: '#451a03',
              width: 110,
              height: 110,
            },
          },
          {
            id: 'sequence-flow',
            name: 'Sequence Flow',
            icon: ArrowRight,
            previewColor: '#6b7280',
            nodeConfig: {
              shape: 'parallelogram',
              background: '#6b7280',
              borderColor: '#374151',
              textColor: '#f9fafb',
              width: 200,
              height: 50,
            },
          },
        ]
      case 'erd':
        return [
          {
            id: 'entity',
            name: 'Entity',
            icon: Square,
            previewColor: '#0ea5e9',
            nodeConfig: {
              shape: 'entity',
              background: '#e0f2fe',
              borderColor: '#0284c7',
              textColor: '#0c4a6e',
              width: 220,
              height: 120,
            },
          },
          {
            id: 'attribute',
            name: 'Attribute',
            icon: Circle,
            previewColor: '#22c55e',
            nodeConfig: {
              shape: 'circle',
              background: '#bbf7d0',
              borderColor: '#15803d',
              textColor: '#14532d',
              width: 120,
              height: 120,
            },
          },
          {
            id: 'relationship',
            name: 'Relationship',
            icon: Triangle,
            previewColor: '#a855f7',
            nodeConfig: {
              shape: 'diamond',
              background: '#e9d5ff',
              borderColor: '#9333ea',
              textColor: '#581c87',
              width: 130,
              height: 130,
            },
          },
          {
            id: 'primary-key',
            name: 'Primary Key',
            icon: Circle,
            previewColor: '#f97316',
            nodeConfig: {
              shape: 'circle',
              background: '#fed7aa',
              borderColor: '#ea580c',
              textColor: '#7c2d12',
              width: 110,
              height: 110,
              decoration: 'underline',
            },
          },
          {
            id: 'foreign-key',
            name: 'Foreign Key',
            icon: Circle,
            previewColor: '#facc15',
            nodeConfig: {
              shape: 'circle',
              background: '#fef08a',
              borderColor: '#eab308',
              textColor: '#713f12',
              width: 110,
              height: 110,
              decoration: 'dashed',
            },
          },
        ]
      case 'dfd':
        return [
          {
            id: 'process',
            name: 'Process',
            icon: Circle,
            previewColor: '#2563eb',
            nodeConfig: {
              shape: 'circle',
              background: '#bfdbfe',
              borderColor: '#1d4ed8',
              textColor: '#1e3a8a',
              width: 130,
              height: 130,
            },
          },
          {
            id: 'data-store',
            name: 'Data Store',
            icon: Database,
            previewColor: '#14b8a6',
            nodeConfig: {
              shape: 'cylinder',
              background: '#ccfbf1',
              borderColor: '#0f766e',
              textColor: '#115e59',
              width: 180,
              height: 110,
            },
          },
          {
            id: 'external-entity',
            name: 'External Entity',
            icon: Square,
            previewColor: '#f472b6',
            nodeConfig: {
              shape: 'rectangle',
              background: '#fdf2f8',
              borderColor: '#db2777',
              textColor: '#831843',
              width: 200,
              height: 90,
            },
          },
          {
            id: 'data-flow',
            name: 'Data Flow',
            icon: ArrowRight,
            previewColor: '#4b5563',
            nodeConfig: {
              shape: 'parallelogram',
              background: '#d1d5db',
              borderColor: '#1f2937',
              textColor: '#111827',
              width: 220,
              height: 60,
            },
          },
        ]
      default:
        return []
    }
  }, [diagramType])

  const handleDragStart = (event, element) => {
    const payload = {
      id: element.id,
      name: element.name,
      nodeConfig: element.nodeConfig,
    }
    event.dataTransfer.setData('application/reactflow', JSON.stringify(payload))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">
          {diagramType.toUpperCase()} Elements
        </h2>
        <p className="text-sm text-gray-500">
          Drag elements to the canvas
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {elements.map((element) => {
            const IconComponent = element.icon
            return (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, element)}
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 cursor-move transition-colors"
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white"
                  style={{ backgroundColor: element.previewColor }}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {element.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-500">
          <p>💡 Tip: Drag elements to the canvas to add them to your diagram</p>
        </div>
      </div>
    </div>
  )
}


export default DiagramPalette
