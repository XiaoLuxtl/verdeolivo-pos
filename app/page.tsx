export default function POSPage() {
  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-base-content">
            Punto de Venta
          </h1>
          <a href="/admin" className="btn btn-primary">
            Ir a Admin
          </a>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center py-20">
            <h2 className="card-title text-2xl mb-4">Sistema POS</h2>
            <p className="text-base-content/70">
              El sistema de punto de venta se implementará en la siguiente fase.
            </p>
            <p className="text-sm text-base-content/50 mt-4">
              Por ahora, accede a Admin para configurar productos y recetas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
