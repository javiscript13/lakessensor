import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardContent, CardActionArea, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

const visualizations = [
    {
        title: "Todas las lecturas",
        description: "Mapa interactivo con todas las sesiones de lectura. Visualiza datos digitales y análogos por ubicación.",
        icon: <MapIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
        path: "/datos/lecturas",
    },
    {
        title: "Análisis temporal",
        description: "Analiza la distribución de pH, temperatura y disco Secchi a lo largo del tiempo por zona geográfica.",
        icon: <QueryStatsIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
        path: "/datos/analisis",
    },
];

const DataHub = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>
                Visualización de datos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Selecciona el tipo de visualización que deseas explorar.
            </Typography>
            <Grid container spacing={4}>
                {visualizations.map((viz) => (
                    <Grid item xs={12} sm={6} key={viz.title}>
                        <Card sx={{ height: '100%' }}>
                            <CardActionArea
                                onClick={() => navigate(viz.path)}
                                sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                {viz.icon}
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" gutterBottom>
                                        {viz.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {viz.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default DataHub;
