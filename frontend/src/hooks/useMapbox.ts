/**
 * Custom hook for Mapbox map initialization and management
 */

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Component, PathToSource } from '../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface UseMapboxOptions {
  initialCenter?: [number, number];
  initialZoom?: number;
}

export const useMapbox = (options: UseMapboxOptions = {}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { initialCenter = [-122.4, 37.8], initialZoom = 10 } = options;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check for Mapbox token
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
      console.error('❌ Mapbox token is missing or not set!');
      console.error('Please create .env file in frontend folder with:');
      console.error('VITE_MAPBOX_TOKEN=your_token_here');
      console.error('Current token value:', MAPBOX_TOKEN);
      return;
    }

    console.log('✅ Mapbox token loaded:', MAPBOX_TOKEN.substring(0, 20) + '...');
    
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      console.log('Creating Mapbox map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: initialCenter,
        zoom: initialZoom,
      });

      map.current.on('load', () => {
        console.log('✅ Map loaded successfully!');
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('❌ Mapbox error:', e);
      });

    } catch (error) {
      console.error('❌ Failed to create map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialCenter, initialZoom]);

  const addComponentMarker = (component: Component, onClick?: () => void) => {
    if (!map.current || !mapLoaded) return null;

    const el = document.createElement('div');
    el.className = 'component-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = getComponentColor(component.type);
    el.style.border = '2px solid white';
    el.style.cursor = 'pointer';
    el.title = component.name;

    const marker = new mapboxgl.Marker(el)
      .setLngLat([component.longitude, component.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${component.name}</strong><br/>${component.type}`
        )
      )
      .addTo(map.current);

    if (onClick) {
      el.addEventListener('click', onClick);
    }

    return marker;
  };

  const addPathLine = (path: PathToSource) => {
    if (!map.current || !mapLoaded || !path.path.length) return null;

    const coordinates = path.path.map((node) => [node.longitude, node.latitude] as [number, number]);

    if (map.current.getSource('path-line')) {
      (map.current.getSource('path-line') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      });
    } else {
      map.current.addLayer({
        id: 'path-line',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FF6B6B',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });
    }

    // Fit map to path bounds
    if (coordinates.length > 0) {
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const clearPath = () => {
    if (!map.current || !mapLoaded) return;
    if (map.current.getLayer('path-line')) {
      map.current.removeLayer('path-line');
    }
    if (map.current.getSource('path-line')) {
      map.current.removeSource('path-line');
    }
  };

  return {
    mapContainer,
    map: map.current,
    mapLoaded,
    addComponentMarker,
    addPathLine,
    clearPath,
  };
};

/**
 * Get color for component type
 */
function getComponentColor(type: string): string {
  const colors: Record<string, string> = {
    PowerGeneration: '#FF6B6B',
    StepUpSubstation: '#4ECDC4',
    TransmissionLine: '#FFE66D',
    TransmissionSubstation: '#95E1D3',
    DistributionSubstation: '#A8E6CF',
    DistributionLine: '#FFD93D',
    LocalTransformer: '#6BCB77',
    ServiceDrop: '#4D96FF',
    Building: '#9B59B6',
  };
  return colors[type] || '#95A5A6';
}
