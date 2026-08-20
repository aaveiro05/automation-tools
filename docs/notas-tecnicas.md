# Notas técnicas

Registro de problemas encontrados construyendo automatizaciones, con su
causa y su solución. Escrito mientras pasaban, no después.

**Cómo se usa:** cuando algo falla, buscá el síntoma. La mayoría de los
problemas se repiten, y el que ya resolviste una vez no debería costarte
una hora la segunda.

**Formato:** síntoma → causa → solución.

---

# Make

### Un módulo de búsqueda devuelve 0 resultados y el flujo se detiene

**Síntoma:** el escenario corre sin error pero los módulos posteriores no
se ejecutan.

**Causa:** cuando un módulo de búsqueda no encuentra nada, no genera
bundles, y sin bundles no hay nada que procesar aguas abajo.

**Solución:** para guardar estado entre ejecuciones, usar un **Data Store**
con *Return Wrapped Output* en vez de buscar filas en una planilla. La
búsqueda por clave directa devuelve un registro vacío en lugar de cortar.

---

### Filtro sobre un campo del Data Store nunca coincide

**Síntoma:** el filtro pregunta por `estado` y siempre da "no existe",
aunque el registro tenga ese campo cargado.

**Causa:** con *Wrapped Output*, los campos vienen anidados dentro de
`Record`. Pedirlos por su nombre suelto apunta a un nivel donde no están.

**Solución:** expandir `Record` en el panel de mapeo y elegir el campo
desde ahí. Queda como `Record: estado`.

---

### Un filtro numérico no coincide aunque los valores se vean iguales

**Síntoma:** el mensaje trae `1`, el filtro compara contra `1`, y no pasa.

**Causa:** el valor llega como **número** y el filtro usa operadores de
**texto**. Para la máquina, `1` y `"1"` no son lo mismo.

**Solución:** cambiar a *Numeric operators: Equal to*. Regla general: el
operador tiene que coincidir con el tipo del dato, no con cómo se ve.

---

### Un filtro con varias condiciones nunca se cumple

**Síntoma:** cinco condiciones "contiene X" y ningún mensaje las activa.

**Causa:** las condiciones agregadas con *Add AND rule* exigen que se
cumplan **todas a la vez**.

**Solución:** usar *Add OR rule*, que abre un bloque nuevo. Dentro de un
bloque la relación es AND; entre bloques es OR.

---

### Una condición "Contains" falla con el texto correcto

**Síntoma:** el mensaje dice "duele", la condición busca "duele", y no
coincide.

**Causa:** un espacio invisible al final del valor de la condición. Busca
literalmente `"duele "`.

**Solución:** borrar el campo entero y reescribirlo sin copiar y pegar.
Cuando algo debería coincidir y no coincide, sospechar de caracteres
invisibles antes de seguir mirando la pantalla.

---

### Los cambios no tienen efecto al correr

**Síntoma:** se edita un filtro, se corre, y se comporta como antes.

**Causa:** guardar el filtro con su botón *Save* no guarda el escenario.

**Solución:** guardar el escenario completo (disquete / Ctrl+S) después de
cada cambio. Si un cambio "no hizo nada", verificar esto primero.

---

### El webhook procesa datos viejos

**Síntoma:** se prueba con un mensaje nuevo y el escenario corre con uno
anterior.

**Causa:** el webhook acumula en una cola todo lo que llega mientras el
escenario no está escuchando.

**Solución:** al correr, elegir **"Wait for new data"**, nunca *"Use
existing data"*.

---

### `formatDate` falla: "now is not a valid date"

**Síntoma:** error al formatear una fecha con `now`.

**Causa:** `now` se escribió como texto. Es una variable del sistema.

**Solución:** insertarla desde el panel de mapeo. Regla de Make: **texto
negro es literal, etiqueta de color es un dato.**

---

### `formatDate` devuelve caracteres basura al final

**Síntoma:** sale `15/08/2026 09:00"; "AM06ricam/AMrg6ntinam/...`

**Causa:** se usaron comillas alrededor de los argumentos. En el lenguaje
de fórmulas de Make el texto va pelado, y las comillas se toman como
caracteres literales; el punto y coma tipeado a mano tampoco separa
argumentos.

**Solución:** insertar la función desde la pestaña `fx` para que cree sus
propios separadores, y completar los huecos sin comillas.

---

### `403 Request had insufficient authentication scopes`

**Síntoma:** la conexión con Google se crea pero los datos no cargan.

**Causa:** en la pantalla de permisos de Google quedaron casillas sin
tildar. El token existe pero no incluye el permiso necesario.

**Solución:** crear la conexión de nuevo y **tildar todas las casillas**.

> `401` es "no sé quién sos"; `403` es "sé quién sos pero no podés hacer
> eso". Son problemas distintos con soluciones distintas.

---

### Faltan resultados sin ningún error

**Síntoma:** el escenario corre verde pero procesa menos registros de los
que existen.

**Causa:** el campo `Limit` de los módulos de búsqueda viene en 10 por
defecto. Lo que excede se descarta en silencio.

**Solución:** subirlo a un valor holgado. Regla general: **cuando una
herramienta ofrece un límite por defecto, preguntarse qué pasa al
superarlo.**

---

### Las horas de Google Calendar salen 3 horas adelantadas

