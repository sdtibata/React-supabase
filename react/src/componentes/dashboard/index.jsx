// src/componentes/dashboard/index.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'

function Dashboard() {
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  // 1. Solo entra el admin
  useEffect(() => {
    async function verificarYCargar() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: yo } = await supabase
        .from('usuario').select('rol').eq('id', user.id).single()

      if (yo?.rol !== 'admin') {
        navigate('/perfil')
        return
      }
      await cargarDatos()
      setCargando(false)
    }
    verificarYCargar()
  }, [])

  // 2. Usuarios con sus imágenes en UNA consulta (join por llave foránea)
  const cargarDatos = async () => {
    const { data, error } = await supabase
      .from('usuario')
      .select('id, nombre, correo, telefono, rol, creado_en, multimedia(id, url)')
      .order('creado_en', { ascending: false })
    if (!error) setUsuarios(data)
  }

  // 3. Indicadores calculados con los datos que ya tenemos
  const totalImagenes = usuarios.reduce((s, u) => s + u.multimedia.length, 0)
  const admins = usuarios.filter((u) => u.rol === 'admin').length
  const haceUnaSemana = Date.now() - 7 * 24 * 60 * 60 * 1000
  const nuevos = usuarios.filter(
    (u) => new Date(u.creado_en) > haceUnaSemana
  ).length
  const maxImagenes = Math.max(1, ...usuarios.map((u) => u.multimedia.length))

  const indicadores = [
    ['Usuarios', usuarios.length],
    ['Administradores', admins],
    ['Imágenes', totalImagenes],
    ['Nuevos (7 días)', nuevos],
  ]

  const filtrados = usuarios.filter((u) =>
    `${u.nombre} ${u.correo}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  // 4. Editar y borrar (RLS lo permite porque somos admin)
  const cambiarCampo = (id, campo, valor) =>
    setUsuarios(usuarios.map((u) =>
      (u.id === id ? { ...u, [campo]: valor } : u)))

  const guardar = async (u) => {
    const { error } = await supabase
      .from('usuario')
      .update({ nombre: u.nombre, telefono: u.telefono })
      .eq('id', u.id)
    alert(error ? 'No se pudo guardar' : `Guardado: ${u.nombre}`)
  }

  const borrarImagen = async (imagenId) => {
    const { error } = await supabase
      .from('multimedia').delete().eq('id', imagenId)
    if (!error) cargarDatos()
  }

  if (cargando) return <p className="p-4">Cargando...</p>

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Dashboard</h1>
        <button className="btn btn-outline-secondary"
          onClick={() => navigate('/perfil')}>Mi perfil</button>
      </div>

      <div className="row g-3 mb-4">
        {indicadores.map(([titulo, valor]) => (
          <div className="col-6 col-md-3" key={titulo}>
            <div className="card text-center h-100">
              <div className="card-body">
                <div className="text-muted small">{titulo}</div>
                <div className="fs-2 fw-bold">{valor}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5">Imágenes por usuario</h2>
          {usuarios.map((u) => (
            <div className="d-flex align-items-center gap-2 mb-2" key={u.id}>
              <span className="w-25 text-truncate">{u.nombre}</span>
              <div className="progress flex-grow-1">
                <div className="progress-bar"
                  style={{ width: `${(u.multimedia.length / maxImagenes) * 100}%` }}>
                  {u.multimedia.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center gap-3">
            <h2 className="h5 mb-0">Usuarios</h2>
            <input className="form-control w-auto"
              placeholder="Buscar por nombre o correo" value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mt-3">
              <thead>
                <tr>
                  <th>Nombre</th><th>Correo</th><th>Teléfono</th>
                  <th>Rol</th><th>Imágenes</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <input className="form-control form-control-sm"
                        value={u.nombre} onChange={(e) =>
                          cambiarCampo(u.id, 'nombre', e.target.value)} />
                    </td>
                    <td>{u.correo}</td>
                    <td>
                      <input className="form-control form-control-sm"
                        value={u.telefono ?? ''} onChange={(e) =>
                          cambiarCampo(u.id, 'telefono', e.target.value)} />
                    </td>
                    <td>
                      <span className={`badge ${u.rol === 'admin'
                        ? 'text-bg-warning' : 'text-bg-primary'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td>
                      {u.multimedia.map((img) => (
                        <img key={img.id} src={img.url} alt=""
                          width="40" height="40" title="Clic para borrar"
                          className="rounded object-fit-cover me-1"
                          onClick={() => borrarImagen(img.id)} />
                      ))}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary"
                        onClick={() => guardar(u)}>Guardar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
