import React, { useState, useEffect, useMemo } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import Map from '../components/Map';
import ZoneGrid from '../components/ZoneGrid';
import ZoneBoxplotPanel from '../components/ZoneBoxplotPanel';
import { getAllReadings } from '../services/apiService';

const ZoomTracker = ({ onZoomChange }) => {
    const map = useMap();
    useMapEvents({
        zoomend: () => onZoomChange(map.getZoom()),
    });
    return null;
};

const DataAnalysis = () => {
    const [sessions, setSessions] = useState([]);
    const [zoom, setZoom] = useState(9);
    const [selectedCell, setSelectedCell] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getAllReadings();
                setSessions(data.filter(s => s.avgLat != null && s.avgLong != null));
            } catch (error) {
                console.error('Error fetching readings', error);
            }
        };
        fetch();
    }, []);

    const bounds = useMemo(() => sessions.map(s => [s.avgLat, s.avgLong]), [sessions]);

    return (
        <>
            <div style={{ padding: '4px 8px', background: '#eee', fontSize: 12 }}>
                Zoom: {zoom}
            </div>
            <div style={{ height: 'calc(100vh - 64px)' }}>
                <Map center={[15, -90.5]} zoom={zoom} bounds={bounds.length > 0 ? bounds : null}>
                    <ZoomTracker onZoomChange={setZoom} />
                    <ZoneGrid
                        sessions={sessions}
                        onCellClick={(key, cellSessions) => setSelectedCell({ key, sessions: cellSessions })}
                    />
                </Map>
            </div>

            <ZoneBoxplotPanel
                open={!!selectedCell}
                onClose={() => setSelectedCell(null)}
                cellSessions={selectedCell?.sessions}
            />
        </>
    );
};

export default DataAnalysis;
