
import React from 'react';
import MapComponent from './MapComponent';
import { TrafficLight } from '../services/routeService';

interface Coordinates {
  lng: number;
  lat: number;
}

interface MapContainerProps {
  startCoordinates?: Coordinates;
  endCoordinates?: Coordinates;
  routeGeometry?: any;
  trafficLights?: TrafficLight[];
  isLoading?: boolean;
  onCoordinatesChange?: (start: Coordinates, end: Coordinates) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  startCoordinates,
  endCoordinates,
  routeGeometry,
  trafficLights = [],
  isLoading = false,
  onCoordinatesChange
}) => {
  return (
    <div className="relative w-full h-full">
      <MapComponent
        startCoordinates={startCoordinates}
        endCoordinates={endCoordinates}
        routeGeometry={routeGeometry}
        trafficLights={trafficLights}
        isLoading={isLoading}
        onCoordinatesChange={onCoordinatesChange}
      />
    </div>
  );
};

export default MapContainer; 
