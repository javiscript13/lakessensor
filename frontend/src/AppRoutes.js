import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Data = React.lazy(() => import('./pages/Data'));
const DataForm = React.lazy(() => import('./pages/DataForm'));
const Ressources = React.lazy(() => import('./pages/Ressources'));
const Contact = React.lazy(() => import('./pages/Contact'));
const NoMatch = React.lazy(() => import('./pages/NoMatch'));

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/data" element={<Data />} />
            <Route path="/form" element={<DataForm />} />
            <Route path="/ressources" element={<Ressources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NoMatch />} />
        </Routes>
    )
}

export default AppRoutes;