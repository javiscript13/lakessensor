import React, { useState, useEffect, useMemo } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { CircularProgress } from '@mui/material';
import Map from '../components/Map';
import ZoneGrid from '../components/ZoneGrid';
import PhysicoChemicalBoxplotPanel from '../components/PhysicoChemicalBoxplotPanel';
import { getAllLakeSamples } from '../services/apiService';

const ZoomTracker = ({ onZoomChange }) => {
    const map = useMap();
    useMapEvents({
        zoomend: () => onZoomChange(map.getZoom()),
    });
    return null;
};

const PhysicoChemicalAnalysis = () => {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(9);
    const [selectedCell, setSelectedCell] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getAllLakeSamples();
                // ZoneGrid/geoGrid key off avgLat/avgLong — alias so it can be reused as-is.
                setSamples(
                    data
                        .filter(s => s.lat != null && s.long != null)
                        .map(s => ({ ...s, avgLat: s.lat, avgLong: s.long }))
                );
            } catch (error) {
                console.error('Error fetching lake samples', error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const bounds = useMemo(() => samples.map(s => [s.avgLat, s.avgLong]), [samples]);

    return (
        <>
        <div style={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.7)',
                }}>
                    <CircularProgress />
                </div>
            )}
                <Map center={[15, -90.5]} zoom={zoom} bounds={bounds.length > 0 ? bounds : null}>
                    <ZoomTracker onZoomChange={setZoom} />
                    <ZoneGrid
                        sessions={samples}
                        onCellClick={(key, cellSamples) => setSelectedCell({ key, samples: cellSamples })}
                        itemLabelSingular="muestra"
                        itemLabelPlural="muestras"
                    />
                </Map>
            </div>

            <PhysicoChemicalBoxplotPanel
                open={!!selectedCell}
                onClose={() => setSelectedCell(null)}
                cellSamples={selectedCell?.samples}
            />
        </>
    );
};

export default PhysicoChemicalAnalysis;
