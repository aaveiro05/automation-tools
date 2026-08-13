// Calculadora de costos de WhatsApp Business
// OJO: estos precios son INVENTADOS. Los reemplazamos por el rate card
// real de Meta cuando la logica funcione.

const PRECIOS = {
  utility: 12,
  marketing: 60,
  authentication: 12
};

// Cuanto sale mandar "cantidad" mensajes de una categoria.
function costoPorCategoria(categoria, cantidad) {
  const precio = PRECIOS[categoria]; // busco el precio en la tabla

  // Si la categoria no existe en la tabla, precio queda en undefined.
  // Cortamos aca en vez de devolver NaN y que el error siga viaje.
  if (precio === undefined) {
    throw new Error("Categoria desconocida: " + categoria);
  }

  return precio * cantidad;
}

console.log(costoPorCategoria("utility", 600)); // 7200

const MEZCLA = {
  utility: 600,
  marketing: 100,
  authentication: 0
};
function costoTotal(mezcla){ 
  return costoPorCategoria("utility", mezcla.utility) + costoPorCategoria("marketing", mezcla.marketing) + costoPorCategoria("authentication", mezcla.authentication)  
}

console.log(costoTotal(MEZCLA));
