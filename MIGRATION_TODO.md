# 🔄 Migración de Tipos - Lista de TODO

## 📋 **Archivos a Migrar**

### 1. **CompraForm Components** (`components/forms/CompraForm/`)
- ✅ `types.ts` - Definiciones duplicadas: `Producto`, `DetalleCompra`, `CompraFormData`, `CompraFormProps`
- 🔄 `useCompraForm.ts` - Importa desde `./types`
- 🔄 `ProductoSearchSelect.tsx` - Importa desde `./types`
- 🔄 `DetalleCompraCard.tsx` - Importa desde `./types`
- 🔄 `CompraForm.tsx` - Importa desde `./types`

### 2. **Reportes Components** (`components/reportes/`)
- 🔄 `ReporteDetallado.tsx` - Definiciones duplicadas de `ReporteVentas` y `ReporteInventario`
- 🔄 `VentasStats.tsx` - Definición duplicada de `ReporteVentas`
- 🔄 `TopRecetasTable.tsx` - Definición duplicada de `ReporteVentas`
- 🔄 `ProductosMovidosTable.tsx` - Definición duplicada de `ReporteInventario`
- 🔄 `MovimientosCategoria.tsx` - Definición duplicada de `ReporteInventario`
- 🔄 `InventarioStats.tsx` - Definición duplicada de `ReporteInventario`
- 🔄 `AlertasInventario.tsx` - Definición duplicada de `ReporteInventario`

### 3. **Otros Components**
- 🔄 `IngredientesModal.tsx` - Definición duplicada de `Producto`
- 🔄 `RecetaCard.tsx` - Props interface (posiblemente usar tipos centralizados)
- ✅ `CheckoutModal.tsx` - Ya usa `@/types/cart`
- ✅ `CartSidebar.tsx` - Ya usa `@/types/cart`

### 4. **Tipos Adicionales a Considerar**
- `DetalleCompra` - Definido en CompraForm/types.ts
- `CompraFormData` - Definido en CompraForm/types.ts
- Interfaces de props en componentes individuales

## 🎯 **Plan de Migración (1 por 1)**

### Fase 1: CompraForm ✅ COMPLETADA
1. ✅ **Añadidos tipos centralizados**: `DetalleCompra`, `CompraFormData` en `/types/compra.ts`
2. ✅ **Añadido `CompraFormProps`** en `/types/ui.ts`
3. ✅ **Actualizados imports** en 5 archivos de CompraForm
4. ✅ **Eliminado** `CompraForm/types.ts` duplicado
5. ✅ **Verificada** compatibilidad - Sin errores de tipos

### Fase 2: Reportes ✅ COMPLETADA
4. ✅ **Eliminadas** definiciones duplicadas en 7 componentes
5. ✅ **Actualizados imports** para usar `@/types/reporte`
6. ✅ **Verificada** compatibilidad - Sin errores de tipos

### Fase 3: Otros ✅ COMPLETADA
7. ✅ **Migrados** `IngredientesModal.tsx`, `ProductoForm.tsx`, `RecetaForm.tsx`
8. ✅ **Verificado** - No quedan tipos duplicados críticos

## ✅ **Archivos Ya Migrados**
- **CompraForm Components** - Todos los 5 archivos ✅
- **Reportes Components** - Todos los 7 archivos ✅
- `CheckoutModal.tsx` - Usa `@/types/cart` ✅
- `CartSidebar.tsx` - Usa `@/types/cart` ✅

## 🔍 **Comandos Útiles**
```bash
# Buscar definiciones duplicadas
grep -r "interface.*Producto" components/
grep -r "type ReporteVentas" components/

# Verificar imports
grep -r "from.*types" components/

## 📊 **MIGRACIÓN COMPLETA** ✅
- ✅ **Fase 1**: 5 componentes de CompraForm migrados
- ✅ **Fase 2**: 7 componentes de Reportes migrados
- ✅ **Fase 3**: 3 componentes adicionales migrados
- 🎯 **Total migrado**: 15 componentes
- 🎯 **Tipos centralizados añadidos**: `DetalleCompra`, `CompraFormData`, `CompraFormProps`, `Receta`, `RecetaFormData`, `IngredienteFormData`
- 🎯 **Compilación**: ✅ Sin errores de tipos
- 🎯 **Tipos centralizados**: `DetalleCompra`, `CompraFormData`, `CompraFormProps`, `ReporteVentas`, `ReporteInventario`
```