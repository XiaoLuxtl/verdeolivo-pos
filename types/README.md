# 📁 Estructura de Tipos

## Organización

Los tipos están organizados por dominio/módulo para mantener el código limpio y escalable:

- `api.ts` - Tipos comunes para respuestas de API y paginación
- `cart.ts` - Tipos relacionados con el carrito de compras
- `producto.ts` - Tipos para productos e inventario
- `venta.ts` - Tipos para ventas y detalles
- `reporte.ts` - Tipos para reportes y estadísticas
- `index.ts` - Exportaciones centralizadas

## Uso

```typescript
// Importar desde el índice central
import { Producto, CartItem, ApiResponse } from '@/types';

// O importar tipos específicos
import type { ProductoConInventario } from '@/types/producto';
```

## Convenciones

- Usar `interface` para objetos que puedan extenderse
- Usar `type` para uniones, aliases y tipos primitivos
- Prefijar interfaces con "Con" para versiones extendidas (ej: `ProductoConInventario`)
- Mantener consistencia con los tipos generados por Prisma