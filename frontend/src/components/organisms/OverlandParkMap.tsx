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
const OVERLAND_PARK_CENTER: [number, number] = [-94.6700, 38.9800];
const INITIAL_ZOOM = 12; // Default zoom for Overland Park

// Fixed bounding box for Overland Park area (covers entire city)
// Format: south, west, north, east
const OVERLAND_PARK_BBOX = '38.85,-94.80,39.10,-94.55'; // Large enough to cover all of Overland Park

interface OverlandParkMapProps {
  className?: string;
}

export const OverlandParkMap: React.FC<OverlandParkMapProps> = ({ className = '' }) => {
  console.log('🔵 OverlandParkMap component rendering...');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🔵 Component state:', { mapLoaded, loading, error, hasMapContainer: !!mapContainer.current });
  const [stats, setStats] = useState<{
    transmission_miles: number;
    distribution_miles: number;
    transformer_count: number;
    highest_voltage: number | null;
    lowest_voltage: number | null;
  } | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const lastBbox = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const dataLoadedRef = useRef(false); // Track if all data has been loaded once
  
  // Layer visibility state (MUST be declared before refs that use them)
  const [showTransmission, setShowTransmission] = useState(true);
  const [showDistribution, setShowDistribution] = useState(true);
  const [showTransformers, setShowTransformers] = useState(true);
  
  // 3D view state
  const [is3D, setIs3D] = useState(false);
  
  // Flow animation state
  const [showFlowAnimation, setShowFlowAnimation] = useState(true);
  
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const animationOffsetRef = useRef(0);
  const isDoubleClickPanningRef = useRef(false); // Shared flag to prevent rotation during double-click pan
  
  // Use refs to track current visibility states (always up-to-date)
  const transmissionVisibleRef = useRef(showTransmission);
  const distributionVisibleRef = useRef(showDistribution);
  const transformersVisibleRef = useRef(showTransformers);
  
  // Update refs when state changes
  useEffect(() => {
    transmissionVisibleRef.current = showTransmission;
  }, [showTransmission]);
  
  useEffect(() => {
    distributionVisibleRef.current = showDistribution;
  }, [showDistribution]);
  
  useEffect(() => {
    transformersVisibleRef.current = showTransformers;
  }, [showTransformers]);

  // Initialize map
  useEffect(() => {
    console.log('🔵 useEffect triggered - Initializing map');
    console.log('🔵 mapContainer.current:', mapContainer.current);
    console.log('🔵 map.current:', map.current);
    console.log('🔵 MAPBOX_TOKEN:', MAPBOX_TOKEN ? `${MAPBOX_TOKEN.substring(0, 20)}...` : 'MISSING');
    
    if (!mapContainer.current) {
      console.error('❌ mapContainer.current is null!');
      return;
    }
    
    if (map.current) {
      console.log('✅ Map already initialized, skipping');
      return;
    }

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here' || MAPBOX_TOKEN.trim() === '') {
      console.error('❌ Mapbox token is missing!');
      console.error('Token value:', MAPBOX_TOKEN ? 'Present but invalid' : 'Missing');
      setError('Mapbox token not found. Please create frontend/.env file with VITE_MAPBOX_TOKEN=your_token');
      return;
    }
    
    // Verify token format
    if (!MAPBOX_TOKEN.startsWith('pk.')) {
      console.error('❌ Invalid token format! Should start with "pk."');
      console.error('Token starts with:', MAPBOX_TOKEN.substring(0, 5));
      setError('Invalid Mapbox token format. Token should start with "pk."');
      return;
    }
    
    console.log('✅ Mapbox token found, initializing map...');
    console.log('🔵 Token length:', MAPBOX_TOKEN.length);
    setLoading(true);

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Set up periodic check to detect if map loads (runs every 1 second)
    checkIntervalRef.current = setInterval(() => {
      if (map.current && !mapLoaded) {
        const isActuallyLoaded = map.current.loaded() && map.current.isStyleLoaded();
        if (isActuallyLoaded) {
          console.log('✅ Map is actually loaded (detected by periodic check)');
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
          setMapLoaded(true);
          setLoading(false);
          setError(null);
          
          // Trigger the same initialization that would happen in 'load' event
          if (map.current) {
            // Add navigation controls if not already added
            if (!map.current.getControl('navigation')) {
              map.current.addControl(new mapboxgl.NavigationControl({
                showCompass: true,
                showZoom: true,
                visualizePitch: true
              }), 'top-right');
            }
            
            // Add terrain source if needed
            if (map.current.isStyleLoaded() && !map.current.getSource('mapbox-dem')) {
              try {
                map.current.addSource('mapbox-dem', {
                  type: 'raster-dem',
                  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                  tileSize: 512,
                  maxzoom: 14,
                });
                console.log('✅ Terrain source added');
              } catch (error) {
                console.warn('⚠️ Could not add terrain source:', error);
              }
            }
            
            loadBoundary();
          }
        }
      }
    }, 1000); // Check every 1 second

    // Set up timeout to detect if map doesn't load
    loadTimeoutRef.current = setTimeout(() => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current); // Stop periodic checks
      if (!mapLoaded && map.current) {
        // Final check if map is actually loaded but state wasn't updated
        const isActuallyLoaded = map.current.loaded() && map.current.isStyleLoaded();
        if (isActuallyLoaded) {
          console.log('✅ Map is actually loaded, just state was not updated');
          setMapLoaded(true);
          setLoading(false);
          setError(null);
          return;
        }
        console.error('❌ Map load timeout - map did not load within 20 seconds');
        console.error('❌ Map state:', {
          isStyleLoaded: map.current.isStyleLoaded(),
          loaded: map.current.loaded(),
          style: map.current.getStyle() ? 'Style exists' : 'No style',
          error: map.current.getStyle()?.sources ? 'Sources exist' : 'No sources'
        });
        setError('Map is taking too long to load. This might be a network issue or invalid Mapbox token. Check console (F12) for details.');
        setLoading(false);
      } else if (!map.current) {
        console.error('❌ Map instance was not created');
        setError('Failed to create map instance. Check console (F12) for details.');
        setLoading(false);
      }
    }, 20000); // 20 second timeout

    // Verify container has dimensions before creating map
    if (mapContainer.current) {
      const rect = mapContainer.current.getBoundingClientRect();
      console.log('🔵 Container dimensions:', { width: rect.width, height: rect.height });
      
      if (rect.width === 0 || rect.height === 0) {
        console.warn('⚠️ Container has zero dimensions! This might cause issues.');
      }
    }

    try {
      console.log('🔵 Creating Mapbox map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark style
        center: OVERLAND_PARK_CENTER,
        zoom: INITIAL_ZOOM,
        pitch: 0, // Initial pitch (0 = flat, 60 = tilted)
        bearing: 0, // Initial bearing (0 = north up, can rotate freely)
        touchPitch: true, // Enable two-finger pitch/rotation on touch devices
        touchZoomRotate: true, // Enable two-finger rotation on touch devices
        doubleClickZoom: false, // Disable default double-click zoom (we'll handle double-click + drag custom)
      });
      console.log('✅ Mapbox map instance created successfully');
    } catch (err: any) {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      console.error('❌ Error creating map:', err);
      console.error('❌ Error stack:', err.stack);
      setError(`Failed to create map: ${err.message || 'Unknown error'}. Check console (F12) for details.`);
      setLoading(false);
      return;
    }

    map.current.on('load', () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current); // Stop periodic checks
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      console.log('✅ Map loaded successfully!');
      console.log('✅ Map center:', map.current?.getCenter());
      console.log('✅ Map zoom:', map.current?.getZoom());
      console.log('✅ Map container size:', mapContainer.current ? {
        width: mapContainer.current.offsetWidth,
        height: mapContainer.current.offsetHeight
      } : 'null');
      setMapLoaded(true);
      setLoading(false);
      setError(null);
      
      // Add navigation controls (zoom in/out buttons + compass)
      // NavigationControl includes both zoom buttons and compass
      // Compass allows rotation in all directions:
      // - Click compass to reset bearing to north
      // - Drag compass needle to rotate map
      // - Left-click + drag to rotate (only in 3D mode)
      map.current?.addControl(new mapboxgl.NavigationControl({
        showCompass: true,  // Show compass for rotation (handles all directions)
        showZoom: true,     // Show zoom buttons
        visualizePitch: true  // Show pitch indicator in 3D mode
      }), 'top-right');
      
      // Add terrain source (always available, but only enabled when 3D is ON)
      // Wait for style to be fully loaded before adding source
      if (map.current && map.current.isStyleLoaded()) {
        try {
          if (!map.current.getSource('mapbox-dem')) {
            map.current.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            });
            console.log('✅ Terrain source added');
          }
        } catch (error) {
          console.warn('⚠️ Could not add terrain source:', error);
        }
      }
      
      loadBoundary();
    });

    map.current.on('error', (e: any) => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current); // Stop periodic checks
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      console.error('❌ Mapbox error:', e);
      console.error('❌ Error type:', e.type);
      console.error('❌ Error message:', e.error?.message || e.message);
      console.error('❌ Full error object:', e);
      console.error('❌ Error details:', {
        type: e.type,
        error: e.error,
        message: e.message,
        source: e.source,
        tile: e.tile
      });
      
      // Check for specific error types
      let errorMsg = e.error?.message || e.message || 'Unknown error';
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Invalid')) {
        errorMsg = 'Invalid Mapbox token. Please check your VITE_MAPBOX_TOKEN in .env file and restart the dev server.';
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
        errorMsg = 'Network error. Please check your internet connection and try again.';
      } else if (errorMsg.includes('timeout')) {
        errorMsg = 'Request timed out. Please check your internet connection.';
      }
      
      setError(`Map failed to load: ${errorMsg}. Check console (F12) for details.`);
      setMapLoaded(false);
      setLoading(false);
    });
    
    // Also listen for style errors
    map.current.on('style.load', () => {
      console.log('✅ Map style loaded');
    });
    
    map.current.on('style.error', (e: any) => {
      console.error('❌ Map style error:', e);
      setError(`Map style failed to load: ${e.error?.message || 'Unknown error'}. Check console (F12) for details.`);
      setMapLoaded(false);
    });

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current); // Clean up interval
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current); // Clean up timeout
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

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
            'line-color': '#38BDF8', // Soft cyan for city boundary
            'line-width': 3,
            'line-opacity': 0.9,
            'line-blur': 1, // Subtle glow
          },
        });
      }
    } catch (err: any) {
      console.error('Failed to load boundary:', err);
      setError(`Failed to load boundary: ${err.message}`);
    }
  }, []);

  // Load all power infrastructure data once (no clustering, no reload on zoom/pan)
  const loadPowerData = useCallback(async () => {
    if (!map.current || !mapLoaded) return;
    
    // Only load once - don't reload on zoom/pan
    if (dataLoadedRef.current) {
      console.log('⏸️ Skipping load: data already loaded');
      return;
    }
    
    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log('⏸️ Skipping load: already loading');
      return;
    }

    // Use fixed bounding box for Overland Park area
    const bbox = OVERLAND_PARK_BBOX;
    
    // Clear error
    setError(null);
    setLoading(true);
    isLoadingRef.current = true;

    try {
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
          // Transformers are already points, keep them
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

      // Use refs to get current visibility states (always up-to-date, even during async operations)
      const transmissionVisible = transmissionVisibleRef.current;
      const distributionVisible = distributionVisibleRef.current;
      const transformersVisible = transformersVisibleRef.current;
      
      console.log('Loading data with visibility states:', {
        transmission: transmissionVisible,
        distribution: distributionVisible,
        transformers: transformersVisible
      });

      // Update existing source instead of removing/re-adding (prevents flicker and disappearing)
      // IMPORTANT: Always update source data, even if source exists - this ensures data stays current
      if (map.current.getSource('power-data')) {
        // Update existing source - Mapbox will smoothly update layers
        try {
          (map.current.getSource('power-data') as mapboxgl.GeoJSONSource).setData(combinedGeoJSON);
          console.log('✅ Updated existing power-data source');
        } catch (e) {
          console.error('Error updating source:', e);
          // If update fails, try removing and re-adding
          map.current.removeSource('power-data');
          map.current.addSource('power-data', {
            type: 'geojson',
            data: combinedGeoJSON,
          });
          console.log('✅ Recreated power-data source');
        }
      } else {
        // Only add source if it doesn't exist
        map.current.addSource('power-data', {
          type: 'geojson',
          data: combinedGeoJSON,
        });
        console.log('✅ Created new power-data source');
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
            'line-color': '#FFD700', // Electric yellow for transmission lines
            'line-width': 4,
            'line-opacity': 0.9,
            'line-blur': 1.5, // Subtle glow effect
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': showTransmission ? 'visible' : 'none',
          },
        });
      }
      
      // Add flowing energy layer for transmission lines (overlay) - yellow/gold energy flow
      if (!map.current.getLayer('transmission-flow')) {
        map.current.addLayer({
          id: 'transmission-flow',
          type: 'line',
          source: 'power-data',
          filter: ['==', ['get', 'power'], 'line'],
          paint: {
            'line-color': '#FFFFFF', // White for energy flow
            'line-width': 4, // Thicker for transmission flow
            'line-opacity': 0.75,
            'line-blur': 1.5, // Subtle glow for energy effect
            // Smooth dashed pattern for continuous flow
            'line-dasharray': [20, 8], // Long dash, gap for smooth flow
            'line-dasharray-transition': { duration: 0 },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': showTransmission ? 'visible' : 'none',
          },
        });
      }
      
      // Add second flow layer for depth and smoother flow
      if (!map.current.getLayer('transmission-flow-2')) {
        map.current.addLayer({
          id: 'transmission-flow-2',
          type: 'line',
          source: 'power-data',
          filter: ['==', ['get', 'power'], 'line'],
          paint: {
            'line-color': '#FFFFFF', // White for energy flow depth
            'line-width': 3,
            'line-opacity': 0.5,
            'line-blur': 1, // Subtle glow
            'line-dasharray': [18, 10], // Offset pattern for depth
            'line-dasharray-transition': { duration: 0 },
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
            'line-color': '#A855F7', // Neon purple for distribution lines
            'line-width': 2,
            'line-opacity': 0.85,
            'line-blur': 1.5, // Subtle glow effect
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': showFlowAnimation && showDistribution ? 'visible' : 'none',
          },
        });
      }
      
      // Add flowing energy layer for distribution lines (overlay) - orange/red energy flow
      if (!map.current.getLayer('distribution-flow')) {
        map.current.addLayer({
          id: 'distribution-flow',
          type: 'line',
          source: 'power-data',
          filter: ['==', ['get', 'power'], 'minor_line'],
          paint: {
            'line-color': '#FFFFFF', // White for energy flow
            'line-width': 2.5, // Thinner for distribution flow
            'line-opacity': 0.7,
            'line-blur': 1, // Subtle glow
            // Smooth dashed pattern for continuous flow
            'line-dasharray': [15, 6], // Faster flow pattern
            'line-dasharray-transition': { duration: 0 },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': showFlowAnimation && showDistribution ? 'visible' : 'none',
          },
        });
      }
      
      // Add second flow layer for depth and smoother flow
      if (!map.current.getLayer('distribution-flow-2')) {
        map.current.addLayer({
          id: 'distribution-flow-2',
          type: 'line',
          source: 'power-data',
          filter: ['==', ['get', 'power'], 'minor_line'],
          paint: {
            'line-color': '#FFFFFF', // White for energy flow depth
            'line-width': 2,
            'line-opacity': 0.4,
            'line-blur': 0.8,
            'line-dasharray': [13, 8], // Offset pattern for depth
            'line-dasharray-transition': { duration: 0 },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': showFlowAnimation && showDistribution ? 'visible' : 'none',
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
            'circle-color': '#FFD700', // Yellow to match transmission lines
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
            'circle-color': '#A855F7', // Neon purple to match distribution lines
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
            'visibility': showFlowAnimation && showDistribution ? 'visible' : 'none',
          },
        });
      }

      if (!map.current.getLayer('transformers')) {
        // Add transformers layer (larger, more visible) with initial visibility from state
        map.current.addLayer({
          id: 'transformers',
          type: 'circle',
          source: 'power-data',
          filter: ['==', ['get', 'power'], 'transformer'],
          paint: {
            'circle-color': '#22C55E', // Teal green for transformers
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 5,
              15, 8,
              20, 12
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF',
            'circle-opacity': 0.95,
            'circle-blur': 0.5, // Subtle glow
          },
          layout: {
            'visibility': showTransformers ? 'visible' : 'none',
          },
        });
        console.log('✅ Transformers layer added');
      } else {
        console.log('✅ Transformers layer already exists');
      }

      // Restore visibility states AFTER source update and layers are created
      // Use setTimeout with multiple requestAnimationFrame to ensure Mapbox has fully rendered
      // IMPORTANT: Use refs to get current state (in case user toggled during data load)
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (map.current) {
              // Get current visibility from refs (always up-to-date)
              const currentTransmission = transmissionVisibleRef.current;
              const currentDistribution = distributionVisibleRef.current;
              const currentTransformers = transformersVisibleRef.current;
              
              // Restore transmission visibility (use current ref value)
              if (map.current.getLayer('transmission-lines')) {
                const vis = currentTransmission ? 'visible' : 'none';
                map.current.setLayoutProperty('transmission-lines', 'visibility', vis);
                console.log('🔄 DATA LOAD: Restored transmission-lines visibility:', vis);
              }
              if (map.current.getLayer('transmission-points')) {
                const vis = currentTransmission ? 'visible' : 'none';
                map.current.setLayoutProperty('transmission-points', 'visibility', vis);
                console.log('🔄 DATA LOAD: Restored transmission-points visibility:', vis);
              }
              
              // Restore distribution visibility (use current ref value)
              if (map.current.getLayer('distribution-lines')) {
                const vis = currentDistribution ? 'visible' : 'none';
                map.current.setLayoutProperty('distribution-lines', 'visibility', vis);
                console.log('🔄 DATA LOAD: Restored distribution-lines visibility:', vis);
              }
              if (map.current.getLayer('distribution-points')) {
                const vis = currentDistribution ? 'visible' : 'none';
                map.current.setLayoutProperty('distribution-points', 'visibility', vis);
                console.log('🔄 DATA LOAD: Restored distribution-points visibility:', vis);
              }
              
              // Restore transformers visibility (use current ref value)
              if (map.current.getLayer('transformers')) {
                const vis = currentTransformers ? 'visible' : 'none';
                map.current.setLayoutProperty('transformers', 'visibility', vis);
                console.log('🔄 DATA LOAD: Restored transformers visibility:', vis);
              }
            }
          });
        });
      }, 100); // Small delay to ensure Mapbox has processed the source update

      // Remove old click handlers before adding new ones (prevent duplicates)
      map.current.off('click', 'transmission-lines');
      map.current.off('click', 'distribution-lines');
      map.current.off('click', 'transformers');
      map.current.off('click', 'transmission-points');
      map.current.off('click', 'distribution-points');
      
      // Add click handlers for lines
      map.current.on('click', 'transmission-lines', handleLineClick);
      map.current.on('click', 'distribution-lines', handleLineClick);
      
      // Add click handlers for points (markers)
      map.current.on('click', 'transmission-points', handleLineClick);
      map.current.on('click', 'distribution-points', handleLineClick);
      map.current.on('click', 'transformers', handleTransformerClick);

      // Change cursor on hover (lines) with width increase for focus
      map.current.on('mouseenter', 'transmission-lines', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
          // Increase line width on hover for better focus
          map.current.setPaintProperty('transmission-lines', 'line-width', 5.5);
        }
      });
      map.current.on('mouseleave', 'transmission-lines', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
          // Reset line width
          map.current.setPaintProperty('transmission-lines', 'line-width', 4);
        }
      });
      map.current.on('mouseenter', 'distribution-lines', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
          // Increase line width on hover for better focus
          map.current.setPaintProperty('distribution-lines', 'line-width', 3);
        }
      });
      map.current.on('mouseleave', 'distribution-lines', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
          // Reset line width
          map.current.setPaintProperty('distribution-lines', 'line-width', 2);
        }
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
      map.current.on('mouseenter', 'transformers', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'transformers', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      console.log('✅ Power infrastructure loaded (all data):', result.stats);
      console.log('Transformer count:', result.stats.transformer_count);
      console.log('Voltage range:', result.stats.lowest_voltage, '-', result.stats.highest_voltage);
      setStats(result.stats);
      // Clear any previous errors on successful load
      setError(null);
      // Mark data as loaded - prevent future reloads
      dataLoadedRef.current = true;
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

    // Log available properties for debugging
    console.log('Power line properties:', props);
    console.log('Available name fields:', {
      name: props.name,
      ref: props.ref,
      'ref:operator': props['ref:operator'],
      operator: props.operator,
      cables: props.cables
    });

    // Fly to feature
    map.current.flyTo({
      center: coordinates,
      zoom: 15,
      speed: 1.2,
      curve: 1.6,
      essential: true,
    });

    // Collect all available name/identifier fields (check multiple variations)
    const nameFields = [];
    if (props.name && props.name.trim()) nameFields.push(`<strong>Name:</strong> ${props.name}`);
    if (props.ref && props.ref.trim()) nameFields.push(`<strong>Ref:</strong> ${props.ref}`);
    if (props['ref:operator'] && props['ref:operator'].trim()) nameFields.push(`<strong>Operator Ref:</strong> ${props['ref:operator']}`);
    if (props['operator:ref'] && props['operator:ref'].trim()) nameFields.push(`<strong>Operator Ref:</strong> ${props['operator:ref']}`);
    if (props.cables && props.cables.trim()) nameFields.push(`<strong>Cables:</strong> ${props.cables}`);
    if (props['name:en'] && props['name:en'].trim()) nameFields.push(`<strong>Name (EN):</strong> ${props['name:en']}`);
    if (props.description && props.description.trim()) nameFields.push(`<strong>Description:</strong> ${props.description}`);
    if (props.note && props.note.trim()) nameFields.push(`<strong>Note:</strong> ${props.note}`);
    if (props.location && props.location.trim()) nameFields.push(`<strong>Location:</strong> ${props.location}`);
    if (props['addr:housename'] && props['addr:housename'].trim()) nameFields.push(`<strong>Location Name:</strong> ${props['addr:housename']}`);
    if (props['addr:street'] && props['addr:street'].trim()) nameFields.push(`<strong>Street:</strong> ${props['addr:street']}`);
    // For distribution lines, also check for line identifiers
    if (props.power === 'minor_line' && props.line && props.line.trim()) nameFields.push(`<strong>Line ID:</strong> ${props.line}`);
    if (props.power === 'minor_line' && props.circuit && props.circuit.trim()) nameFields.push(`<strong>Circuit:</strong> ${props.circuit}`);
    
    // Build popup content with all available information
    const popupContent = `
      <div style="padding: 12px; min-width: 200px; font-family: system-ui, sans-serif;">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: ${props.power === 'line' ? '#FFD700' : '#A855F7'};">
          ${props.power === 'line' ? '⚡ Transmission Line' : '📡 Distribution Line'}
        </div>
        ${nameFields.length > 0 ? nameFields.join('<br/>') + '<br/><br/>' : '<div style="color: #E5E7EB; opacity: 0.7; font-style: italic;">No name/identifier available</div><br/>'}
        <div style="font-size: 13px; line-height: 1.6;">
          <strong>Type:</strong> ${props.power === 'line' ? 'Transmission' : 'Distribution'}<br/>
          ${props.voltage ? `<strong>Voltage:</strong> ${props.voltage}<br/>` : ''}
          ${props.operator ? `<strong>Operator:</strong> ${props.operator}<br/>` : ''}
          ${props.circuits ? `<strong>Circuits:</strong> ${props.circuits}<br/>` : ''}
          ${props.frequency ? `<strong>Frequency:</strong> ${props.frequency} Hz<br/>` : ''}
          ${props.length_miles ? `<strong>Length:</strong> ${props.length_miles.toFixed(2)} miles (${props.length_km ? props.length_km.toFixed(2) + ' km' : 'N/A'})<br/>` : ''}
          <br/>
          <div style="font-size: 11px; color: #E5E7EB; opacity: 0.7; margin-top: 4px;">
            OSM ID: ${props.osm_id || 'N/A'}
          </div>
        </div>
      </div>
    `;

    // Remove existing popup
    if (popup.current) {
      popup.current.remove();
    }

    // Create new popup
    popup.current = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' })
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map.current);
  };

  // Handle transformer click
  const handleTransformerClick = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!map.current || !e.features?.[0]) return;

    const feature = e.features[0];
    const props = feature.properties || {};
    const coordinates = (e.lngLat as any).toArray();

    // Log available properties for debugging
    console.log('Transformer properties:', props);

    // Fly to feature
    map.current.flyTo({
      center: coordinates,
      zoom: 15,
      speed: 1.2,
      curve: 1.6,
      essential: true,
    });

    // Collect all available name/identifier fields (check multiple variations)
    const nameFields = [];
    if (props.name && props.name.trim()) nameFields.push(`<strong>Name:</strong> ${props.name}`);
    if (props.ref && props.ref.trim()) nameFields.push(`<strong>Ref:</strong> ${props.ref}`);
    if (props['ref:operator'] && props['ref:operator'].trim()) nameFields.push(`<strong>Operator Ref:</strong> ${props['ref:operator']}`);
    if (props['operator:ref'] && props['operator:ref'].trim()) nameFields.push(`<strong>Operator Ref:</strong> ${props['operator:ref']}`);
    if (props['name:en'] && props['name:en'].trim()) nameFields.push(`<strong>Name (EN):</strong> ${props['name:en']}`);
    if (props.description && props.description.trim()) nameFields.push(`<strong>Description:</strong> ${props.description}`);
    if (props.note && props.note.trim()) nameFields.push(`<strong>Note:</strong> ${props.note}`);
    if (props.location && props.location.trim()) nameFields.push(`<strong>Location:</strong> ${props.location}`);
    if (props['addr:housename'] && props['addr:housename'].trim()) nameFields.push(`<strong>Location Name:</strong> ${props['addr:housename']}`);
    if (props['addr:street'] && props['addr:street'].trim()) nameFields.push(`<strong>Street:</strong> ${props['addr:street']}`);
    if (props.substation && props.substation.trim()) nameFields.push(`<strong>Substation:</strong> ${props.substation}`);
    if (props['substation:name'] && props['substation:name'].trim()) nameFields.push(`<strong>Substation Name:</strong> ${props['substation:name']}`);
    if (props.rating && props.rating.trim()) nameFields.push(`<strong>Rating:</strong> ${props.rating}`);
    if (props['transformer:type'] && props['transformer:type'].trim()) nameFields.push(`<strong>Type:</strong> ${props['transformer:type']}`);

    // Build popup content with all available information
    const popupContent = `
      <div style="padding: 12px; min-width: 200px; font-family: system-ui, sans-serif;">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #22C55E;">
          ⚡ Transformer
        </div>
        ${nameFields.length > 0 ? nameFields.join('<br/>') + '<br/><br/>' : '<div style="color: #E5E7EB; opacity: 0.7; font-style: italic;">No name/identifier available</div><br/>'}
        <div style="font-size: 13px; line-height: 1.6;">
          ${props.transformer ? `<strong>Type:</strong> ${props.transformer}<br/>` : ''}
          ${props.operator ? `<strong>Operator:</strong> ${props.operator}<br/>` : ''}
          ${props.voltage ? `<strong>Voltage:</strong> ${props.voltage}<br/>` : ''}
          ${props.power ? `<strong>Power Type:</strong> ${props.power}<br/>` : ''}
          ${props.location ? `<strong>Location:</strong> ${props.location}<br/>` : ''}
          ${props.rating ? `<strong>Rating:</strong> ${props.rating}<br/>` : ''}
          <br/>
          <div style="font-size: 11px; color: #E5E7EB; opacity: 0.7; margin-top: 4px;">
            OSM ID: ${props.osm_id || 'N/A'}
          </div>
        </div>
      </div>
    `;

    // Remove existing popup
    if (popup.current) {
      popup.current.remove();
    }

    // Create new popup
    popup.current = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' })
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map.current);
  };

  // Load all power data once on map load (no reload on zoom/pan)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Load all data once after map loads
    const initialTimer = setTimeout(() => {
      if (!isLoadingRef.current && !dataLoadedRef.current) {
        console.log('🔄 Loading all power infrastructure data (one-time load)');
        loadPowerData();
      }
    }, 1000);

    return () => {
      clearTimeout(initialTimer);
    };
  }, [mapLoaded, loadPowerData]);

  // Toggle layer visibility (lines and their markers together)
  // These effects run IMMEDIATELY when toggle state changes
  // They take priority over any data reload visibility restoration
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const visibility = showTransmission ? 'visible' : 'none';
    
    // Update transmission lines IMMEDIATELY
    if (map.current.getLayer('transmission-lines')) {
      try {
        map.current.setLayoutProperty('transmission-lines', 'visibility', visibility);
        console.log('✅ TOGGLE: Transmission lines visibility set to:', visibility);
      } catch (e) {
        console.error('❌ Error setting transmission-lines visibility:', e);
      }
    }
    
    // Update transmission points IMMEDIATELY
    if (map.current.getLayer('transmission-points')) {
      try {
        map.current.setLayoutProperty('transmission-points', 'visibility', visibility);
        console.log('✅ TOGGLE: Transmission points visibility set to:', visibility);
      } catch (e) {
        console.error('❌ Error setting transmission-points visibility:', e);
      }
    }
  }, [showTransmission, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const visibility = showDistribution ? 'visible' : 'none';
    
    // Update distribution lines IMMEDIATELY
    if (map.current.getLayer('distribution-lines')) {
      try {
        map.current.setLayoutProperty('distribution-lines', 'visibility', visibility);
        console.log('✅ TOGGLE: Distribution lines visibility set to:', visibility);
      } catch (e) {
        console.error('❌ Error setting distribution-lines visibility:', e);
      }
    }
    
    // Update distribution points IMMEDIATELY
    if (map.current.getLayer('distribution-points')) {
      try {
        map.current.setLayoutProperty('distribution-points', 'visibility', visibility);
        console.log('✅ TOGGLE: Distribution points visibility set to:', visibility);
      } catch (e) {
        console.error('❌ Error setting distribution-points visibility:', e);
      }
    }
  }, [showDistribution, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const visibility = showTransformers ? 'visible' : 'none';
    
    // Update transformers IMMEDIATELY
    if (map.current.getLayer('transformers')) {
      try {
        map.current.setLayoutProperty('transformers', 'visibility', visibility);
        console.log('✅ TOGGLE: Transformers visibility set to:', visibility);
      } catch (e) {
        console.error('❌ Error setting transformers visibility:', e);
      }
    }
  }, [showTransformers, mapLoaded]);

  // Pulsing animation for transformers
  useEffect(() => {
    if (!map.current || !mapLoaded || !showTransformers) return;

    let animationFrameId: number | null = null;
    let pulsePhase = 0;

    const animatePulse = () => {
      if (!map.current || !map.current.getLayer('transformers')) {
        animationFrameId = null;
        return;
      }

      pulsePhase += 0.05;
      // Pulse radius from 5px to 8px and back (sine wave)
      const baseRadius = 6.5; // Average of 5 and 8
      const pulseAmplitude = 1.5; // Half of (8 - 5)
      const pulseRadius = baseRadius + Math.sin(pulsePhase) * pulseAmplitude;

      // Update circle radius for pulsing effect
      try {
        map.current.setPaintProperty('transformers', 'circle-radius', [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, pulseRadius * 0.77, // Scale proportionally
          15, pulseRadius * 1.23,
          20, pulseRadius * 1.85
        ]);
      } catch (e) {
        // Layer might not be ready, ignore
      }

      animationFrameId = requestAnimationFrame(animatePulse);
    };

    animatePulse();

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [mapLoaded, showTransformers]);

  // Animate power flow along lines (toggleable)
  useEffect(() => {
    if (!map.current || !mapLoaded || !showFlowAnimation) {
      // Stop animation and hide flow layers
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Hide flow layers
      if (map.current) {
        ['transmission-flow', 'transmission-flow-2', 'distribution-flow', 'distribution-flow-2'].forEach(layerId => {
          if (map.current?.getLayer(layerId)) {
            map.current.setLayoutProperty(layerId, 'visibility', 'none');
          }
        });
      }
      return;
    }

    // Animation function - smooth continuous energy flow using dash offset
    const animate = () => {
      if (!map.current) return;

      const time = Date.now() * 0.001; // Time in seconds
      
      // Transmission lines - slower, thicker flow (more visible)
      if (map.current.getLayer('transmission-flow')) {
        // Smooth continuous flow using animated dash offset
        // Pattern: [25px dash, 10px gap] = 35px total for smoother flow
        const transmissionSpeed = 0.25; // Slower for transmission - clearly visible
        animationOffsetRef.current = (animationOffsetRef.current + transmissionSpeed) % 35;
        
        const dashLength = 25; // Thicker dashes for transmission
        const gapLength = 10;
        const totalLength = dashLength + gapLength;
        const offset = animationOffsetRef.current % totalLength;
        
        if (offset < dashLength) {
          const remainingDash = dashLength - offset;
          map.current.setPaintProperty('transmission-flow', 'line-dasharray', [
            remainingDash, gapLength + offset
          ]);
        } else {
          const gapRemaining = totalLength - offset;
          map.current.setPaintProperty('transmission-flow', 'line-dasharray', [
            dashLength, gapRemaining
          ]);
        }
        
        // Smooth pulsing opacity with glow effect
        const opacity = 0.75 + Math.sin(time * 1.0) * 0.08;
        map.current.setPaintProperty('transmission-flow', 'line-opacity', Math.max(0.67, Math.min(0.83, opacity)));
      }
      
      // Second transmission flow layer - offset for depth
      if (map.current.getLayer('transmission-flow-2')) {
        const offset2 = ((animationOffsetRef.current + 17.5) % 35) % 35;
        const dashLength2 = 22;
        const gapLength2 = 13;
        const totalLength2 = dashLength2 + gapLength2;
        
        if (offset2 < dashLength2) {
          const remainingDash2 = dashLength2 - offset2;
          map.current.setPaintProperty('transmission-flow-2', 'line-dasharray', [
            remainingDash2, gapLength2 + offset2
          ]);
        } else {
          const gapRemaining2 = totalLength2 - offset2;
          map.current.setPaintProperty('transmission-flow-2', 'line-dasharray', [
            dashLength2, gapRemaining2
          ]);
        }
        const opacity2 = 0.5 + Math.sin(time * 1.1) * 0.06;
        map.current.setPaintProperty('transmission-flow-2', 'line-opacity', Math.max(0.44, Math.min(0.56, opacity2)));
      }
      
      // Distribution lines - faster, thinner flow
      if (map.current.getLayer('distribution-flow')) {
        // Faster flow for distribution lines - clearly moving
        const distributionSpeed = 0.4; // Faster for distribution
        const distOffset = (animationOffsetRef.current * distributionSpeed) % 24;
        
        const dashLength = 18; // Thinner dashes for distribution
        const gapLength = 6;
        const totalLength = dashLength + gapLength;
        const offset = distOffset % totalLength;
        
        if (offset < dashLength) {
          const remainingDash = dashLength - offset;
          map.current.setPaintProperty('distribution-flow', 'line-dasharray', [
            remainingDash, gapLength + offset
          ]);
        } else {
          const gapRemaining = totalLength - offset;
          map.current.setPaintProperty('distribution-flow', 'line-dasharray', [
            dashLength, gapRemaining
          ]);
        }
        
        // Smooth pulsing opacity with glow
        const opacity = 0.7 + Math.sin(time * 1.3) * 0.1;
        map.current.setPaintProperty('distribution-flow', 'line-opacity', Math.max(0.6, Math.min(0.8, opacity)));
      }
      
      // Second distribution flow layer - offset for depth
      if (map.current.getLayer('distribution-flow-2')) {
        const distOffset2 = ((animationOffsetRef.current * 0.4) + 12) % 24;
        const dashLength2 = 16;
        const gapLength2 = 8;
        const totalLength2 = dashLength2 + gapLength2;
        const offset2 = distOffset2 % totalLength2;
        
        if (offset2 < dashLength2) {
          const remainingDash2 = dashLength2 - offset2;
          map.current.setPaintProperty('distribution-flow-2', 'line-dasharray', [
            remainingDash2, gapLength2 + offset2
          ]);
        } else {
          const gapRemaining2 = totalLength2 - offset2;
          map.current.setPaintProperty('distribution-flow-2', 'line-dasharray', [
            dashLength2, gapRemaining2
          ]);
        }
        const opacity2 = 0.5 + Math.sin(time * 1.4) * 0.08;
        map.current.setPaintProperty('distribution-flow-2', 'line-opacity', Math.max(0.42, Math.min(0.58, opacity2)));
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Show flow layers if animation is enabled
    if (showFlowAnimation) {
      if (map.current.getLayer('transmission-flow') && showTransmission) {
        map.current.setLayoutProperty('transmission-flow', 'visibility', 'visible');
      }
      if (map.current.getLayer('transmission-flow-2') && showTransmission) {
        map.current.setLayoutProperty('transmission-flow-2', 'visibility', 'visible');
      }
      if (map.current.getLayer('distribution-flow') && showDistribution) {
        map.current.setLayoutProperty('distribution-flow', 'visibility', 'visible');
      }
      if (map.current.getLayer('distribution-flow-2') && showDistribution) {
        map.current.setLayoutProperty('distribution-flow-2', 'visibility', 'visible');
      }
    }

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
    }, [mapLoaded, showTransmission, showDistribution, showFlowAnimation]);

  // Left-click + drag rotation support (works in all modes)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    let isRotating = false;
    let startBearing = 0;
    let startX = 0;
    let isLeftMouseDown = false;
    let rotationActivationTimeout: NodeJS.Timeout | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      // Only handle left mouse button (button 0)
      if (e.button !== 0) return;
      
      if (!map.current) return;
      
      // Delay activation to allow double-click detection
      // If user double-clicks, this timeout will be cleared
      rotationActivationTimeout = setTimeout(() => {
        // Don't activate rotation if double-click panning is active
        if (isDoubleClickPanningRef.current) {
          return;
        }
        
        isLeftMouseDown = true;
        isRotating = true;
        startX = e.clientX;
        startBearing = map.current!.getBearing();
        
        // Prevent default panning behavior
        e.preventDefault();
        e.stopPropagation();
        
        // Change cursor to indicate rotation
        if (map.current && map.current.getCanvas()) {
          map.current.getCanvas().style.cursor = 'grabbing';
        }
      }, 250); // 250ms delay - less than double-click timeout (300ms)
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Don't rotate if double-click panning is active
      if (isDoubleClickPanningRef.current) return;
      
      if (!isRotating || !map.current || !isLeftMouseDown) return;
      
      // Prevent default panning behavior
      e.preventDefault();
      e.stopPropagation();
      
      const deltaX = e.clientX - startX;
      // Convert pixel movement to bearing change (sensitivity adjustment)
      const bearingChange = deltaX * 0.5;
      const newBearing = startBearing + bearingChange;
      
      map.current.setBearing(newBearing);
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Only handle left mouse button (button 0)
      if (e.button !== 0) return;
      
      // Clear activation timeout if rotation hasn't started yet
      if (rotationActivationTimeout) {
        clearTimeout(rotationActivationTimeout);
        rotationActivationTimeout = null;
      }
      
      if (!isRotating) return;
      
      isRotating = false;
      isLeftMouseDown = false;
      
      if (map.current && map.current.getCanvas()) {
        map.current.getCanvas().style.cursor = '';
      }
    };

    const canvas = map.current.getCanvasContainer();
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);
      
      return () => {
        if (rotationActivationTimeout) clearTimeout(rotationActivationTimeout);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [mapLoaded]);

  // Double-click + drag to pan/move the map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    let isDoubleClickPanning = false;
    let doubleClickStartPoint: { x: number; y: number } | null = null;
    let doubleClickStartCenter: [number, number] | null = null;
    let doubleClickTimeout: NodeJS.Timeout | null = null;
    let clickCount = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (!map.current || e.button !== 0) return; // Only handle left mouse button
      
      clickCount++;
      
      if (clickCount === 1) {
        // Set flag immediately to prevent rotation handler from activating
        isDoubleClickPanningRef.current = true;
        
        // Wait to see if there's a second click
        doubleClickTimeout = setTimeout(() => {
          // Not a double-click, clear the flag to allow rotation
          isDoubleClickPanningRef.current = false;
          clickCount = 0;
        }, 300); // 300ms window for double-click
      } else if (clickCount === 2) {
        // Double-click detected
        if (doubleClickTimeout) {
          clearTimeout(doubleClickTimeout);
          doubleClickTimeout = null;
        }
        clickCount = 0;
        
        // Prevent default double-click zoom and rotation handler
        e.preventDefault();
        e.stopPropagation();
        
        isDoubleClickPanning = true;
        // Flag is already set from first click, keep it set
        doubleClickStartPoint = { x: e.clientX, y: e.clientY };
        doubleClickStartCenter = map.current.getCenter();
        
        // Change cursor to indicate panning
        if (map.current.getCanvas()) {
          map.current.getCanvas().style.cursor = 'grabbing';
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDoubleClickPanning || !map.current || !doubleClickStartPoint || !doubleClickStartCenter) return;
      
      // Prevent default panning behavior
      e.preventDefault();
      e.stopPropagation();
      
      // Calculate the drag offset
      const deltaX = e.clientX - doubleClickStartPoint.x;
      const deltaY = e.clientY - doubleClickStartPoint.y;
      
      // Get current map state
      const currentCenter = map.current.getCenter();
      const bounds = map.current.getBounds();
      
      // Get canvas dimensions
      const canvas = map.current.getCanvas();
      const canvasWidth = canvas ? canvas.width : window.innerWidth;
      const canvasHeight = canvas ? canvas.height : window.innerHeight;
      
      // Convert pixel movement to lat/lng offset
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const lngRange = ne.lng - sw.lng;
      const latRange = ne.lat - sw.lat;
      
      const lngOffset = -(deltaX / canvasWidth) * lngRange; // Negative for natural panning
      const latOffset = (deltaY / canvasHeight) * latRange; // Positive because Y is inverted
      
      // Calculate new center based on the original double-click center
      const newLng = doubleClickStartCenter[0] + lngOffset;
      const newLat = doubleClickStartCenter[1] + latOffset;
      
      // Pan to new center
      map.current.setCenter([newLng, newLat]);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only handle left mouse button
      
      if (isDoubleClickPanning) {
        isDoubleClickPanning = false;
        isDoubleClickPanningRef.current = false; // Clear shared flag
        doubleClickStartPoint = null;
        doubleClickStartCenter = null;
        
        if (map.current && map.current.getCanvas()) {
          map.current.getCanvas().style.cursor = '';
        }
      }
      
      // Reset click count after a delay
      if (doubleClickTimeout) {
        clearTimeout(doubleClickTimeout);
        doubleClickTimeout = null;
      }
      clickCount = 0;
    };

    const canvas = map.current.getCanvasContainer();
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);
      
      return () => {
        if (doubleClickTimeout) clearTimeout(doubleClickTimeout);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [mapLoaded]);

  // Reset view to Overland Park default
  const resetView = useCallback(() => {
    if (!map.current) return;

    map.current.flyTo({
      center: OVERLAND_PARK_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: 1500,
    });
  }, []);

  // Toggle 3D view
  const toggle3D = useCallback(() => {
    if (!map.current || !mapLoaded) return;

    const newIs3D = !is3D;
    setIs3D(newIs3D);

    if (newIs3D) {
      // Enable 3D view
      // Enable terrain
      if (map.current.getSource('mapbox-dem')) {
        map.current.setTerrain({
          source: 'mapbox-dem',
          exaggeration: 1.2,
        });
      }

      // Add sky layer if not exists
      if (!map.current.getLayer('sky')) {
        map.current.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 8,
          },
        });
      }

      // Add 3D buildings layer if not exists
      if (!map.current.getLayer('3d-buildings')) {
        // Find insertion point (before first symbol layer)
        const layers = map.current.getStyle().layers;
        let insertBefore = layers.findIndex((layer: any) => layer.type === 'symbol');
        if (insertBefore === -1) insertBefore = layers.length;

        map.current.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#3a3a3a',
            'fill-extrusion-height': ['coalesce', ['get', 'height'], 5],
            'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
            'fill-extrusion-opacity': 0.6,
          },
        }, insertBefore >= 0 ? layers[insertBefore].id : undefined);
      }

      // Animate camera to 3D view
      map.current.easeTo({
        pitch: 60,
        duration: 1200,
      });
    } else {
      // Disable 3D view
      map.current.setTerrain(null);

      // Remove sky layer
      if (map.current.getLayer('sky')) {
        map.current.removeLayer('sky');
      }

      // Remove 3D buildings layer
      if (map.current.getLayer('3d-buildings')) {
        map.current.removeLayer('3d-buildings');
      }

      // Reset camera to 2D view
      map.current.easeTo({
        pitch: 0,
        duration: 1200,
      });
    }
  }, [mapLoaded, is3D]);

  // Toggle flow animation
  const toggleFlowAnimation = useCallback(() => {
    setShowFlowAnimation(!showFlowAnimation);
  }, [showFlowAnimation]);


  return (
    <div 
      className={`relative w-full h-full ${className}`} 
      style={{ 
        minHeight: '400px', 
        backgroundColor: '#0f0f14',
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        ref={mapContainer} 
        id="mapbox-map-container"
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '400px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }} 
      />
      
      {/* Floating Map Controls - 3D and Flow buttons (top-right, below compass) */}
      {mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '130px', // Below compass/zoom controls with more clearance
          right: '10px',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {/* 3D View Button */}
          <button
            onClick={toggle3D}
            title="Toggle 3D View"
            style={{
              width: '34px',
              height: '34px',
              backgroundColor: is3D ? 'rgba(250, 204, 21, 0.9)' : 'rgba(15, 15, 20, 0.9)',
              border: `1px solid ${is3D ? '#FACC15' : 'rgba(255, 255, 255, 0.3)'}`,
              borderRadius: '4px',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = is3D ? 'rgba(250, 204, 21, 1)' : 'rgba(30, 30, 40, 0.95)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = is3D ? 'rgba(250, 204, 21, 0.9)' : 'rgba(15, 15, 20, 0.9)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
            }}
          >
            3D
          </button>

          {/* Flow Animation Button */}
          <button
            onClick={toggleFlowAnimation}
            title="Toggle Energy Flow"
            style={{
              width: '34px',
              height: '34px',
              backgroundColor: showFlowAnimation ? 'rgba(250, 204, 21, 0.9)' : 'rgba(15, 15, 20, 0.9)',
              border: `1px solid ${showFlowAnimation ? '#FACC15' : 'rgba(255, 255, 255, 0.3)'}`,
              borderRadius: '4px',
              color: '#FFFFFF',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = showFlowAnimation ? 'rgba(250, 204, 21, 1)' : 'rgba(30, 30, 40, 0.95)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = showFlowAnimation ? 'rgba(250, 204, 21, 0.9)' : 'rgba(15, 15, 20, 0.9)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
            }}
          >
            ⚡
          </button>
        </div>
      )}
      
      {/* Reset View Button - Bottom Left */}
      {mapLoaded && (
        <button
          onClick={resetView}
          title="Reset View to Overland Park"
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            width: '34px',
            height: '34px',
            backgroundColor: 'rgba(15, 15, 20, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            color: '#FFFFFF',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            zIndex: 10001,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 30, 40, 0.95)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 15, 20, 0.9)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
          }}
        >
          🏠
        </button>
      )}
      
      {/* Layer controls - Dashboard */}
      {mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: 'rgba(15, 15, 20, 0.85)', // Cyber Energy dark background
          color: '#E5E7EB', // Primary text color
          padding: isDashboardCollapsed ? '12px 16px' : '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          zIndex: 10000,
          width: isDashboardCollapsed ? 'auto' : '340px',
          maxWidth: isDashboardCollapsed ? 'auto' : '340px',
          maxHeight: '85vh',
          overflowY: isDashboardCollapsed ? 'visible' : 'auto',
          overflowX: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'auto',
          transition: 'width 0.3s ease, padding 0.3s ease'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#FACC15', // Cyber Energy accent color for headings
            marginBottom: isDashboardCollapsed ? '0' : '12px', 
            borderBottom: isDashboardCollapsed ? 'none' : '1px solid rgba(250, 204, 21, 0.3)', 
            paddingBottom: isDashboardCollapsed ? '0' : '8px' 
          }}>
            {!isDashboardCollapsed && <span>Power Grid Dashboard</span>}
            <button
              onClick={() => setIsDashboardCollapsed(!isDashboardCollapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#E5E7EB',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                marginLeft: isDashboardCollapsed ? '0' : '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={isDashboardCollapsed ? 'Expand Dashboard' : 'Collapse Dashboard'}
            >
              {isDashboardCollapsed ? '▶' : '◀'}
            </button>
          </div>
          
          {!isDashboardCollapsed && (
            <div style={{ maxHeight: 'calc(85vh - 100px)', overflowY: 'auto', overflowX: 'hidden', paddingRight: '4px' }}>
          
          {/* Explanation */}
          <div style={{ fontSize: '11px', color: '#E5E7EB', marginBottom: '14px', lineHeight: '1.4', fontStyle: 'italic', opacity: 0.9 }}>
            This map shows how electricity flows across Overland Park — from high-voltage transmission lines to neighborhood distribution lines and transformers.
          </div>
          
          {/* Statistics */}
          {stats && (
            <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              {/* Section A: Electricity Network */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#FACC15', marginBottom: '6px' }}>
                  ⚡ Electricity Network
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px', paddingLeft: '8px' }}>
                  <span style={{ color: '#FFD700' }}>🟡</span> High-Voltage Lines: <strong>{stats.transmission_miles.toFixed(1)}</strong> miles
                </div>
                <div style={{ fontSize: '12px', marginBottom: '3px', paddingLeft: '8px' }}>
                  <span style={{ color: '#A855F7' }}>🟣</span> Neighborhood Lines: <strong>{stats.distribution_miles.toFixed(1)}</strong> miles
                </div>
                <div style={{ fontSize: '12px', paddingLeft: '8px' }}>
                  <span style={{ color: '#22C55E' }}>🟢</span> Transformers: <strong>{stats.transformer_count}</strong> locations
                </div>
              </div>

              {/* Section B: Power Capacity */}
              {(stats.highest_voltage !== null && stats.highest_voltage !== undefined && 
                stats.lowest_voltage !== null && stats.lowest_voltage !== undefined) ? (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#FACC15', marginBottom: '6px' }}>
                    🔋 Power Capacity
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '3px', paddingLeft: '8px', color: '#FACC15' }}>
                    Highest Voltage: <strong>{stats.highest_voltage >= 1000 ? (stats.highest_voltage / 1000).toFixed(1) + ' kV' : stats.highest_voltage + ' V'}</strong>
                    <span title="Maximum voltage found in this view" style={{ marginLeft: '4px', cursor: 'help', fontSize: '10px', color: '#E5E7EB', opacity: 0.6 }}>(i)</span>
                  </div>
                  <div style={{ fontSize: '12px', paddingLeft: '8px', color: '#38BDF8' }}>
                    Lowest Voltage: <strong>{stats.lowest_voltage >= 1000 ? (stats.lowest_voltage / 1000).toFixed(1) + ' kV' : stats.lowest_voltage + ' V'}</strong>
                    <span title="Minimum voltage found in this view" style={{ marginLeft: '4px', cursor: 'help', fontSize: '10px', color: '#E5E7EB', opacity: 0.6 }}>(i)</span>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#FACC15', marginBottom: '6px' }}>
                    🔋 Power Capacity
                  </div>
                  <div style={{ fontSize: '11px', color: '#E5E7EB', opacity: 0.7, fontStyle: 'italic', paddingLeft: '8px' }}>
                    Voltage data not available in this area
                  </div>
                </div>
              )}

              {/* Section C: Coverage */}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#FACC15', marginBottom: '6px' }}>
                  📍 Coverage
                </div>
                <div style={{ fontSize: '11px', paddingLeft: '8px', marginBottom: '2px', color: '#E5E7EB' }}>
                  City: Overland Park, KS
                </div>
                <div style={{ fontSize: '11px', paddingLeft: '8px', color: '#E5E7EB' }}>
                  Data Source: OpenStreetMap (Live)
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#FACC15', marginBottom: '6px' }}>
              Legend
            </div>
            <div style={{ fontSize: '11px', paddingLeft: '8px', marginBottom: '2px' }}>
              <span style={{ color: '#FFD700' }}>🟡</span> High-Voltage Lines
            </div>
            <div style={{ fontSize: '11px', paddingLeft: '8px', marginBottom: '2px' }}>
              <span style={{ color: '#A855F7' }}>🟣</span> Neighborhood Lines
            </div>
            <div style={{ fontSize: '11px', paddingLeft: '8px', marginBottom: '2px' }}>
              <span style={{ color: '#22C55E' }}>🟢</span> Transformers
            </div>
          </div>

          {/* Layer Controls */}
          <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#FACC15' }}>
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
            <span style={{ marginLeft: '4px' }}>High-Voltage Lines</span>
            <span title="Carries electricity long distances at high voltage." style={{ marginLeft: '4px', cursor: 'help', fontSize: '10px', color: '#E5E7EB', opacity: 0.6 }}>(i)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={showDistribution}
              onChange={(e) => setShowDistribution(e.target.checked)}
              style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <span style={{ color: '#A855F7' }}>●</span>
            <span style={{ marginLeft: '4px' }}>Neighborhood Lines</span>
            <span title="Delivers electricity from substations into neighborhoods." style={{ marginLeft: '4px', cursor: 'help', fontSize: '10px', color: '#E5E7EB', opacity: 0.6 }}>(i)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '12px', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={showTransformers}
              onChange={(e) => setShowTransformers(e.target.checked)}
              style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <span style={{ color: '#22C55E' }}>⚙️</span>
            <span style={{ marginLeft: '4px' }}>Transformers</span>
            <span title="Reduces voltage before power enters homes." style={{ marginLeft: '4px', cursor: 'help', fontSize: '10px', color: '#E5E7EB', opacity: 0.6 }}>(i)</span>
          </label>

            
            </div>
          )}
        </div>
      )}

      {/* Loading indicator - Top Middle */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(15, 15, 20, 0.85)', // Cyber Energy dark background
          color: '#E5E7EB', // Primary text color
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'system-ui, sans-serif',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(10px)'
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

      {/* Error message - show prominently */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(220, 38, 38, 0.95)',
          color: '#E5E7EB',
          padding: '20px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          zIndex: 10001,
          maxWidth: '500px',
          fontSize: '16px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '18px' }}>⚠️ Error</div>
          <div style={{ marginBottom: '16px' }}>{error}</div>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '12px' }}>
            Check browser console (F12) for more details
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading/Initialization message - Always visible until map loads */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(15, 15, 20, 0.95)',
          color: '#E5E7EB',
          padding: '32px 40px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
          zIndex: 10002,
          textAlign: 'center',
          border: '2px solid rgba(250, 204, 21, 0.5)',
          minWidth: '300px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#FACC15' }}>
            ⚡ Power Grid Visualizer
          </div>
          <div style={{ fontSize: '16px', marginBottom: '20px', color: '#E5E7EB' }}>
            {error ? 'Error loading map' : 'Loading map...'}
          </div>
          {!error && (
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(250, 204, 21, 0.3)',
              borderTop: '4px solid #FACC15',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          )}
          <div style={{ fontSize: '12px', marginTop: '16px', color: '#E5E7EB', opacity: 0.7 }}>
            {error ? 'Check console (F12) for details' : 'Please wait...'}
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
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
