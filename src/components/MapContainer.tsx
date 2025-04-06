
import React from 'react';
import MapComponent from './MapComponent';
import { TrafficLight } from '../services/routeService';
import { toast } from "sonner";

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
  const handleMapError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="relative w-full h-full">
      <MapComponent
        startCoordinates={startCoordinates}
        endCoordinates={endCoordinates}
        routeGeometry={routeGeometry}
        trafficLights={trafficLights}
        isLoading={isLoading}
        onCoordinatesChange={onCoordinatesChange}
        onError={handleMapError}
      />
      {trafficLights && trafficLights.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
          {trafficLights.length} traffic signal{trafficLights.length !== 1 ? 's' : ''} on route
        </div>
      )}
    </div>
  );
};

export default MapContainer;
