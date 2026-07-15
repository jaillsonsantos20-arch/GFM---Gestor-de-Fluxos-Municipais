import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import api from '../services/api';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  role: 'GESTOR' | 'OPERADOR_SETOR' | 'SECRETARIA' | 'FORNECEDOR';
  secretariaId?: string;
  setorId?: string;
  fornecedorId?: string;
  secretaria?: { nome: string; sigla: string } | null;
  setor?: { nome: string } | null;
  fornecedor?: { id: string; razaoSocial: string } | null;
}

interface LoginResponse {
  id: string;
  email: string;
  nome: string;
  role: 'GESTOR' | 'OPERADOR_SETOR' | 'SECRETARIA' | 'FORNECEDOR';
  secretariaId?: string;
  setorId?: string;
  fornecedorId?: string;
  secretaria?: { nome: string; sigla: string } | null;
  setor?: { nome: string } | null;
  fornecedor?: { id: string; razaoSocial: string } | null;
  accessToken: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const stored = localStorage.getItem('@gfm:user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('@gfm:token');
  });

  const login = useCallback(async (email: string, senha: string) => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      senha,
    });

    const { accessToken, ...usuarioData } = response.data;

    localStorage.setItem('@gfm:token', accessToken);
    localStorage.setItem('@gfm:user', JSON.stringify(usuarioData));

    setToken(accessToken);
    setUsuario(usuarioData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('@gfm:token');
    localStorage.removeItem('@gfm:user');

    setToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
