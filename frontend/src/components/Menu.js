import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Container, Link } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Menu = () => {

    const [toggleMenu, setToggleMenu] = useState(false);

    const handleMenuClick = () => {
        setToggleMenu(!toggleMenu);
    }

    const pages = [
        {
            name: "Home",
            target: "/"
        },
        {
            name: "El proyecto",
            target: "/about"
        },
        {
            name: "Datos",
            target: "/data"
        },
        {
            name: "Cargar datos",
            target: "/form"
        },
        {
            name: "Recursos",
            target: "/ressources"
        },
        {
            name: "Contacto",
            target: "/contact"
        }
    ]

    return (
        <AppBar position="sticky">
            <Toolbar variant="regular" sx={{ display: 'flex', flexDirection: 'column' }}>
                <Container sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Box sx={{ display: { xs: 'flex' }, mr: 1 }} >
                        <Link href="/" sx={{ mt: 1, mb: 1 }}>
                            <img src="https://via.placeholder.com/60" alt="Logo" />
                        </Link>
                        <Typography sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                            NOMBRE SITIO
                        </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none', justifyContent: 'end' } }}>
                        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleMenuClick}>
                            <MenuIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', justifyContent: 'end' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page.name}
                                href={page.target}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                {page.name}
                            </Button>
                        ))}
                    </Box>
                </Container>
                {toggleMenu && (
                    <Container sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {pages.map((page) => (
                                <Button
                                    key={page.name}
                                    href={page.target}
                                    sx={{ color: 'white', display: 'flex', justifyContent: 'center' }}
                                >
                                    {page.name}
                                </Button>
                            ))}
                        </Box>
                    </Container>
                )}
            </Toolbar>
        </AppBar >
    );
}

export default Menu;