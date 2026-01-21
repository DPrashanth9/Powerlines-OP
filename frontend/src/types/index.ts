/**
 * TypeScript type definitions for the Power Grid Visualizer
 */

export enum ComponentType {
  POWER_GENERATION = "PowerGeneration",
  STEP_UP_SUBSTATION = "StepUpSubstation",
  TRANSMISSION_LINE = "TransmissionLine",
  TRANSMISSION_SUBSTATION = "TransmissionSubstation",
  DISTRIBUTION_SUBSTATION = "DistributionSubstation",
  DISTRIBUTION_LINE = "DistributionLine",
  LOCAL_TRANSFORMER = "LocalTransformer",
  SERVICE_DROP = "ServiceDrop",
  BUILDING = "Building",
}

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  longitude: number;
  latitude: number;
  properties?: Record<string, any>;
}

export interface PathNode {
  id: string;
  name: string;
  type: ComponentType;
  longitude: number;
  latitude: number;
  coordinates?: Coordinates;
}

export interface PathToSource {
  component_id: string;
  path: PathNode[];
}

export interface ApiError {
  detail: string;
}
