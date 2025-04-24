import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = ({ markers = [], center = [0, 0], zoom = 2 }) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {markers.map((marker, idx) => (
        <Marker key={idx} position={[marker.lat, marker.long]}>
          <Popup>
            { <div dangerouslySetInnerHTML={{ __html: marker.popupContent }} /> || `ID: ${marker.id}`}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;