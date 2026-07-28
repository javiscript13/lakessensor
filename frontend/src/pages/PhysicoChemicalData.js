import React, { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import Map from '../components/Map';
import { getAllLakeSamples } from '../services/apiService';
import { CircularProgress } from '@mui/material';

const fmt = (val, unit = '') => val != null ? `${val}${unit}` : '—';

const SampleMarker = ({ sample }) => {
    return (
        <Marker position={[sample.lat, sample.long]}>
            <Popup minWidth={280}>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.5em', fontWeight: 'bold' }}>
                    {sample.lakeName} — Muestra {sample.id}
                </h3>

                <h4 style={{ margin: '8px 0 4px', fontSize: '1.2em', fontWeight: 'bold' }}>Datos generales</h4>
                <div>
                    Fecha de muestreo: {fmt(sample.samplingDate)}<br />
                    Fecha de análisis: {fmt(sample.analysisDate)}<br />
                    Laboratorio: {fmt(sample.laboratory)}<br />
                    Analista: {fmt(sample.analyst)}<br />
                    {sample.observations && <>Observaciones: {sample.observations}<br /></>}
                </div>

                <h4 style={{ margin: '8px 0 4px', fontSize: '1.2em', fontWeight: 'bold' }}>Resultados</h4>
                <div>
                    Conductividad: {fmt(sample.conductivity, ' µS/cm')}<br />
                    Sólidos disueltos totales: {fmt(sample.totalDissolvedSolids, ' mg/L')}<br />
                    Nitratos: {fmt(sample.nitrates, ' mg/L')}<br />
                    Nitritos: {fmt(sample.nitrites, ' mg/L')}<br />
                    Fosfatos: {fmt(sample.phosphates, ' mg/L')}<br />
                    Amonio: {fmt(sample.ammonium, ' mg/L')}<br />
                    Fósforo total: {fmt(sample.totalPhosphorus, ' mg/L')}<br />
                    Nitrógeno total: {fmt(sample.totalNitrogen, ' mg/L')}<br />
                    Sulfatos: {fmt(sample.sulfates, ' mg/L')}
                </div>
            </Popup>
        </Marker>
    );
};

const PhysicoChemicalData = () => {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllLakeSamples = async () => {
            try {
                const data = await getAllLakeSamples();
                setSamples(data.filter(s => s.lat != null && s.long != null));
            } catch (error) {
                console.error('Error fetching lake samples', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllLakeSamples();
    }, []);

    const bounds = samples.map(s => [s.lat, s.long]);

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
                    {samples.map(sample => (
                        <SampleMarker key={sample.id} sample={sample} />
                    ))}
                </MarkerClusterGroup>
            </Map>
        </div>
    );
};

export default PhysicoChemicalData;
