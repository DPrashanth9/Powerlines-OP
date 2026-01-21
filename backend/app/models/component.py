"""
Pydantic models for power grid components
"""

from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class ComponentType(str, Enum):
    """Types of power grid components"""
    POWER_GENERATION = "PowerGeneration"
    STEP_UP_SUBSTATION = "StepUpSubstation"
    TRANSMISSION_LINE = "TransmissionLine"
    TRANSMISSION_SUBSTATION = "TransmissionSubstation"
    DISTRIBUTION_SUBSTATION = "DistributionSubstation"
    DISTRIBUTION_LINE = "DistributionLine"
    LOCAL_TRANSFORMER = "LocalTransformer"
    SERVICE_DROP = "ServiceDrop"
    BUILDING = "Building"


class Coordinates(BaseModel):
    """Geographic coordinates"""
    longitude: float
    latitude: float


class Component(BaseModel):
    """Power grid component model"""
    id: str
    name: str
    type: ComponentType
    longitude: float
    latitude: float
    properties: Optional[dict] = None
    
    @property
    def coordinates(self) -> Coordinates:
        """Get coordinates as Coordinates object"""
        return Coordinates(longitude=self.longitude, latitude=self.latitude)


class PathNode(BaseModel):
    """A node in the path from component to source"""
    id: str
    name: str
    type: ComponentType
    longitude: float
    latitude: float
    
    @property
    def coordinates(self) -> Coordinates:
        """Get coordinates as Coordinates object"""
        return Coordinates(longitude=self.longitude, latitude=self.latitude)


class PathToSource(BaseModel):
    """Path from a component back to its power source"""
    component_id: str
    path: List[PathNode]
