/**
 * API service for communicating with the backend
 * Updated for Overland Park power infrastructure endpoints
 */

import axios from 'axios';
import type { FeatureCollection } from 'geojson';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Health check endpoint
 */
export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await api.get('/health');
  return response.data;
};

/**
 * Get Overland Park boundary
 */
export const getBoundary = async (): Promise<FeatureCollection> => {
  const response = await api.get<FeatureCollection>('/api/op/boundary');
  return response.data;
};

/**
 * Get power infrastructure for bounding box
 */
export const getPowerInfrastructure = async (
  bbox: string
): Promise<{
  geojson: FeatureCollection;
  stats: {
    transmission_miles: number;
    distribution_miles: number;
    substation_count: number;
  };
}> => {
  const response = await api.get('/api/op/power', {
    params: { bbox },
  });
  return response.data;
};

export default api;
