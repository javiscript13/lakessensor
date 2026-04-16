import React, { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import Map from '../components/Map';
import { getAllReadings, getSessionReadings } from '../services/apiService';
import {
    Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableHead, TableBody, TableRow, TableCell,
} from '@mui/material';


const fmt = (val) => val != null ? val : '—';

const SessionMarker = ({ session }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [readings, setReadings] = useState([]);
    const [loadingReadings, setLoadingReadings] = useState(false);

    const handleOpenDialog = async () => {
        setDialogOpen(true);
        setLoadingReadings(true);
        try {
            const data = await getSessionReadings(session.id);
            setReadings(data);
        } finally {
            setLoadingReadings(false);
        }
    };

    return (
        <>
            <Marker position={[session.avgLat, session.avgLong]}>
                <Popup minWidth={280}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.5em', fontWeight: 'bold' }}>
                        Dispositivo {session.deviceName} — Sesión {session.id} ({new Date(session.oldestReadingTime).toLocaleString('es-GT')})
                    </h3>

                    <h4 style={{ margin: '8px 0 4px', fontSize: '1.2em', fontWeight: 'bold' }}>Lectura análoga</h4>
                    {session.analogReading ? (
                        <div>
                            Lluvia últimas 24hrs: {session.analogReading.rainPast24hrs ? 'Sí' : 'No'}<br />
                            Lugar de lectura: {session.analogReading.readingPlace}<br />
                            Escala Forel-Ule: {session.analogReading.forelUleScale}<br />
                            Disco Secchi: {session.analogReading.secchiDepth} cm
                        </div>
                    ) : (
                        <div>No tiene datos análogos</div>
                    )}

                    <h4 style={{ margin: '8px 0 4px', fontSize: '1.2em', fontWeight: 'bold' }}>Lectura digital (promedios)</h4>
                    <div>
                        Elevación: {fmt(session.avgElevation)} m<br />
                        Temp. agua: {fmt(session.avgWaterTemp)} °C<br />
                        Temp. aire: {fmt(session.avgAirTemp)} °C<br />
                        Humedad aire: {fmt(session.avgAirHumidity)} %<br />
                        PH: {fmt(session.avgPh)}
                    </div>

                    <Button
                        size="small"
                        variant="outlined"
                        style={{ marginTop: 10 }}
                        onClick={handleOpenDialog}
                    >
                        Ver datos completos
                    </Button>
                </Popup>
            </Marker>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Lecturas digitales — Dispositivo {session.deviceName}, Sesión {session.id}
                </DialogTitle>
                <DialogContent>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Lat</TableCell>
                                <TableCell>Long</TableCell>
                                <TableCell>Elevación (m)</TableCell>
                                <TableCell>Temp. agua (°C)</TableCell>
                                <TableCell>Temp. aire (°C)</TableCell>
                                <TableCell>Humedad (%)</TableCell>
                                <TableCell>PH</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingReadings ? (
                                <TableRow><TableCell colSpan={8}>Cargando...</TableCell></TableRow>
                            ) : readings.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell>{new Date(r.readDate).toLocaleString('es-GT')}</TableCell>
                                    <TableCell>{r.lat}</TableCell>
                                    <TableCell>{r.long}</TableCell>
                                    <TableCell>{r.elevation}</TableCell>
                                    <TableCell>{r.waterTemp}</TableCell>
                                    <TableCell>{r.airTemp}</TableCell>
                                    <TableCell>{r.airHumidity}</TableCell>
                                    <TableCell>{r.ph}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};


const Data = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllReadings = async () => {
            try {
                const data = await getAllReadings();
                setSessions(data.filter(s => s.avgLat != null && s.avgLong != null));
            } catch (error) {
                console.error('Error fetching readings', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllReadings();
    }, []);

    const bounds = sessions.map(s => [s.avgLat, s.avgLong]);

    return (
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
            <Map center={[15, -90.5]} zoom={9} bounds={bounds.length > 0 ? bounds : null}>
                <MarkerClusterGroup>
                    {sessions.map(session => (
                        <SessionMarker key={session.id} session={session} />
                    ))}
                </MarkerClusterGroup>
            </Map>
        </div>
    );
};

export default Data;
