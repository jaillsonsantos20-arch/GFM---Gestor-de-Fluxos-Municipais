import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GestorRoute } from './components/GestorRoute';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Secretarias from './pages/Secretarias';
import Setores from './pages/Setores';
import Fornecedores from './pages/Fornecedores';
import Processos from './pages/Processos';
import ProcessoDetalhe from './pages/ProcessoDetalhe';
import ProcessoNovo from './pages/ProcessoNovo';
import ModelosFluxo from './pages/ModelosFluxo';
import NovoUsuario from './pages/NovoUsuario';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/secretarias" element={<GestorRoute><Secretarias /></GestorRoute>} />
            <Route path="/setores" element={<Setores />} />
            <Route path="/fornecedores" element={<GestorRoute><Fornecedores /></GestorRoute>} />
            <Route path="/processos" element={<Processos />} />
            <Route path="/processos/novo" element={<ProcessoNovo />} />
            <Route path="/processos/:id" element={<ProcessoDetalhe />} />
            <Route path="/modelos-fluxo" element={<GestorRoute><ModelosFluxo /></GestorRoute>} />
            <Route path="/usuarios/novo" element={<GestorRoute><NovoUsuario /></GestorRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
