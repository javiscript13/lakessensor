import React, { useEffect, useState } from 'react';
import { Rectangle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { zoomToCellSize, sessionsToCells } from '../utils/geoGrid';

const cellColor = (count) => {
    if (count >= 10) return '#1565c0';
    if (count >= 5)  return '#1e88e5';
    if (count >= 2)  return '#64b5f6';
    return '#bbdefb';
};

const ZoneGrid = ({ sessions, onCellClick }) => {
    const map = useMap();
    const [cells, setCells] = useState([]);

    const recalculate = () => {
        const zoom = map.getZoom();
        const cellSize = zoomToCellSize(zoom);
        const cellMap = sessionsToCells(sessions, cellSize);
        setCells([...cellMap.entries()].map(([key, data]) => ({ key, ...data })));
    };

    useEffect(() => {
        recalculate();
    }, [sessions]); // eslint-disable-line react-hooks/exhaustive-deps

    useMapEvents({
        zoomend: recalculate,
        moveend: recalculate,
    });

    return (
        <>
            {cells.map(({ key, bounds, sessions: cellSessions }) => (
                <Rectangle
                    key={key}
                    bounds={bounds}
                    pathOptions={{
                        color: cellColor(cellSessions.length),
                        fillColor: cellColor(cellSessions.length),
                        fillOpacity: 0.4,
                        weight: 1,
                    }}
                    eventHandlers={{
                        click: () => onCellClick(key, cellSessions),
                    }}
                >
                    <Tooltip sticky>
                        {cellSessions.length} sesión{cellSessions.length !== 1 ? 'es' : ''}
                    </Tooltip>
                </Rectangle>
            ))}
        </>
    );
};

export default ZoneGrid;
