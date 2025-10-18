import { Package, Warehouse, ChefHat, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-base-content mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Productos */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-base-content">Productos</h2>
                <p className="text-3xl font-bold text-primary">0</p>
              </div>
              <Package className="w-12 h-12 text-primary opacity-50" />
            </div>
          </div>
        </div>

        {/* Card Inventario */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-base-content">Items en Stock</h2>
                <p className="text-3xl font-bold text-secondary">0</p>
              </div>
              <Warehouse className="w-12 h-12 text-secondary opacity-50" />
            </div>
          </div>
        </div>

        {/* Card Recetas */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-base-content">Recetas</h2>
                <p className="text-3xl font-bold text-accent">0</p>
              </div>
              <ChefHat className="w-12 h-12 text-accent opacity-50" />
            </div>
          </div>
        </div>

        {/* Card Ventas Hoy */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-base-content">Ventas Hoy</h2>
                <p className="text-3xl font-bold text-success">$0</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-success opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Sección de acceso rápido */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-base-content mb-4">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/productos" className="btn btn-primary btn-lg">
            <Package className="w-5 h-5 mr-2" />
            Gestionar Productos
          </a>
          <a href="/admin/recetas" className="btn btn-secondary btn-lg">
            <ChefHat className="w-5 h-5 mr-2" />
            Gestionar Recetas
          </a>
          <a href="/admin/compras" className="btn btn-accent btn-lg">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Registrar Compra
          </a>
        </div>
      </div>
    </div>
  );
}
