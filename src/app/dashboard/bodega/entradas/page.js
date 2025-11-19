'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './entradas.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

function EntradasContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    producto_id: '',
    proveedor_id: '',
    cantidad: '',
    precio_unitario: '',
    numero_lote: '',
    fecha_entrada: new Date().toISOString().split('T')[0],
    fecha_caducidad: '',
    recibido_por: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bodega/entradas');
      const data = await response.json();
      
      if (data.success) {
        setProductos(data.data.productos);
        setProveedores(data.data.proveedores);
        setEntradas(data.data.entradas);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setMessage({ type: 'error', text: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/bodega/entradas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          registrado_por: user.id,
          cantidad: parseInt(formData.cantidad),
          precio_unitario: parseFloat(formData.precio_unitario)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Entrada registrada exitosamente' });
        
        // Limpiar formulario
        setFormData({
          producto_id: '',
          proveedor_id: '',
          cantidad: '',
          precio_unitario: '',
          numero_lote: '',
          fecha_entrada: new Date().toISOString().split('T')[0],
          fecha_caducidad: '',
          recibido_por: '',
          observaciones: ''
        });

        // Recargar datos
        await cargarDatos();

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al registrar entrada' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button 
              onClick={() => router.push('/dashboard/bodega')}
              className={styles.backButton}
            >
              ← Volver
            </button>
            <h1>Registro de Entradas</h1>
          </div>
          <div className={styles.userInfo}>
            <span>Bienvenido, {user?.nombre}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h2>📥 Nueva Entrada de Inventario</h2>
            
            {message.text && (
              <div className={message.type === 'success' ? styles.messageSuccess : styles.messageError}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="producto_id">Producto *</label>
                  <select
                    id="producto_id"
                    name="producto_id"
                    value={formData.producto_id}
                    onChange={handleChange}
                    required
                    className={styles.select}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - {producto.marca} (Stock: {producto.stock_actual})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="proveedor_id">Proveedor</label>
                  <select
                    id="proveedor_id"
                    name="proveedor_id"
                    value={formData.proveedor_id}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Seleccionar proveedor (opcional)</option>
                    {proveedores.map(proveedor => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre} - {proveedor.contacto}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="cantidad">Cantidad *</label>
                  <input
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    required
                    min="1"
                    className={styles.input}
                    placeholder="Ingrese cantidad"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="precio_unitario">Precio Unitario *</label>
                  <input
                    type="number"
                    id="precio_unitario"
                    name="precio_unitario"
                    value={formData.precio_unitario}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className={styles.input}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="numero_lote">Número de Lote</label>
                  <input
                    type="text"
                    id="numero_lote"
                    name="numero_lote"
                    value={formData.numero_lote}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Ej: LOTE-2025-001"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="fecha_entrada">Fecha de Entrada *</label>
                  <input
                    type="date"
                    id="fecha_entrada"
                    name="fecha_entrada"
                    value={formData.fecha_entrada}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="fecha_caducidad">Fecha de Caducidad</label>
                  <input
                    type="date"
                    id="fecha_caducidad"
                    name="fecha_caducidad"
                    value={formData.fecha_caducidad}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="recibido_por">Recibido Por</label>
                  <input
                    type="text"
                    id="recibido_por"
                    name="recibido_por"
                    value={formData.recibido_por}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Nombre de quien recibió"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows="3"
                  placeholder="Notas adicionales sobre esta entrada..."
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/bodega')}
                  className={styles.buttonSecondary}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.buttonPrimary}
                >
                  {submitting ? 'Registrando...' : 'Registrar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className={styles.historySection}>
          <div className={styles.card}>
            <h2>📋 Entradas Recientes</h2>
            {entradas.length > 0 ? (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Proveedor</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Lote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entradas.map((entrada) => (
                      <tr key={entrada.id}>
                        <td>
                          {new Date(entrada.fecha_entrada).toLocaleDateString('es-ES')}
                        </td>
                        <td>
                          <div className={styles.productInfo}>
                            <strong>{entrada.producto_nombre}</strong>
                            <small>{entrada.producto_marca}</small>
                          </div>
                        </td>
                        <td>{entrada.proveedor_nombre || 'N/A'}</td>
                        <td>
                          <span className={styles.badge}>{entrada.cantidad}</span>
                        </td>
                        <td>${parseFloat(entrada.precio_unitario).toFixed(2)}</td>
                        <td>
                          <small>{entrada.numero_lote || 'N/A'}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No hay entradas registradas</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EntradasPage() {
  return (
    <ProtectedRoute requiredRole="bodega">
      <EntradasContent />
    </ProtectedRoute>
  );
}