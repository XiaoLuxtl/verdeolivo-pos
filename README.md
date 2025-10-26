# 🌿 VerdeOlivo POS

Un sistema de **Punto de Venta (POS) ligero y de uso local** diseñado para facilitar la gestión de ventas y el cálculo de costos de productos, específicamente orientado a la operación de un negocio tipo club de nutrición o punto de venta de productos **Herbalife**.

Este proyecto se enfoca en la **usabilidad y rapidez de la venta**, presentando una interfaz de usuario inspirada en los sistemas POS de restaurantes, donde los productos (recetas) son el centro de la transacción.

## ✨ Características Principales

* **Punto de Venta (POS):** Interfaz intuitiva para seleccionar categorías y productos/recetas (como "Malteadas"), agregarlos al carrito y finalizar la venta.
* **Gestión de Recetas:** Permite definir recetas, incluyendo sus ingredientes y el precio de venta.
* **Inventario y Productos:** Módulo para gestionar el inventario de materias primas (productos) con seguimiento de stock mínimo.
* **Dashboard Administrativo:** Vista general con métricas clave como productos registrados, stock total, recetas activas, ventas del día y margen de ganancia.
* **Cálculo de Costos:** Al estar basado en recetas con ingredientes de inventario, el sistema puede calcular el costo de los productos vendidos para determinar el margen de ganancia.

## ⚠️ Filosofía del Proyecto y Seguridad

Este proyecto es un **"pseudo-POS"** enfocado en la funcionalidad local y la sencillez.

* **Uso Local Solamente:** Está diseñado para ser usado en un entorno de confianza (localmente o en una red privada).
* **Sin Seguridad:** **No incluye autenticación de usuarios, contraseñas ni permisos.** Se prioriza la agilidad en la operación y la facilidad de uso. **No debe utilizarse en entornos donde la seguridad sea crítica.**
* **Base de Datos Local:** Utiliza Prisma con una base de datos liviana (SQLite por defecto) para mantener la operación en un solo entorno.

---

## 💻 Tecnología

El proyecto está construido con el *stack* moderno de JavaScript:

* **Framework:** [Next.js](https://nextjs.org) (v15+)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Base de Datos & ORM:** [Prisma](https://www.prisma.io/)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Componentes:** [shadcn/ui](https://ui.shadcn.com/) (basado en Radix UI)

---

## 🚀 Cómo Empezar

### Prerrequisitos

Necesitas tener instalado [Node.js](https://nodejs.org/en) (versión 18 o superior) y una herramienta de gestión de paquetes (npm, yarn o pnpm).

### 1. Clonar el Repositorio

```bash
git clone [URL-DE-TU-REPOSITORIO]
cd verdeolivo-pos
```

### 2. Instalación de Dependencias

Usa tu gestor de paquetes preferido:

```bash
pnpm install
# o
npm install
# o
yarn install
```

### 3. Configuración de la Base de Datos

Este proyecto utiliza **Prisma**. Antes de ejecutarlo, debes generar el cliente y configurar la base de datos (por defecto, usa un archivo `dev.db`):

```bash
# Genera el cliente de Prisma y aplica las migraciones
pnpm prisma migrate dev --name init

# Opcional: Ejecutar el script para poblar con datos de prueba
tsx scripts/seed-test-data.ts
```

### 4. Ejecutar el Servidor de Desarrollo

Puedes iniciar el servidor en el puerto por defecto (3000) o en el puerto 5214 (como se define en el script `dev-custom`):

```bash
# Iniciar en http://localhost:3000 (o el puerto por defecto de Next.js)
pnpm dev

# O iniciar en http://localhost:5214
pnpm dev-custom
```

Abre [`http://localhost:3000`](http://localhost:3000) (o el puerto que hayas elegido) con tu navegador para ver el resultado.