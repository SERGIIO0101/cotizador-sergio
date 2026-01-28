import React from "react";

/**
 * Panel de Ajustes de DevGuard
 * - Edita tarifas
 * - Permite resetear historial
 */
const Ajustes = ({
  config,
  setConfig,
  borrarTodo,
  onClose
}) => {
  return (
    <div className="absolute inset-0 bg-zinc-900 z-50 p-6 rounded-xl border border-yellow-500/30">
      <h2 className="text-yellow-500 font-bold mb-4">Ajustes</h2>

      {/* Tarifas por servicio */}
      {Object.keys(config.rates).map((k) => (
        <div key={k} className="mb-2">
          <label className="text-[10px] text-zinc-500 uppercase">
            {k}
          </label>
          <input
            type="number"
            className="w-full bg-black p-2 rounded text-xs"
            value={config.rates[k]}
            onChange={(e) =>
              setConfig({
                ...config,
                rates: {
                  ...config.rates,
                  [k]: Number(e.target.value),
                },
              })
            }
          />
        </div>
      ))}

      <button
        onClick={borrarTodo}
        className="w-full mt-4 bg-red-900/20 text-red-500 py-2 rounded text-[10px] border border-red-900/50"
      >
        RESETEAR TODO
      </button>

      <button
        onClick={onClose}
        className="w-full mt-2 text-zinc-500 text-[10px]"
      >
        CERRAR
      </button>
    </div>
  );
};

export default Ajustes;
