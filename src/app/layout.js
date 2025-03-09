"use client";
import { useState, createContext } from "react";
import React from "react";
import "./globals.css";

// Crear el contexto de autenticación
export const AuthContext = createContext();

export default function RootLayout({ children }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password }),
      });
  
      const result = await response.json();
  
      if (response.ok && result.success) {
        setIsAuthenticated(true);
        setUserData(result.userData || { user });
      } else {
        setError(result.error || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión al verificar las credenciales");
    } finally {
      setLoading(false);
    }
  };
  

  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-6">
          <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="font-medium">Username:</label>
                <input
                  type="username"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="border p-2 rounded-md w-full"
                  placeholder="Ingresa tu email de empresa"
                  required
                />
              </div>
              <div>
                <label className="font-medium">Contraseña:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border p-2 rounded-md w-full"
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !user || !password}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </button>
              {error && <p className="text-red-500 text-center">{error}</p>}
            </form>
          </div>
        </body>
      </html>
    );
  }

  // Una vez autenticado, proveemos el contexto a los componentes hijos
  return (
    <html lang="en">
      <body>
        <AuthContext.Provider value={{ userData }}>
          {children}
        </AuthContext.Provider>
      </body>
    </html>
  );
}
