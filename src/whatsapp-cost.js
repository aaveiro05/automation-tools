// Calculadora de costos de WhatsApp Business

// Precios oficiales de Meta para Argentina, en ARS por mensaje entregado.
// Rate card vigente desde el 1/7/2026. Meta anuncio cambios para el 1/10/2026:
// hay que volver a bajarlo despues de esa fecha.
// Fuente: https://developers.facebook.com/docs/whatsapp/pricing
//
// Los mensajes de servicio (respuestas dentro de la ventana de 24 hs) no
// tienen tarifa: por eso no estan en esta tabla.
const PRECIOS = {
  utility: 37.6798,
  marketing: 89.5620,
  authentication: 37.6798
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

console.log(costoPorCategoria("utility", 600));

const MEZCLA = {
  utility: 600,
  marketing: 100,
  authentication: 0
};
function costoTotal(mezcla){ 
  return costoPorCategoria("utility", mezcla.utility) + costoPorCategoria("marketing", mezcla.marketing) + costoPorCategoria("authentication", mezcla.authentication)  
}

console.log(costoTotal(MEZCLA));
