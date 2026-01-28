import React, { useState, useMemo, useEffect } from 'react';
import Ajustes from './Components/Ajustes';
import Presupuesto from './Components/Presupuesto';
import Historial from './Components/Historial';
import { INITIAL_CONFIG } from "./constants/pricing.jsx";

/* =======================
   UTILIDADES PDF
======================= */
const cargarLibreriasPDF = () => {
  return new Promise((resolve) => {
    if (window.jspdf) return resolve();
    const s1 = document.createElement('script');
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    const s2 = document.createElement('script');
    s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
    s1.onload = () => {
      document.body.appendChild(s2);
      s2.onload = resolve;
    };
    document.body.appendChild(s1);
  });
};

const App = () => {
  /* ---------- ESTADO ---------- */
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('devguard_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [itemsProyecto, setItemsProyecto] = useState(() => {
    const saved = localStorage.getItem('devguard_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [historial, setHistorial] = useState(() => {
    const saved = localStorage.getItem('devguard_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [cliente, setCliente] = useState('');
  const [tipoServicio, setTipoServicio] = useState('DEV');
  const [horas, setHoras] = useState(3);
  const [esUrgente, setEsUrgente] = useState(false);
  const [esCustom, setEsCustom] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  /* ---------- PERSISTENCIA ---------- */
  useEffect(() => {
    localStorage.setItem('devguard_config', JSON.stringify(config));
    localStorage.setItem('devguard_items', JSON.stringify(itemsProyecto));
    localStorage.setItem('devguard_history', JSON.stringify(historial));
  }, [config, itemsProyecto, historial]);

  const nombresServicios = {
    DEV: 'Desarrollo Web',
    DISENO: 'Diseño Gráfico',
    SOPORTE: 'Soporte Técnico',
    COPY: 'Redacción Técnica'
  };

  const formatoMoneda = (v) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(v);

  /* ---------- CÁLCULOS DE PRECIO ---------- */
  const precioEnVivo = useMemo(() => {
    let base = horas * config.rates[tipoServicio];
    
    // Precio mínimo para Desarrollo
    if (tipoServicio === 'DEV' && base < config.settings.MIN_DEV_PRICE) {
      base = config.settings.MIN_DEV_PRICE;
    }

    // APLICAR RECARGOS
    if (esCustom) base *= config.settings.CUSTOM_BUILD_MULTIPLIER;
    if (esUrgente) base *= config.settings.URGENCY_MULTIPLIER;

    return Math.round(base);
  }, [horas, tipoServicio, esUrgente, esCustom, config]);

  const semanasCalculadas = useMemo(() => Math.max(1, Math.ceil(horas / 15)), [horas]);
  const totalProyecto = useMemo(() => itemsProyecto.reduce((acc, i) => acc + i.monto, 0), [itemsProyecto]);

  /* ---------- ACCIONES ---------- */
  const agregarItem = () => {
    if (!cliente) return alert("Escribe el nombre del cliente");
    setItemsProyecto((prev) => [
      ...prev,
      {
        id: Date.now(),
        servicio: `${nombresServicios[tipoServicio]}${esCustom ? ' (Custom)' : ''}${esUrgente ? ' [URGENTE]' : ''}`,
        horas,
        semanas: semanasCalculadas,
        monto: precioEnVivo
      }
    ]);
    // Resetear opciones tras agregar
    setEsUrgente(false);
    setEsCustom(false);
  };

  const eliminarItemProyecto = (id) => setItemsProyecto(itemsProyecto.filter(i => i.id !== id));
  
  const eliminarRegistroHistorial = (id) => {
    if(window.confirm("¿Eliminar este registro?")) {
      setHistorial(historial.filter(h => h.id !== id));
    }
  };

  const registrarVenta = () => {
    if (!cliente || itemsProyecto.length === 0) return;
    const nuevaVenta = {
      id: Date.now(),
      cliente,
      servicio: itemsProyecto.map(i => i.servicio).join(", "),
      total: totalProyecto
    };
    setHistorial([nuevaVenta, ...historial]);
    setItemsProyecto([]);
    setCliente('');
  };

  const borrarTodo = () => {
    if(window.confirm("¿Resetear todo?")) {
      setItemsProyecto([]);
      setHistorial([]);
      localStorage.clear();
      window.location.reload();
    }
  };

const generarPDF = async () => {
    if (!cliente || itemsProyecto.length === 0) return;

    await cargarLibreriasPDF();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cálculo de tiempo estimado
    const semanasMaximas = Math.max(...itemsProyecto.map(i => i.semanas));
    const fechaHoy = new Date();
    const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' };

    // --- CABECERA ---
    doc.setFillColor(20, 20, 20); 
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 215, 0); 
    doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text('PROPUESTA TÉCNICA', 14, 28);
    doc.setTextColor(150, 150, 150); doc.setFontSize(9);
    doc.text("DESARROLLO PROFESIONAL & ALTA CALIDAD", 14, 36);

    // --- DATOS DEL CLIENTE ---
    doc.setTextColor(40, 40, 40); doc.setFontSize(11);
    doc.text('PREPARADO PARA:', 14, 60);
    doc.setFont("helvetica", "normal"); doc.text(cliente.toUpperCase(), 55, 60);
    doc.text(`FECHA DE EMISIÓN: ${fechaHoy.toLocaleDateString('es-ES', opcionesFecha)}`, 14, 67);

    // --- TABLA DE SERVICIOS ---
    doc.autoTable({
      startY: 75,
      head: [['SERVICIO', 'TIEMPO ESTIMADO', 'INVERSIÓN']],
      body: itemsProyecto.map((i) => [
        i.servicio, 
        `${i.semanas} ${i.semanas === 1 ? 'Semana' : 'Semanas'} hábiles`, 
        formatoMoneda(i.monto)
      ]),
      headStyles: { fillColor: [30, 30, 30], textColor: [255, 215, 0] },
    });

    const finalY = doc.lastAutoTable.finalY;

    // --- CONDICIONES Y TIEMPOS ---
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("INVERSIÓN TOTAL:", 14, finalY + 15);
    doc.text(formatoMoneda(totalProyecto), 150, finalY + 15);

    // Bloque de Aviso de Inicio
    doc.setFillColor(245, 245, 245);
    doc.rect(14, finalY + 22, 182, 18, 'F');
    doc.setFontSize(9); doc.setTextColor(200, 0, 0);
    const notaTiempo = `NOTA: El tiempo estimado de ejecución comenzará a contabilizarse a partir de la recepción efectiva del abono inicial (40%).`;
    doc.text(doc.splitTextToSize(notaTiempo, 170), 20, finalY + 30);

    // --- MÉTODOS DE PAGO (TU NEQUI Y LLAVE) ---
    doc.setTextColor(0, 0, 0); doc.setFontSize(11);
    doc.text("MÉTODOS DE PAGO PARA EL ABONO (40%):", 14, finalY + 55);
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 215, 0);
    doc.rect(14, finalY + 60, 182, 25); // Recuadro para pagos
    
    doc.setFontSize(10);
    doc.text(`Monto a abonar: ${formatoMoneda(totalProyecto * 0.4)}`, 20, finalY + 70);
    doc.setFont("helvetica", "bold");
    doc.text(`NEQUI: 3152157034`, 20, finalY + 78);
    doc.text(`LLAVE: @ssg386`, 120, finalY + 78);

    // --- POLÍTICAS ---
    doc.setTextColor(100, 100, 100); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("CALIDAD Y SEGUIMIENTO:", 14, finalY + 100);
    doc.setFont("helvetica", "normal");
    const politicas = [
      "- Garantía de código optimizado y estándares de alta calidad.",
      "- El soporte post-entrega y correcciones adicionales tendrán un costo independiente."
    ];
    doc.text(politicas, 14, finalY + 107);

    // --- FIRMA ---
    const firmaY = 250;
    doc.setDrawColor(200, 200, 200); doc.line(14, firmaY, 80, firmaY);
    doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0); doc.setFontSize(10);
    doc.text("Sergio Severiche Guerrero", 14, firmaY + 7);
    doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100); doc.setFontSize(8);
    doc.text("Programador y Desarrollador", 14, firmaY + 12);

    doc.save(`Propuesta_${cliente}_Severiche.pdf`);
  };
  const enviarWhatsApp = () => {
  if (!cliente || itemsProyecto.length === 0) return;

  const total = formatoMoneda(totalProyecto);
  const abono = formatoMoneda(totalProyecto * 0.4);
  const semanas = Math.max(...itemsProyecto.map(i => i.semanas));
  
  // Mensaje estructurado para que se vea ordenado en el chat
  const mensaje = `*PROPUESTA TÉCNICA - SERGIO SEVERICHE*%0A%0A` +
    `Hola *${cliente}*, adjunto el resumen de tu inversión:*%0A%0A` +
    `• *Inversión Total:* ${total}%0A` +
    `• *Abono Inicial (40%):* ${abono}%0A` +
    `• *Tiempo estimado:* ${semanas} semanas hábiles.%0A%0A` +
    `_Nota: El tiempo de ejecución inicia tras confirmar el abono._%0A%0A` +
    `¿Deseas que te envíe el PDF detallado con las cláusulas de calidad?`;

  const url = `https://wa.me/573152157034?text=${mensaje}`;
  window.open(url, '_blank');
};

