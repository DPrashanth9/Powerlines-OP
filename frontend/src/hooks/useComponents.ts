/**
 * Custom hook for fetching components
 */

import { useState, useEffect } from 'react';
import { getComponents, getComponent, getPathToSource } from '../services/api';
import type { Component, PathToSource, ComponentType } from '../types';

export const useComponents = (componentType?: ComponentType) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getComponents(componentType);
        setComponents(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch components');
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [componentType]);

  return { components, loading, error };
};

export const useComponent = (componentId: string | null) => {
  const [component, setComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!componentId) {
      setComponent(null);
      return;
    }

    const fetchComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getComponent(componentId);
        setComponent(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch component');
        setComponent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComponent();
  }, [componentId]);

  return { component, loading, error };
};

export const usePathToSource = (componentId: string | null) => {
  const [path, setPath] = useState<PathToSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!componentId) {
      setPath(null);
      return;
    }

    const fetchPath = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPathToSource(componentId);
        setPath(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch path');
        setPath(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPath();
  }, [componentId]);

  return { path, loading, error };
};
