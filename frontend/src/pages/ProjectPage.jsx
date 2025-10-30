import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { projectsAPI, diagramsAPI } from '../api'
import Layout from '../components/Layout'
import DiagramEditor from '../components/DiagramEditor'
import DiagramTree from '../components/DiagramTree'
import DiagramPalette from '../components/DiagramPalette'
import { ArrowLeft, Plus, FileText, Lock, Unlock } from 'lucide-react'
import toast from 'react-hot-toast'

const ProjectPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedDiagram, setSelectedDiagram] = useState(null)
  const [selectedDiagramType, setSelectedDiagramType] = useState('bpmn')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDiagramName, setNewDiagramName] = useState('')
  const [diagramLock, setDiagramLock] = useState(null)
  const [connectionType, setConnectionType] = useState('sequence-flow')

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', projectId],
    () => projectsAPI.getProject(projectId)
  )

  // Fetch diagrams
  const { data: diagrams = [], isLoading: diagramsLoading } = useQuery(
    ['diagrams', projectId],
    () => diagramsAPI.getDiagrams(projectId)
  )

  // Create diagram mutation
  const createDiagramMutation = useMutation(
    (data) => diagramsAPI.createDiagram(projectId, data),
    {
      onSuccess: (newDiagram) => {
        queryClient.invalidateQueries(['diagrams', projectId])
        setSelectedDiagram(newDiagram)
        setShowCreateModal(false)
        setNewDiagramName('')
        toast.success('Diagram created successfully!')
      },
      onError: (error) => {
        const errorDetail = error.response?.data?.detail
        let errorMessage = 'Failed to create diagram'
        
        if (typeof errorDetail === 'string') {
          errorMessage = errorDetail
        } else if (Array.isArray(errorDetail)) {
          // Pydantic v2 validation errors format
          errorMessage = errorDetail.map(err => err.msg || err.message).join(', ')
        } else if (errorDetail && typeof errorDetail === 'object') {
          errorMessage = errorDetail.msg || errorDetail.message || 'Failed to create diagram'
        }
        
        toast.error(errorMessage)
      },
    }
  )

  // Lock diagram mutation
  const lockDiagramMutation = useMutation(diagramsAPI.lockDiagram, {
    onSuccess: (lockData) => {
      setDiagramLock(lockData)
      toast.success('Diagram locked successfully!')
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error('Diagram is already locked by another user')
      } else {
        toast.error('Failed to lock diagram')
      }
    },
  })

  // Unlock diagram mutation
  const unlockDiagramMutation = useMutation(diagramsAPI.unlockDiagram, {
    onSuccess: () => {
      setDiagramLock(null)
      toast.success('Diagram unlocked successfully!')
    },
    onError: (error) => {
      toast.error('Failed to unlock diagram')
    },
  })

  // Check for existing lock when diagram is selected
  useEffect(() => {
    if (selectedDiagram) {
      diagramsAPI.getDiagramLock(selectedDiagram.id)
        .then(setDiagramLock)
        .catch(() => setDiagramLock(null))
    }
  }, [selectedDiagram])

  useEffect(() => {
    if (selectedDiagram?.diagram_type !== 'bpmn') {
      setConnectionType('sequence-flow')
    }
  }, [selectedDiagram?.diagram_type])

  const handleCreateDiagram = () => {
    if (!newDiagramName.trim()) {
      toast.error('Please enter a diagram name')
      return
    }

    createDiagramMutation.mutate({
      name: newDiagramName,
      diagram_type: selectedDiagramType,
    })
  }

  const handleLockDiagram = () => {
    if (selectedDiagram) {
      lockDiagramMutation.mutate(selectedDiagram.id)
    }
  }

  const handleUnlockDiagram = () => {
    if (selectedDiagram) {
      unlockDiagramMutation.mutate(selectedDiagram.id)
    }
  }

  if (projectLoading || diagramsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {project?.name}
            </h1>
            <p className="text-sm text-gray-500">
              {diagrams.length} diagram{diagrams.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedDiagram && (
            <>
              {diagramLock ? (
                <button
                  onClick={handleUnlockDiagram}
                  className="btn btn-secondary btn-sm"
                  disabled={unlockDiagramMutation.isLoading}
                >
                  <Unlock className="h-4 w-4 mr-1" />
                  Unlock
                </button>
              ) : (
                <button
                  onClick={handleLockDiagram}
                  className="btn btn-primary btn-sm"
                  disabled={lockDiagramMutation.isLoading}
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Lock
                </button>
              )}
            </>
          )}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Diagram
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Diagram Tree */}
        <div className="w-80 bg-white border-r flex flex-col flex-shrink-0">
          <div className="p-4 border-b flex-shrink-0">
            <h2 className="text-lg font-medium text-gray-900">Diagrams</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DiagramTree
              diagrams={diagrams}
              selectedDiagram={selectedDiagram}
              onSelectDiagram={setSelectedDiagram}
            />
          </div>
        </div>

        {/* Center Panel - Diagram Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedDiagram ? (
            <DiagramEditor
              diagram={selectedDiagram}
              diagramType={selectedDiagram.diagram_type}
              isLocked={!!diagramLock}
              lockUser={diagramLock?.user?.username}
              connectionType={connectionType}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No diagram selected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a diagram from the left panel or create a new one.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Palette */}
        <div className="w-80 bg-white border-l flex-shrink-0 overflow-hidden">
          <DiagramPalette
            diagramType={selectedDiagram?.diagram_type || 'bpmn'}
            selectedConnectionType={connectionType}
            onConnectionTypeChange={setConnectionType}
          />
        </div>
      </div>

      {/* Create Diagram Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Diagram
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Diagram Name
                  </label>
                  <input
                    type="text"
                    value={newDiagramName}
                    onChange={(e) => setNewDiagramName(e.target.value)}
                    className="mt-1 input"
                    placeholder="Enter diagram name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Diagram Type
                  </label>
                  <select
                    value={selectedDiagramType}
                    onChange={(e) => setSelectedDiagramType(e.target.value)}
                    className="mt-1 input"
                  >
                    <option value="bpmn">BPMN</option>
                    <option value="erd">ERD</option>
                    <option value="dfd">DFD</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewDiagramName('')
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateDiagram}
                    disabled={createDiagramMutation.isLoading}
                    className="btn btn-primary"
                  >
                    {createDiagramMutation.isLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectPage

