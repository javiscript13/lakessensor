// Cell size in decimal degrees per zoom level
const ZOOM_TO_CELL_SIZE = {
    4:  4.0,
    5:  2.0,
    6:  1.0,
    7:  0.5,
    8:  0.25,
    9:  0.2,
    10: 0.1,
    11: 0.05,
    12: 0.02,
    13: 0.01,
};
const MIN_ZOOM = Math.min(...Object.keys(ZOOM_TO_CELL_SIZE).map(Number));
const MAX_ZOOM = Math.max(...Object.keys(ZOOM_TO_CELL_SIZE).map(Number));

export const zoomToCellSize = (zoom) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(zoom)));
    return ZOOM_TO_CELL_SIZE[clamped];
};

export const latLongToCell = (lat, lng, cellSize) => {
    const cellLat = Math.floor(lat / cellSize) * cellSize;
    const cellLng = Math.floor(lng / cellSize) * cellSize;
    return `${cellLat.toFixed(6)}__${cellLng.toFixed(6)}`;
};

// Returns a Map<cellKey, { sessions, bounds: [[minLat, minLng], [maxLat, maxLng]] }>
export const sessionsToCells = (sessions, cellSize) => {
    const cells = new Map();
    for (const session of sessions) {
        if (session.avgLat == null || session.avgLong == null) continue;
        const key = latLongToCell(session.avgLat, session.avgLong, cellSize);
        if (!cells.has(key)) {
            const minLat = Math.floor(session.avgLat / cellSize) * cellSize;
            const minLng = Math.floor(session.avgLong / cellSize) * cellSize;
            cells.set(key, {
                sessions: [],
                bounds: [[minLat, minLng], [minLat + cellSize, minLng + cellSize]],
            });
        }
        cells.get(key).sessions.push(session);
    }
    return cells;
};