**Síntoma:** un turno de las 09:00 se guarda como 12:00.

**Causa:** el calendario devuelve las fechas en UTC. Argentina es UTC−3.

**Solución:**
`formatDate(Start; DD/MM/YYYY - HH:mm; America/Argentina/Buenos_Aires)`

Usar el nombre de la zona y no `-3`: si algún día vuelve el horario de
verano, el nombre se ajusta solo.

---

### Google Sheets muestra la fecha como un número

**Síntoma:** en la celda aparece `46249,375` en vez de la fecha.

**Causa:** Sheets reconoce el texto como fecha y lo guarda en su formato
interno (días desde 1899 + fracción del día).

**Solución parcial:** dar formato de fecha a la columna. **Pero las filas
que agrega la API no heredan el formato de columna**, así que las nuevas
vuelven a verse como número.

**Solución real:** que el valor no parezca una fecha. Con un guión en el
medio (`DD/MM/YYYY - HH:mm`) Sheets lo deja como texto.

**Canje:** como texto se ve siempre bien pero no se puede ordenar
cronológicamente. Si hace falta ordenar, agregar una columna aparte con
el valor crudo: una para el humano, otra para la máquina.

---

# JavaScript

### Una cuenta devuelve `NaN`

**Síntoma:** una multiplicación da `NaN` y el programa sigue corriendo.

**Causa:** uno de los operandos era `undefined` — típicamente una clave
que no existe en un objeto. Pedir una clave inexistente no da error:
devuelve `undefined`.

**Solución:** validar antes de operar y cortar con `throw new Error()`
incluyendo el dato que falló. `NaN` se contagia a toda la cadena de
cálculos, así que conviene detenerlo en el origen.

---

### Un argumento de más desaparece sin aviso

**Síntoma:** se llama `f("a", 600)` pero el 600 no llega.

**Causa:** la función declaraba un solo parámetro. JavaScript **descarta
los argumentos extra en silencio**, sin error ni advertencia.

**Solución:** revisar que la cantidad de parámetros declarados coincida
con los que se pasan.

---

### `.replace()` no modifica el texto

**Causa:** en JavaScript los strings son inmutables. Los métodos devuelven
un texto nuevo en lugar de cambiar el original.

**Solución:** usar el valor devuelto (`return`, o asignarlo a una
variable). Si no se guarda, el resultado se calcula y se descarta.

---

# Git y entorno

### Un `.gitignore` vacío no protege nada

**Síntoma:** `.env` sigue apareciendo en `git status`.

**Causa:** el archivo existe pero no tiene patrones adentro.

**Solución:** `.gitignore` es **una lista de patrones, uno por línea** —
no documentación sobre qué debería ignorar.

**Cómo verificar:** `git check-ignore -v .env` responde qué línea del
`.gitignore` está ignorando el archivo. Si no devuelve nada, no lo está
protegiendo.

---

### Un cambio guardado en el editor no tiene efecto

**Síntoma:** se edita un archivo, se ejecuta, y corre la versión vieja.

**Causa:** el archivo no estaba guardado. VS Code muestra un **punto
blanco** en la pestaña cuando hay cambios sin guardar.

**Solución:** activar **File → Auto Save**.

---

### Un programa recién instalado "no existe"

**Síntoma:** se instala Node (o cualquier cosa) y la consola dice que no
se encuentra.

**Causa:** el PATH se copia al arrancar cada proceso. Una terminal abierta
antes de la instalación tiene la lista vieja.

**Solución:** cerrar y volver a abrir la terminal. Es la explicación real
detrás del "probá reiniciando".

---

### `npm` no se puede ejecutar en Windows

**Síntoma:** *"la ejecución de scripts está deshabilitada en este sistema"*.

**Causa:** en Windows `npm` es un script de PowerShell (`npm.ps1`), y la
política de ejecución bloquea los scripts por defecto.

**Solución:** `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, que
permite scripts locales y sigue exigiendo firma a los descargados.
Alternativa sin cambiar nada: usar `npm.cmd`.

---

### Repositorios de Git dentro de OneDrive

**Problema:** OneDrive sincroniza archivo por archivo, y la carpeta `.git`
cambia constantemente durante las operaciones de Git. Cuando los dos tocan
lo mismo, el repositorio se corrompe.

**Solución:** los repos de código van fuera de las carpetas sincronizadas.
El backup lo hace el remoto, no la nube de archivos.

---

# Meta / WhatsApp

### No llegan los SMS de verificación a un número argentino

**Causa:** falta el `9` entre el código de país y el de área. Los celulares
argentinos necesitan `+54 9 <área> <número>` para recibir SMS del exterior.

**Solución:** cargar el número como `9` + área + número, sin el `0`
nacional.

---

### El código de verificación siempre da error

**Causa:** cada código nuevo invalida los anteriores. Si se pidieron
varios, solo sirve el último.

**Solución:** usar el más reciente y no volver a pedir uno mientras se lo
está ingresando. Pedir otro mata el que se acaba de copiar.

---

### `dev.meta.ai` no es `developers.facebook.com`

Son plataformas distintas. La primera es la API de modelos de IA de Meta
y pide método de pago; la segunda es donde se crean las apps de WhatsApp
Business. La cuenta de desarrollador usa una cuenta de **Facebook**.
