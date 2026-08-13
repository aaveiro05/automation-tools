// Normalizador de telefonos argentinos para WhatsApp.
//
// Los telefonos llegan cargados a mano, en cualquier formato. La API de
// WhatsApp exige uno solo:
//
//   5493794123456
//   │  │ │   └── numero del abonado
//   │  │ └────── codigo de area (379 = Corrientes)
//   │  └──────── el 9 de celular (Argentina lo exige)
//   └─────────── codigo de pais
//
// Son 13 digitos: 54 + 9 + los 10 digitos del numero argentino.
//
// Tres reglas locales complican la cosa:
//   - el 0 inicial es prefijo nacional  -> se saca
//   - el 15 es el viejo prefijo de celular -> se saca
//   - el 9 despues del 54 -> hay que agregarlo


// Devuelve unicamente los digitos del texto recibido.
// Saca espacios, guiones, parentesis, el signo + y cualquier otra cosa.
function soloDigitos(texto) {
  return texto.replace(/\D/g, "");
}


// Convierte cualquier formato al que exige WhatsApp.
// Si no se puede, lanza un error explicando por que (nunca devuelve
// un numero dudoso: mandar un WhatsApp al telefono equivocado es peor
// que no mandarlo).
function normalizarTelefono(entrada) {
  // 1. Que lo que entro sea texto. Si viene un numero o un null,
  //    .replace() no existe y el error seria confuso.
  if (typeof entrada !== "string") {
    throw new Error("Se esperaba un texto, llego: " + typeof entrada);
  }

  let n = soloDigitos(entrada);

  if (n === "") {
    throw new Error('Sin digitos: "' + entrada + '"');
  }

  // 2. Codigo de pais. Solo lo saco si al sacarlo sigue quedando un
  //    numero largo: ningun codigo de area argentino empieza con 54,
  //    pero la verificacion de largo evita romper un numero corto.
  if (n.startsWith("54") && n.length > 10) {
    n = n.slice(2);
  }

  // 3. El 9 de celular, si ya venia.
  if (n.startsWith("9") && n.length > 10) {
    n = n.slice(1);
  }

  // 4. El 0 nacional.
  if (n.startsWith("0")) {
    n = n.slice(1);
  }

  // 5. El 15 de celular. Va despues del codigo de area, que en Argentina
  //    puede tener 2, 3 o 4 digitos (11 / 379 / 3794). Si quedaron 12
  //    digitos, sobran justo dos: busco el "15" en esas tres posiciones.
  if (n.length === 12) {
    for (const pos of [2, 3, 4]) {
      if (n.slice(pos, pos + 2) === "15") {
        n = n.slice(0, pos) + n.slice(pos + 2);
        break; // ya lo encontre, corto el bucle
      }
    }
  }

  // 6. Control final. Un numero argentino son 10 digitos (area + abonado).
  //    Si no llegamos a 10, algo no cerro: fallamos con el dato a la vista
  //    en vez de devolver algo que parezca valido.
  if (n.length !== 10) {
    throw new Error(
      'No parece un telefono argentino: "' + entrada +
      '" (quedaron ' + n.length + " digitos, se esperaban 10)"
    );
  }

  return "549" + n;
}


// --- Pruebas ---
// Todos estos son el mismo telefono, escrito de seis maneras distintas.
const casos = [
  "379-412-3456",
  "03794123456",
  "0379 15 412-3456",
  "+549 379 4123456",
  "(0379) 412-3456",
  "3794123456"
];

for (const caso of casos) {
  console.log(caso.padEnd(20), "->", normalizarTelefono(caso));
}

// Y estos tienen que fallar, cada uno con su motivo.
const invalidos = ["", "consultar con Ana", "123"];

for (const caso of invalidos) {
  try {
    normalizarTelefono(caso);
    console.log('ERROR: "' + caso + '" deberia haber fallado y no fallo');
  } catch (error) {
    console.log("OK falla:", error.message);
  }
}
