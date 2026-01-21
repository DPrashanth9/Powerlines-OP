/**
 * API service for communicating with the backend
 */

import axios from 'axios';
import type { Component, PathToSource, ComponentType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get all components, optionally filtered by type
 */
export const getComponents = async (componentType?: ComponentType): Promise<Component[]> => {
  const params = componentType ? { component_type: componentType } : {};
  const response = await api.get<Component[]>('/api/components', { params });
  return response.data;
};

/**
 * Get a single component by ID
 */
export const getComponent = async (componentId: string): Promise<Component> => {
  const response = await api.get<Component>(`/api/components/${componentId}`);
  return response.data;
};

/**
 * Get the path from a component back to its power source
 */
export const getPathToSource = async (componentId: string): Promise<PathToSource> => {
  const response = await api.get<PathToSource>(`/api/components/${componentId}/path-to-source`);
  return response.data;
};

/**
 * Health check endpoint
 */
export const checkHealth = async (): Promise<{ status: string; neo4j_connected: boolean }> => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;