return (
    <div className="min-h-screen bg-severiche-black text-zinc-400 p-4 sm:p-8 selection:bg-severiche-gold/30">
      <div className="max-w-xl mx-auto relative">
        
        {/* EFECTO DE LUZ DE FONDO (Utilizando tu dorado) */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-severiche-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

        <header className="flex justify-between items-end mb-12 px-2">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white italic leading-none">
              DEVGUARD <span className="text-severiche-gold not-italic">4.0</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-[0.3em] mt-3 uppercase">Severiche Architecture</p>
          </div>
          <button 
            onClick={() => setShowSettings(true)} 
            className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase py-2.5 px-5 rounded-full border border-white/5 bg-severiche-dark/50 backdrop-blur-md hover:border-severiche-gold/40 hover:text-white transition-all duration-500"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-severiche-gold shadow-[0_0_8px_#FBBF24]"></span>
            Ajustes
          </button>
        </header>

        {showSettings && (
          <Ajustes config={config} setConfig={setConfig} borrarTodo={borrarTodo} onClose={() => setShowSettings(false)} />
        )}

        <section className="space-y-6">
          {/* PANEL DE ENTRADA */}
          <div className="bg-severiche-dark/40 backdrop-blur-2xl p-7 rounded-[2.5rem] border border-white/5 shadow-2xl">
            
            <div className="space-y-5">
              <input 
                className="w-full bg-severiche-black/60 p-4 rounded-2xl text-xs border border-white/5 focus:border-severiche-gold/50 text-white outline-none transition-all placeholder:text-zinc-700" 
                placeholder="CLIENTE / PROYECTO" 
                value={cliente} 
                onChange={(e) => setCliente(e.target.value)} 
              />
              
              <div className="flex gap-3">
                <select 
                  className="flex-1 bg-severiche-black/60 p-4 rounded-2xl text-xs border border-white/5 text-white outline-none appearance-none cursor-pointer focus:border-severiche-gold/50" 
                  value={tipoServicio} 
                  onChange={(e) => setTipoServicio(e.target.value)}
                >
                  {Object.keys(nombresServicios).map((k) => (
                    <option key={k} value={k} className="bg-severiche-dark">{nombresServicios[k]}</option>
                  ))}
                </select>
                
                <input 
                  type="number" 
                  className="w-24 bg-severiche-black/60 p-4 rounded-2xl text-xs text-center border border-white/5 text-white outline-none focus:border-severiche-gold/50 font-mono" 
                  value={horas} 
                  onChange={(e) => setHoras(Number(e.target.value))} 
                />
              </div>

              {/* BOTONES DE MULTIPLICADOR CON TUS COLORES */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setEsCustom(!esCustom)}
                  className={`py-3 rounded-xl text-[9px] font-bold tracking-[0.2em] border transition-all duration-500 ${
                    esCustom 
                    ? 'bg-severiche-gold text-severiche-black border-severiche-gold' 
                    : 'bg-transparent border-white/5 text-zinc-500 hover:border-white/20'
                  }`}
                >
                  DESDE CERO
                </button>
                <button 
                  onClick={() => setEsUrgente(!esUrgente)}
                  className={`py-3 rounded-xl text-[9px] font-bold tracking-[0.2em] border transition-all duration-500 ${
                    esUrgente 
                    ? 'bg-red-500/20 border-red-500/50 text-red-500' 
                    : 'bg-transparent border-white/5 text-zinc-500 hover:border-white/20'
                  }`}
                >
                  ENTREGA RÁPIDA
                </button>
              </div>

              {/* VISTA PREVIA PREMIUM */}
              <div className="bg-severiche-black/80 p-6 rounded-3xl border border-white/5 flex justify-between items-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-severiche-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.3em] mb-2">Inversión Final</p>
                  <p className="text-3xl font-mono font-bold text-white tracking-tighter">
                    {formatoMoneda(precioEnVivo)}
                  </p>
                </div>
                <div className="relative z-10 text-right">
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.3em] mb-2">Estimación</p>
                  <p className="text-xs font-bold text-severiche-gold">
                    {semanasCalculadas} {semanasCalculadas === 1 ? 'SEMANA' : 'SEMANAS'}
                  </p>
                </div>
              </div>

              <button 
                onClick={agregarItem} 
                className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-severiche-gold transition-all duration-500 active:scale-[0.97] shadow-xl shadow-white/5"
              >
                Añadir al Presupuesto
              </button>
            </div>
          </div>

          {/* COMPONENTES SECUNDARIOS */}
          <div className="opacity-90 hover:opacity-100 transition-opacity">
            <Presupuesto 
              itemsProyecto={itemsProyecto} 
              formatoMoneda={formatoMoneda} 
              onEliminarItem={eliminarItemProyecto} 
            />
          </div>

          {itemsProyecto.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={generarPDF} className="bg-severiche-dark text-white py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest border border-white/5 hover:bg-zinc-800 transition-all">Exportar PDF</button>
              <button onClick={registrarVenta} className="bg-severiche-gold text-severiche-black py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:brightness-110 transition-all">Registrar Proyecto</button>
            </div>
          )}

          <Historial 
            historial={historial} 
            onEliminar={eliminarRegistroHistorial} 
          />
          <button 
  onClick={enviarWhatsApp} 
  className="w-full bg-[#25D366]/10 text-[#25D366] py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest border border-[#25D366]/20 hover:bg-[#25D366] hover:text-black transition-all duration-500 mt-2 flex items-center justify-center gap-2"
>
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.481 5.229 3.481 8.405c0 6.555-5.332 11.89-11.888 11.89-2.015 0-4.001-.511-5.748-1.483l-6.236 1.635zm12.033-21.491c-5.273 0-9.563 4.291-9.563 9.564 0 2.006.619 3.869 1.681 5.409l-1.009 3.687 3.774-.99c1.47 1.005 3.231 1.537 5.116 1.537 5.272 0 9.561-4.29 9.561-9.563 0-5.273-4.289-9.564-9.561-9.564z"/>
  </svg>
  Enviar por WhatsApp
</button>
        </section>
      </div>
    </div>
    
  );
};

export default App;