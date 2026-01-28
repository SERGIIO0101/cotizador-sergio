import React from "react";

/**
 * Presupuesto
 * -----------------------
 * Muestra los servicios agregados al proyecto actual.
 * Permite eliminar servicios individuales.
 */
const Presupuesto = ({
  itemsProyecto,
  formatoMoneda,
  onEliminarItem
}) => {
  if (itemsProyecto.length === 0) return null;

  const total = itemsProyecto.reduce((acc, i) => acc + i.monto, 0);

  return (
    <div className="mt-6 border-t border-zinc-800 pt-4 space-y-2">
      <h3 className="text-xs text-zinc-400 uppercase mb-2">
        Resumen del proyecto
      </h3>

      {itemsProyecto.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center text-xs"
        >
          <div>
            <p className="text-zinc-300">{item.servicio}</p>
            <p className="text-[10px] text-zinc-500">
              {item.semanas} sem.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono">
              {formatoMoneda(item.monto)}
            </span>

            <button
              onClick={() => onEliminarItem(item.id)}
              className="text-red-500 text-[10px]"
              title="Eliminar"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-between text-yellow-500 font-bold pt-3 border-t border-zinc-800">
        <span>TOTAL</span>
        <span>{formatoMoneda(total)}</span>
      </div>
    </div>
  );
};

export default Presupuesto;
