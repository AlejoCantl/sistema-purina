'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './recepcionista.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

function RecepcionDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    estadisticas: {
      totalProductos: 0,
      stockBajo: 0,
      entradasMes: 0,
      salidasMes: 0
    },
    alertas: [],
    productos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bodega');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        console.error('Error en la API:', data.message);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getStatusClass = (stockActual, stockMinimo) => {
    return stockActual <= stockMinimo ? styles.statusAlert : styles.statusOk;
  };

  const getStatusText = (stockActual, stockMinimo) => {
    if (stockActual === 0) return 'Agotado';
    if (stockActual <= stockMinimo) return 'Bajo';
    return 'Normal';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  const { estadisticas, alertas, productos } = dashboardData;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Dashboard - Recepcion</h1>
          <div className={styles.userInfo}>
            <span>Bienvenido, {user?.nombre}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statInfo}>
              <h3>Total Productos</h3>
              <span className={styles.statNumber}>{estadisticas.totalProductos}</span>
              <span className={styles.statLabel}>en inventario</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚠️</div>
            <div className={styles.statInfo}>
              <h3>Stock Bajo</h3>
              <span className={styles.statNumber}>{estadisticas.stockBajo}</span>
              <span className={styles.statLabel}>productos</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📤</div>
            <div className={styles.statInfo}>
              <h3>Salidas/Ventas</h3>
              <span className={styles.statNumber}>{estadisticas.salidasMes}</span>
              <span className={styles.statLabel}>este mes</span>
            </div>
          </div>
        </div>
      
          <div className={styles.actionsSection}>
            <h2>Acciones Rápidas</h2>
            <div className={styles.actionsGrid}>
              <button className={styles.actionButton} 
              onClick={() => router.push('/dashboard/recepcionista/salidas')}>
                <span className={styles.actionIcon}>📤</span>
                <span>Registrar Salidas/Ventas</span>
              </button>
            </div>
          </div>

        <div className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2>Productos en Bodega ({productos.length})</h2>
            <button 
              className={styles.refreshButton}
              onClick={cargarDashboard}
              disabled={loading}
            >
              Actualizar
            </button>
          </div>
          
          <div className={styles.productsTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Marca</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <div className={styles.productName}>
                        <strong>{producto.nombre}</strong>
                        {producto.descripcion && (
                          <small>{producto.descripcion}</small>
                        )}
                      </div>
                    </td>
                    <td>{producto.marca}</td>
                    <td>
                      <span className={
                        producto.stock_actual <= producto.stock_minimo ? 
                        styles.stockLow : styles.stockNormal
                      }>
                        {producto.stock_actual}
                      </span>
                    </td>
                    <td>{producto.stock_minimo}</td>
                    <td>{producto.ubicacion_bodega || 'Sin ubicación'}</td>
                    <td>
                      <span className={getStatusClass(producto.stock_actual, producto.stock_minimo)}>
                        {getStatusText(producto.stock_actual, producto.stock_minimo)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BodegaDashboard() {
  return (
    <ProtectedRoute requiredRole="inventario">
      <RecepcionDashboardContent />
    </ProtectedRoute>
  );
}