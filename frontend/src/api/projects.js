import apiClient from './client'

export const projectsAPI = {
  getProjects: async () => {
    const response = await apiClient.get('/projects/')
    return response.data
  },

  getProject: async (projectId) => {
    const response = await apiClient.get(`/projects/${projectId}`)
    return response.data
  },

  createProject: async (projectData) => {
    const response = await apiClient.post('/projects/', projectData)
    return response.data
  },

  updateProject: async (projectId, projectData) => {
    const response = await apiClient.put(`/projects/${projectId}`, projectData)
    return response.data
  },

  deleteProject: async (projectId) => {
    const response = await apiClient.delete(`/projects/${projectId}`)
    return response.data
  },
}




