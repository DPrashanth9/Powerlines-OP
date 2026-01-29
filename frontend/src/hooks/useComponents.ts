/**
 * Custom hook for fetching components
 */

import { useState, useEffect } from 'react';
// These functions don't exist in api.ts - commenting out for now
// import { getComponents, getComponent, getPathToSource } from '../services/api';
import type { Component, PathToSource, ComponentType } from '../types';

export const useComponents = (componentType?: ComponentType) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement getComponents in api.ts
    // const fetchComponents = async () => {
    //   try {
    //     setLoading(true);
    //     setError(null);
    //     const data = await getComponents(componentType);
    //     setComponents(data);
    //   } catch (err: any) {
    //     setError(err.response?.data?.detail || 'Failed to fetch components');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchComponents();
    setLoading(false);
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

    // TODO: Implement getComponent in api.ts
    // const fetchComponent = async () => {
    //   try {
    //     setLoading(true);
    //     setError(null);
    //     const data = await getComponent(componentId);
    //     setComponent(data);
    //   } catch (err: any) {
    //     setError(err.response?.data?.detail || 'Failed to fetch component');
    //     setComponent(null);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    setLoading(false);

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

    // TODO: Implement getPathToSource in api.ts
    // const fetchPath = async () => {
    //   try {
    //     setLoading(true);
    //     setError(null);
    //     const data = await getPathToSource(componentId);
    //     setPath(data);
    //   } catch (err: any) {
    //     setError(err.response?.data?.detail || 'Failed to fetch path');
    //     setPath(null);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    setLoading(false);

    fetchPath();
  }, [componentId]);

  return { path, loading, error };
};
