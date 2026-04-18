# Restaurant Management — Frontend

Sistema de gestión para restaurante peruano. Interfaz web para administración de pedidos, mesas, carta y cocina.

## Stack

- **React 19** + TypeScript
- **Vite 7**
- **Tailwind CSS**
- **React Query v3** — cache y sincronización de datos
- **Zustand v5** — estado de autenticación
- **React Router DOM** — navegación
- **Axios** — cliente HTTP

## Roles y acceso

| Rol | Rutas disponibles |
|-----|------------------|
| `ADMIN` | Dashboard, Pedidos, Cocina, Mesas, Carta |
| `CASHIER` | Dashboard, Pedidos, Mesas |
| `WAITER` | Pedidos, Mesas |
| `CHEF` | Cocina |

## Funcionalidades

- **Dashboard** — métricas de ventas, balance, productos top, transacciones recientes
- **Pedidos** — gestión de órdenes activas (DINE_IN, TAKEAWAY, DELIVERY)
- **Mesas** — vista de mesas con estado, agregar/editar items por mesa
- **Carta** — administración de productos y categorías
- **Cocina** — vista para chef con pedidos IN_PROGRESS y botón "Marcar como Listo"
- **Pagos** — pago total y parcial con múltiples métodos (efectivo, tarjeta, Yape)

## Flujo de estado de pedidos

```
CREATED → IN_PROGRESS → READY → PAID
                              ↘ PARTIALLY_PAID → PAID
         CANCELLED (en cualquier punto)
```

## Instalación

```bash
npm install
npm run dev
```

Requiere backend corriendo en el puerto configurado en `.env`.

## Variables de entorno

```env
VITE_API_URL=http://localhost:8080
```
