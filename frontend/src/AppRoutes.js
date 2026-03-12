import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from "./components/PrivateRoute";

const Home = React.lazy(() => import(/* webpackPrefetch: true */ './pages/Home'));
const About = React.lazy(() => import(/* webpackPrefetch: true */ './pages/About'));
const Data = React.lazy(() => import(/* webpackPrefetch: true */ './pages/Data'));
const DataForm = React.lazy(() => import(/* webpackPrefetch: true */ './pages/DataForm'));
const Ressources = React.lazy(() => import(/* webpackPrefetch: true */ './pages/Ressources'));
const Contact = React.lazy(() => import(/* webpackPrefetch: true */ './pages/Contact'));
const NoMatch = React.lazy(() => import(/* webpackPrefetch: true */ './pages/NoMatch'));

const AppRoutes = () => {
    return (
        <React.Suspense fallback={null}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/data" element={<Data />} />
                <Route path="/form" element={
                    <PrivateRoute>
                        <DataForm/>
                    </PrivateRoute>
                }/>
                <Route path="/ressources" element={<Ressources />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NoMatch />} />
            </Routes>
        </React.Suspense>
    )
}

export default AppRoutes;
