import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from "./components/PrivateRoute";

const homeModule = import(/* webpackPrefetch: true */ './pages/Home');
const aboutModule = import(/* webpackPrefetch: true */ './pages/About');
const dataHubModule = import(/* webpackPrefetch: true */ './pages/DataHub');
const dataModule = import(/* webpackPrefetch: true */ './pages/Data');
const dataAnalysisModule = import(/* webpackPrefetch: true */ './pages/DataAnalysis');
const dataFormModule = import(/* webpackPrefetch: true */ './pages/DataForm');
const ressourcesModule = import(/* webpackPrefetch: true */ './pages/Ressources');
const contactModule = import(/* webpackPrefetch: true */ './pages/Contact');
const noMatchModule = import(/* webpackPrefetch: true */ './pages/NoMatch');

const Home = React.lazy(() => homeModule);
const About = React.lazy(() => aboutModule);
const DataHub = React.lazy(() => dataHubModule);
const Data = React.lazy(() => dataModule);
const DataAnalysis = React.lazy(() => dataAnalysisModule);
const DataForm = React.lazy(() => dataFormModule);
const Ressources = React.lazy(() => ressourcesModule);
const Contact = React.lazy(() => contactModule);
const NoMatch = React.lazy(() => noMatchModule);

const AppRoutes = () => {
    return (
        <React.Suspense fallback={null}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/datos" element={<DataHub />} />
                <Route path="/datos/lecturas" element={<Data />} />
                <Route path="/datos/analisis" element={<DataAnalysis />} />
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
