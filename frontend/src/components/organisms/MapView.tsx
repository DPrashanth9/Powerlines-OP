/**
 * MapView - Organism component
 * Main map component with Mapbox integration
 */

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../hooks/useMapbox';
import type { Component, PathToSource } from '../../types';

interface MapViewProps {
  components: Component[];
  selectedComponent: Component | null;
  path: PathToSource | null;
  onComponentClick?: (component: Component) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  components,
  selectedComponent,
  path,
  onComponentClick,
}) => {
  const { mapContainer, mapLoaded, addComponentMarker, addPathLine, clearPath } = useMapbox();
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Add component markers
  useEffect(() => {
    if (!mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    components.forEach((component) => {
      const marker = addComponentMarker(component, () => {
        onComponentClick?.(component);
      });
      if (marker) {
        markersRef.current.push(marker);
      }
    });
  }, [mapLoaded, components, addComponentMarker, onComponentClick]);

  // Add path line
  useEffect(() => {
    if (!mapLoaded) return;

    if (path && path.path.length > 0) {
      addPathLine(path);
    } else {
      clearPath();
    }
  }, [mapLoaded, path, addPathLine, clearPath]);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const hasToken = mapboxToken && mapboxToken !== 'your_mapbox_token_here';

  return (
    <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
      <div ref={mapContainer} className="w-full h-full" style={{ width: '100%', height: '100%', minHeight: '400px' }} />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6'
        }}>
          <div style={{ textAlign: 'center', color: '#4b5563' }}>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>Loading map...</div>
            {!hasToken && (
              <div style={{ fontSize: '12px', marginTop: '10px', color: '#dc2626' }}>
                ⚠️ Mapbox token not found. Check .env file and restart server
              </div>
            )}
            <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
              Open browser console (F12) for details
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
