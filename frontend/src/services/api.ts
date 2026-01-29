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
  transmission: FeatureCollection;
  distribution: FeatureCollection;
  transformers: FeatureCollection;
  stats: {
    transmission_miles: number;
    distribution_miles: number;
    transformer_count: number;
    highest_voltage: number | null;
    lowest_voltage: number | null;
  };
}> => {
  const response = await api.get('/api/op/power', {
    params: { bbox },
  });
  // Map backend response to frontend expected format
  const data = response.data;
  return {
    transmission: data.transmission || data.geojson || { type: 'FeatureCollection', features: [] },
    distribution: data.distribution || { type: 'FeatureCollection', features: [] },
    transformers: data.transformers || { type: 'FeatureCollection', features: [] },
    stats: {
      transmission_miles: data.stats?.transmission_miles || 0,
      distribution_miles: data.stats?.distribution_miles || 0,
      transformer_count: data.stats?.transformer_count || data.stats?.substation_count || 0,
      highest_voltage: data.stats?.highest_voltage || null,
      lowest_voltage: data.stats?.lowest_voltage || null,
    }
  };
};

export default api;
