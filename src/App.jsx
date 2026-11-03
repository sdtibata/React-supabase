// src/App.jsx
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Login from './componentes/login'
import Registro from './componentes/registro'
import Perfil from './componentes/perfil'
import Dashboard from './componentes/dashboard'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // 1. ¿Ya había una sesión abierta?
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
      setCargando(false)
    })

    // 2. Escuchar cuando alguien entra o sale
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_evento, session) => setUsuario(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  if (cargando) return <p>Cargando...</p>

  // Si no hay sesión, cualquier ruta privada manda al login
  const privada = (componente) => (usuario ? componente : <Navigate to="/login" />)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={usuario ? <Navigate to="/perfil" /> : <Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/perfil" element={privada(<Perfil />)} />
        <Route path="/dashboard" element={privada(<Dashboard />)} />
        <Route path="*" element={<Navigate to="/perfil" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
