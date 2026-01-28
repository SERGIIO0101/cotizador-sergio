import React from "react";

const Historial = ({ historial, onEliminar }) => {
  if (historial.length === 0) {
    return (
      <p className="text-zinc-500 text-xs mt-4">
        No hay trabajos registrados.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-yellow-500 text-sm font-bold mb-2">
        Historial de trabajos
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-zinc-800">
          <thead className="bg-zinc-900">
            <tr>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Servicio</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-center">Acción</th>
            </tr>
          </thead>

          <tbody>
            {historial.map((item, index) => (
              <tr
                key={item.id}
                className="border-t border-zinc-800"
              >
                <td className="p-2">{item.cliente}</td>
                <td className="p-2">{item.servicio}</td>
                <td className="p-2 text-right text-green-400">
                  ${item.total.toLocaleString()}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => onEliminar(item.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Historial;
