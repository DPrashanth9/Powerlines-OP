/**
 * OverlandParkMap - Mapbox map component for Overland Park power infrastructure
 * Uses dark Mapbox style and renders boundary + power layers
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getBoundary, getPowerInfrastructure } from '../../services/api';
import type { FeatureCollection } from 'geojson';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const OVERLAND_PARK_CENTER: [number, number] = [-94.6708, 38.9822];
const INITIAL_ZOOM = 12.5; // Increased zoom to ensure bbox is within limits

interface OverlandParkMapProps {
  className?: string;
}

export const OverlandParkMap: React.FC<OverlandParkMapProps> = ({ className = '' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    transmission_miles: number;
    distribution_miles: number;
    substation_count: number;
  } | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const lastBbox = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // Layer visibility state
  const [showTransmission, setShowTransmission] = useState(true);
  const [showDistribution, setShowDistribution] = useState(true);
  const [showSubstations, setShowSubstations] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
      console.error('❌ Mapbox token is missing!');
      setError('Mapbox token not found. Check .env file.');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark style
      center: OVERLAND_PARK_CENTER,
      zoom: INITIAL_ZOOM,
    });

    map.current.on('load', () => {
      console.log('✅ Map loaded successfully!');
      setMapLoaded(true);
      loadBoundary();
    });

    map.current.on('error', (e) => {
      console.error('❌ Mapbox error:', e);
      setError('Map failed to load. Check console for details.');
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load boundary on map load
  const loadBoundary = useCallback(async () => {
    if (!map.current) return;

    try {
      const boundary = await getBoundary();
      
      // Add boundary source
      if (map.current.getSource('boundary')) {
        (map.current.getSource('boundary') as mapboxgl.GeoJSONSource).setData(boundary);
      } else {
        map.current.addSource('boundary', {
          type: 'geojson',
          data: boundary,
        });

        // Add boundary layer
        map.current.addLayer({
          id: 'boundary-line',
          type: 'line',
          source: 'boundary',
          paint: {
            'line-color': '#00ff00',
            'line-width': 3,
            'line-opacity': 0.8,
          },
        });
      }
    } catch (err: any) {
      console.error('Failed to load boundary:', err);
      setError(`Failed to load boundary: ${err.message}`);
    }
  }, []);

  // Load power infrastructure on map move (debounced)
  const loadPowerData = useCallback(async () => {
    if (!map.current || !mapLoaded || isLoadingRef.current) return;

    const bounds = map.current.getBounds();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    // Round bbox to 4 decimals to avoid unnecessary updates for tiny movements
    const roundedBbox = `${south.toFixed(4)},${west.toFixed(4)},${north.toFixed(4)},${east.toFixed(4)}`;
    
    // Skip if bbox hasn't changed significantly
    if (lastBbox.current === roundedBbox) {
      return;
    }

    // Better bbox size check using haversine for diagonal
    const centerLat = (north + south) / 2;
    const latDiff = north - south;
    const lonDiff = east - west;
    
    // More accurate diagonal calculation
    const latKm = latDiff * 111.0; // 1 degree lat ≈ 111 km
    const lonKm = lonDiff * 111.0 * Math.cos(centerLat * Math.PI / 180);
    const diagonalKm = Math.sqrt(latKm * latKm + lonKm * lonKm);

    // Only show error if bbox is significantly too large (with buffer)
    // Allow up to 80km to give more margin (backend allows 60km, but be lenient)
    if (diagonalKm > 80) {
      // Only set error if we don't already have data loaded (don't spam error)
      if (!map.current.getSource('power-data')) {
        setError('Zoom in to see power infrastructure (max 60km view)');
      }
      setLoading(false);
      return;
    }

    // If bbox is between 60-80km, still try to load (backend might accept it)
    // But don't show error if it fails

    // Clear error if bbox is valid
    setError(null);
    setLoading(true);
    isLoadingRef.current = true;
    lastBbox.current = roundedBbox;

    try {
      const bbox = `${south},${west},${north},${east}`;
      const result = await getPowerInfrastructure(bbox);

      // Create point features for line endpoints (markers at start/end of each line)
      const pointFeatures: any[] = [];
      
      result.geojson.features.forEach((feature: any) => {
        if (feature.geometry.type === 'LineString' && feature.geometry.coordinates.length > 0) {
          const coords = feature.geometry.coordinates;
          const powerType = feature.properties.power;
          
          // Add start point marker
          pointFeatures.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: coords[0],
            },
            properties: {
              ...feature.properties,
              point_type: 'line_endpoint',
              power: powerType,
            },
          });
          
          // Add end point marker (if different from start)
          if (coords.length > 1 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
            pointFeatures.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: coords[coords.length - 1],
              },
              properties: {
                ...feature.properties,
                point_type: 'line_endpoint',
                power: powerType,
              },
            });
          }
        } else if (feature.geometry.type === 'Point') {
          // Substations are already points, keep them
          pointFeatures.push(feature);
        }
      });

      // Combine line features and point features
      const combinedGeoJSON = {
        ...result.geojson,
        features: [
          ...result.geojson.features.filter((f: any) => f.geometry.type === 'LineString'),
          ...pointFeatures,
        ],
      };

      // Store current visibility states from React state (more reliable than reading from map)
      // This ensures we use the actual user's toggle state, not what might be on the map
      const transmissionVisible = showTransmission;
      const distributionVisible = showDistribution;
      const substationsVisible = showSubstations;

      // Update existing source instead of removing/re-adding (prevents flicker and disappearing)
      if (map.current.getSource('power-data')) {
        (map.current.getSource('power-data') as mapboxgl.GeoJSONSource).setData(combinedGeoJSON);
      } else {
        // Only add source if it doesn't exist
        map.current.addSource('power-data', {
          type: 'geojson',
          data: combinedGeoJSON,
        });
      }

      // Only add layers if they don't exist (prevents disappearing on zoom)
      if (!map.current.getLayer('transmission-lines')) {
        // Add transmission lines layer with initial visibility from state
        map.current.addLayer({
          id: 'transmission-lines',
          type: 'line',
          source: 'power-data',
          filter: ['==', ['get', 'power'], 'line'],
          paint: {
            'line-color': '#FFD700', // Yellow
            'line-width': 4,
            'line-opacity': 0.8,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': showTransmission ? 'visible' : 'none',
          },
        });
      }

      if (!map.current.getLayer('distribution-lines')) {
        // Add distribution lines layer with initial visibility from state
        map.current.addLayer({
          id: 'distribution-lines',
          type: 'line',
          source: 'power-data',
          filter: ['==', ['get', 'power'], 'minor_line'],
          paint: {
            'line-color': '#9370DB', // Purple
            'line-width': 2,
            'line-opacity': 0.7,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': showDistribution ? 'visible' : 'none',
          },
        });
      }

      // Add transmission line point markers (at line endpoints)
      if (!map.current.getLayer('transmission-points')) {
        map.current.addLayer({
          id: 'transmission-points',
          type: 'circle',
          source: 'power-data',
          filter: ['all', 
            ['==', ['get', 'power'], 'line'],
            ['has', 'point_type']
          ],
          paint: {
            'circle-color': '#FFD700', // Yellow
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 5,
              15, 8,
              20, 12
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
          layout: {
            'visibility': showTransmission ? 'visible' : 'none',
          },
        });
      }

      // Add distribution line point markers (at line endpoints)
      if (!map.current.getLayer('distribution-points')) {
        map.current.addLayer({
          id: 'distribution-points',
          type: 'circle',
          source: 'power-data',
          filter: ['all',
            ['==', ['get', 'power'], 'minor_line'],
            ['has', 'point_type']
          ],
          paint: {
            'circle-color': '#9370DB', // Purple
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 4,
              15, 6,
              20, 10
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9,
          },
          layout: {
            'visibility': showDistribution ? 'visible' : 'none',
          },
        });
      }

      if (!map.current.getLayer('substations')) {
        // Add substations layer (larger, more visible) with initial visibility from state
        map.current.addLayer({
          id: 'substations',
          type: 'circle',
          source: 'power-data',
          filter: ['==', ['get', 'power'], 'substation'],
          paint: {
            'circle-color': '#00ff00', // Green
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 7,
              15, 11,
              20, 16
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1.0,
          },
          layout: {
            'visibility': showSubstations ? 'visible' : 'none',
          },
        });
      }

      // Restore visibility states immediately after data update (preserve user's toggle choices)
      // Use requestAnimationFrame to ensure it happens after Mapbox renders
      requestAnimationFrame(() => {
        if (map.current) {
          if (map.current.getLayer('transmission-lines')) {
            map.current.setLayoutProperty('transmission-lines', 'visibility', transmissionVisible ? 'visible' : 'none');
          }
          if (map.current.getLayer('transmission-points')) {
            map.current.setLayoutProperty('transmission-points', 'visibility', transmissionVisible ? 'visible' : 'none');
          }
          if (map.current.getLayer('distribution-lines')) {
            map.current.setLayoutProperty('distribution-lines', 'visibility', distributionVisible ? 'visible' : 'none');
          }
          if (map.current.getLayer('distribution-points')) {
            map.current.setLayoutProperty('distribution-points', 'visibility', distributionVisible ? 'visible' : 'none');
          }
          if (map.current.getLayer('substations')) {
            map.current.setLayoutProperty('substations', 'visibility', substationsVisible ? 'visible' : 'none');
          }
        }
      });

      // Remove old click handlers before adding new ones (prevent duplicates)
      map.current.off('click', 'transmission-lines');
      map.current.off('click', 'distribution-lines');
      map.current.off('click', 'substations');
      map.current.off('click', 'transmission-points');
      map.current.off('click', 'distribution-points');
      
      // Add click handlers for lines
      map.current.on('click', 'transmission-lines', handleLineClick);
      map.current.on('click', 'distribution-lines', handleLineClick);
      
      // Add click handlers for points (markers)
      map.current.on('click', 'transmission-points', handleLineClick);
      map.current.on('click', 'distribution-points', handleLineClick);
      map.current.on('click', 'substations', handleSubstationClick);

      // Change cursor on hover (lines)
      map.current.on('mouseenter', 'transmission-lines', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'transmission-lines', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'distribution-lines', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'distribution-lines', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      
      // Change cursor on hover (points/markers)
      map.current.on('mouseenter', 'transmission-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'transmission-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'distribution-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'distribution-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'substations', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'substations', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      console.log('Power infrastructure loaded:', result.stats);
      setStats(result.stats);
      // Clear any previous errors on successful load
      setError(null);
    } catch (err: any) {
      console.error('Failed to load power data:', err);
      if (err.response?.status === 400) {
        // Only show error if bbox is actually too large
        const errorMsg = err.response.data.detail || 'Zoom in to see power infrastructure';
        // Don't show error if we already have data (just keep showing existing data)
        if (!map.current.getSource('power-data')) {
          setError(errorMsg);
        }
      } else {
        // Only show error for real failures, not just "no data" cases
        console.warn('Power data load warning:', err.message);
        // Don't set error for network issues if we have cached data
        if (!map.current.getSource('power-data')) {
          setError(`Failed to load power data: ${err.message}`);
        }
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [mapLoaded]);

  // Handle line click
  const handleLineClick = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!map.current || !e.features?.[0]) return;

    const feature = e.features[0];
    const props = feature.properties || {};
    const coordinates = (e.lngLat as any).toArray();

    // Fly to feature
    map.current.flyTo({
      center: coordinates,
      zoom: 15,
      speed: 1.2,
      curve: 1.6,
      essential: true,
    });

    // Create popup content
    const popupContent = `
      <div style="padding: 8px;">
        <strong>Power Line</strong><br/>
        ${props.name ? `Name: ${props.name}<br/>` : ''}
        Type: ${props.power === 'line' ? 'Transmission' : 'Distribution'}<br/>
        ${props.voltage ? `Voltage: ${props.voltage}<br/>` : ''}
        ${props.operator ? `Operator: ${props.operator}<br/>` : ''}
        ${props.length_miles ? `Length: ${props.length_miles} miles<br/>` : ''}
        OSM ID: ${props.osm_id || 'N/A'}
      </div>
    `;

    // Remove existing popup
    if (popup.current) {
      popup.current.remove();
    }

    // Create new popup
    popup.current = new mapboxgl.Popup({ offset: 25 })
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map.current);
  };

  // Handle substation click
  const handleSubstationClick = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!map.current || !e.features?.[0]) return;

    const feature = e.features[0];
    const props = feature.properties || {};
    const coordinates = (e.lngLat as any).toArray();

    // Fly to feature
    map.current.flyTo({
      center: coordinates,
      zoom: 15,
      speed: 1.2,
      curve: 1.6,
      essential: true,
    });

    // Create popup content
    const popupContent = `
      <div style="padding: 8px;">
        <strong>Substation</strong><br/>
        ${props.name ? `Name: ${props.name}<br/>` : ''}
        ${props.operator ? `Operator: ${props.operator}<br/>` : ''}
        ${props.voltage ? `Voltage: ${props.voltage}<br/>` : ''}
        ${props.substation ? `Type: ${props.substation}<br/>` : ''}
        OSM ID: ${props.osm_id || 'N/A'}
      </div>
    `;

    // Remove existing popup
    if (popup.current) {
      popup.current.remove();
    }

    // Create new popup
    popup.current = new mapboxgl.Popup({ offset: 25 })
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map.current);
  };

  // Debounced map move handler
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleMoveEnd = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      // Only trigger if not already loading
      if (!isLoadingRef.current) {
        debounceTimer.current = setTimeout(() => {
          loadPowerData();
        }, 1200); // 1.2 second debounce (reduce unnecessary calls)
      }
    };

    // Remove old handler before adding new one
    map.current.off('moveend', handleMoveEnd);
    map.current.on('moveend', handleMoveEnd);

    // Also listen to zoom events
    const handleZoomEnd = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      // Only trigger if not already loading
      if (!isLoadingRef.current) {
        debounceTimer.current = setTimeout(() => {
          loadPowerData();
        }, 1200);
      }
    };

    map.current.on('zoomend', handleZoomEnd);

    // Load initial data after a short delay
    const initialTimer = setTimeout(() => {
      if (!isLoadingRef.current) {
        loadPowerData();
      }
    }, 1000);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      clearTimeout(initialTimer);
      map.current?.off('moveend', handleMoveEnd);
      map.current?.off('zoomend', handleZoomEnd);
    };
  }, [mapLoaded, loadPowerData]);

  // Toggle layer visibility (lines and their markers together)
  // Use separate useEffects to ensure independence
  // Force immediate update when state changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const visibility = showTransmission ? 'visible' : 'none';
    
    // Update transmission lines
    if (map.current.getLayer('transmission-lines')) {
      try {
        map.current.setLayoutProperty('transmission-lines', 'visibility', visibility);
        console.log('Transmission lines visibility set to:', visibility);
      } catch (e) {
        console.error('Error setting transmission-lines visibility:', e);
      }
    }
    
    // Update transmission points
    if (map.current.getLayer('transmission-points')) {
      try {
        map.current.setLayoutProperty('transmission-points', 'visibility', visibility);
        console.log('Transmission points visibility set to:', visibility);
      } catch (e) {
        console.error('Error setting transmission-points visibility:', e);
      }
    }
  }, [showTransmission, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const visibility = showDistribution ? 'visible' : 'none';
    
    // Update distribution lines
    if (map.current.getLayer('distribution-lines')) {
      try {
        map.current.setLayoutProperty('distribution-lines', 'visibility', visibility);
        console.log('Distribution lines visibility set to:', visibility);
      } catch (e) {
        console.error('Error setting distribution-lines visibility:', e);
      }
    }
    
    // Update distribution points
    if (map.current.getLayer('distribution-points')) {
      try {
        map.current.setLayoutProperty('distribution-points', 'visibility', visibility);
        console.log('Distribution points visibility set to:', visibility);
      } catch (e) {
        console.error('Error setting distribution-points visibility:', e);
      }
    }
  }, [showDistribution, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const visibility = showSubstations ? 'visible' : 'none';
    
    // Update substations
    if (map.current.getLayer('substations')) {
      try {
        map.current.setLayoutProperty('substations', 'visibility', visibility);
        console.log('Substations visibility set to:', visibility);
      } catch (e) {
        console.error('Error setting substations visibility:', e);
      }
    }
  }, [showSubstations, mapLoaded]);

  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: '400px' }}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Layer controls - Dashboard */}
      {mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          minWidth: '220px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>
            Power Grid Dashboard
          </div>
          
          {/* Statistics */}
          {stats && (
            <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>Current View Stats:</div>
              <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: '#FFD700' }}>⚡</span> Transmission: <strong>{stats.transmission_miles.toFixed(1)}</strong> mi
              </div>
              <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: '#9370DB' }}>📡</span> Distribution: <strong>{stats.distribution_miles.toFixed(1)}</strong> mi
              </div>
              <div style={{ fontSize: '13px' }}>
                <span style={{ color: '#00ff00' }}>🔌</span> Substations: <strong>{stats.substation_count}</strong>
              </div>
            </div>
          )}

          {/* Layer Controls */}
          <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#e0e0e0' }}>
            Toggle Layers:
          </div>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={showTransmission}
              onChange={(e) => setShowTransmission(e.target.checked)}
              style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <span style={{ color: '#FFD700' }}>●</span>
            <span style={{ marginLeft: '4px' }}>Transmission Lines</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={showDistribution}
              onChange={(e) => setShowDistribution(e.target.checked)}
              style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <span style={{ color: '#9370DB' }}>●</span>
            <span style={{ marginLeft: '4px' }}>Distribution Lines</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={showSubstations}
              onChange={(e) => setShowSubstations(e.target.checked)}
              style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <span style={{ color: '#00ff00' }}>●</span>
            <span style={{ marginLeft: '4px' }}>Substations</span>
          </label>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <span>Loading power infrastructure...</span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Error message - only show if no data is loaded */}
      {error && !map.current?.getSource('power-data') && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: 'rgba(220, 38, 38, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          maxWidth: '400px',
          fontSize: '14px'
        }}>
          <div>{error}</div>
          <button
            onClick={() => setError(null)}
            style={{
              marginTop: '8px',
              fontSize: '12px',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Map not loaded overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900" style={{ zIndex: 1 }}>
          <div className="text-white text-center">
            <div className="text-lg mb-2">Loading map...</div>
            {!MAPBOX_TOKEN && (
              <div className="text-sm text-red-400">
                ⚠️ Mapbox token not found. Check .env file and restart server.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
