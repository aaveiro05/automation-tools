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

### Una ruta de router sin filtro acepta todo

**Síntoma:** se le pone un filtro a una rama, el filtro está perfecto, y no
tiene ningún efecto: entra cualquier cosa.

**Causa:** el filtro quedó en una ruta y el módulo en otra. Al arrastrar un
módulo clonado sobre el círculo vacío de una ruta, si no cae justo encima,
Make crea una **ruta nueva** para el módulo y deja la anterior vacía. El
filtro protege una rama que no tiene nada adentro.

**Cómo se ve:** en el canvas queda un círculo con `+` colgando del router.
Si el módulo estuviera enganchado ahí, ese `+` no existiría.

**Solución:** poner el filtro en la línea que entra al módulo y borrar la
ruta huérfana.

**Regla:** una ruta sin filtro no está "sin configurar" — dice **"aceptá
todo"**. El filtro va primero, el módulo después.

**Cómo no perder una hora:** antes de dudar del operador o de las comillas,
verificar que el filtro esté en el link que uno cree.

---

### `+` suma en vez de concatenar

**Síntoma:** una fórmula que arma un número de teléfono devuelve `69`.

**Causa:** `"54" + substring(telefono; 3; 6) + "15" + substring(telefono; 6)`
con el teléfono vacío queda `"54" + "15"`. Make interpreta los dos como
números y los **suma**. Con el teléfono cargado había suficiente texto como
para que concatenara, así que el error solo aparece con datos vacíos.

**Solución:** sacar el texto fijo afuera de las llaves —
`54{{substring(...)}}15{{substring(...)}}`— para que no haya ninguna
operación que interpretar.

**Regla:** una fórmula sin guardas no falla, **inventa**. No avisó que le
faltaba el teléfono: devolvió un número perfectamente formado que no
significaba nada. Eso es peor que un error.

---

### Tormenta de reintentos

**Síntoma:** decenas de ejecuciones idénticas en Error, con segundos de
diferencia, y el usuario recibe el mismo mensaje muchas veces.

**Causa:** el escenario le responde al webhook recién **al final**. Si algo
falla en el medio, Make devuelve error y el proveedor reenvía el mismo
evento. Vuelve a fallar → vuelve a reintentar. En el log aparece como
*"Automatic failure response was sent to the webhook"*.

**Solución:** un módulo **Webhook response** con status `200` puesto
**inmediatamente después del webhook**, antes que ningún otro. La respuesta
sale antes de que nada pueda fallar.

Si el mismo webhook atiende la verificación del proveedor, el body puede ser
`{{hub.challenge}}`: vacío en los mensajes normales, el código en la
verificación. Un módulo cubre los dos casos.

**Por qué no un error handler en "Ignore":** también corta el bucle, pero
deja la ejecución en verde y **apaga la alarma**. Con el 200 temprano el
error sigue apareciendo en rojo y uno se entera.

---

### Los avisos de entrega también gastan operaciones

**Síntoma:** el escenario corre muchas más veces de las que hay mensajes.

**Causa:** WhatsApp manda un webhook por cada cambio de estado de los
mensajes que salen (`sent`, `delivered`, `read`). No traen `messages`,
traen `statuses`, así que todos los campos que se extraen del mensaje
quedan vacíos.

**Cómo distinguirlos sin abrirlos:** por el `Data size` de la ejecución. En
este escenario los callbacks pesan ~642 B y los mensajes reales ~850 B.

**Solución:** filtrarlos lo más cerca posible del webhook, para que mueran
gastando el mínimo de operaciones. Una conversación de cinco respuestas
genera del orden de diez callbacks; si cada uno cuesta dos operaciones, el
ruido pesa tanto como la conversación.

---

### El operador y el valor son una sola unidad

**Síntoma:** se cambia el valor de una condición de `1` a `^(1|turno)$` y la
rama deja de activarse. No hay error.

**Causa:** se cambió el valor pero no el operador. Con `Equal to`, Make
compara si el texto es **literalmente** `^(1|turno)$`, caracter por caracter.
Nadie escribe eso nunca.

**Solución:** al cambiar un valor a una expresión regular, cambiar también el
operador a `Matches pattern`. **Son una sola cosa**: una condición con el
operador viejo y el valor nuevo es válida, no da error, y está muerta.

---

### `Add/replace` reemplaza todo; `Update` toca solo lo mapeado

**Síntoma:** un campo del data store se guarda bien y aparece vacío más
tarde, sin que ningún módulo lo borre explícitamente.

**Causa:** un `Add/replace a record` en el medio de la conversación. Reescribe
el registro **entero**: todo campo que no se le mapee queda vacío.

**Solución:** `Add/replace` solo donde el registro se crea. En todos los
pasos siguientes, `Update a record`, que ignora los campos que no se mapean
(y también los que se mapean vacíos).

**Cómo se detecta:** si un campo desaparece siempre en el mismo paso de la
conversación, el culpable es lo que corre en ese paso, no lo que lo escribió.

---

### La etiqueta que se ve no es el nombre del campo

**Síntoma:** una ruta escrita a mano devuelve vacío para siempre, sin error.

**Causa:** el panel de mapeo muestra la **etiqueta** (`Record`) y no el
**nombre** interno (`data`). `{{4.Record.campo}}` no existe; lo correcto es
`{{4.data.campo}}`.

**Solución:** arrastrar el chip desde el panel —Make escribe la ruta interna
correcta— y reservar el tipeo manual para cuando se conoce el nombre real,
que se ve en el blueprint exportado.

**Regla:** una ruta inexistente en Make no explota, **devuelve nada**.

---

### Un `$` con un espacio atrás no coincide nunca

**Síntoma:** un patrón que se ve bien no matchea jamás.

**Causa:** `^(completo|derivado)$ ` — hay un espacio después del `$`. El `$`
es "fin del texto"; pedirle un caracter **después del fin** es imposible.

**Solución:** borrar el campo entero y reescribirlo sin pegar. Los espacios
al final son invisibles y ya costaron tres bugs distintos en este proyecto.

---

### Dos ramas complementarias comparten la condición, negada

**Síntoma:** una persona recibe dos respuestas seguidas, o ninguna.

**Causa:** las ramas "esto sí" y "esto no" se escribieron con **dos listas
distintas** mantenidas a mano. Al agregar una palabra a una y no a la otra,
aparecen mensajes que caen en las dos o en ninguna.

**Solución:** una sola condición, usada en positivo en una rama y en negativo
en la otra (`Matches pattern` / `Does not match pattern`). Así es
**imposible** que se solapen o que quede un hueco.

**Por qué importa:** un router de Make manda el bundle a **todas** las rutas
que aceptan, no a la primera. No hay if/else.

---

### Un botón no manda texto

**Síntoma:** se agregan botones interactivos y al tocarlos no pasa nada.

**Causa:** cuando alguien toca un botón, el payload trae
`interactive.button_reply.id` y **no** `text.body`. La variable que extrae el
texto llega vacía, y los filtros que exigen que exista bloquean el bundle.

**Solución:** normalizar en la entrada, apenas llega el mensaje:

```
{{ifempty( ...messages[1].text.body ; ...messages[1].interactive.button_reply.id )}}
```

Una sola variable con las dos formas adentro. Ningún módulo aguas abajo se
tiene que enterar de que existen dos.

**Y en los filtros:** aceptar las dos —`^(1|turno)$`— para que escribir el
número siga funcionando igual que tocar el botón.

---

### El número de un módulo es su fecha de nacimiento, no su posición

**Síntoma:** `'Text aggregator' [module ID 4] references inaccessible module
'Gmail' [module ID 2]`. Se apuntó al módulo de al lado y resultó ser otro.

**Causa:** Make numera los módulos por **orden de creación**. Un módulo
insertado después queda con un número más alto aunque en el canvas esté
antes. Una cadena puede verse `1 → 3 → 4 → 2`.

**Solución:** mapear **arrastrando el chip** desde el panel, o leyendo el
número real en el canvas. Nunca asumir que el orden visual es el numérico.

---

### IML usa `&` y `|`, nunca las palabras

**Síntoma:** `Function 'if' finished with error! Function 'and' not found!`

**Causa:** en el lenguaje de fórmulas de Make los operadores lógicos son
símbolos. `and()` y `or()` no existen, y `AND` / `OR` como palabras tampoco
parsean.

**Solución:**

```
{{if(1.activo & length(4.texto) = 0; "ok"; "alerta")}}
```

| Operador | Significado |
|---|---|
| `&` | AND |
| `\|` | OR |

**Regla general:** la referencia de IML dice *"solo usá las funciones
documentadas acá"*. Las fórmulas de Make se parecen a las de otros lenguajes
lo suficiente como para que uno las escriba de memoria y se equivoque.

---

### Un literal en la plantilla de un agregador se escribe siempre

**Síntoma:** el caso "no hay resultados" no queda vacío: queda con un `·`,
un guión o dos puntos sueltos. Y entonces `ifempty` no se activa y
`length(texto) = 0` da falso.

**Causa:** en un Text aggregator, **todo lo que no sea un chip es texto fijo
y se escribe aunque los chips vengan vacíos.** Con una plantilla
`{{a}} · {{b}}` y datos vacíos, el resultado es `" · "`.

**Solución:** que la plantilla sean **solo chips**. Si hace falta separar
campos, usar el separador de filas del propio agregador.

**Por qué importa más de lo que parece:** convierte un caso "vacío" en un
caso "casi vacío", que es peor — parece que hay datos y todas las
condiciones que preguntan por vacío fallan en silencio.

---

### Un agregador emite aunque no le entre ningún bundle

Confirmado en una ejecución real: el módulo fuente devolvió
`__IMTLENGTH__: 0` y el agregador produjo su bundle igual.

Eso lo gobierna la opción **Stop processing after empty aggregation**:

| Estado | Comportamiento |
|---|---|
| Desactivada (default) | Produce un bundle vacío. **El flujo sigue.** |
| Activada | No produce nada. El flujo se corta. |

**Es la forma de esquivar el problema clásico** de que un módulo de búsqueda
sin resultados detenga todo lo que viene después.

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

---

### Un audio o una foto llegan sin texto

**Síntoma:** alguien manda un audio y el bot no contesta absolutamente nada.

**Causa:** el payload solo trae `text.body` cuando `type` es `text`. Con un
audio, `messages[1].text.body` no existe, la variable queda vacía, y ninguna
condición del menú coincide. La conversación muere en silencio.

**Solución:** extraer también `messages[1].type` y armar una rama para lo
que no es texto, con **lista blanca**:

```
^(audio|image|video|sticker|document|location|contacts)$
```

**Por qué lista blanca y no `distinto de text`:** un campo vacío también es
distinto de `text`. Con lista negra entra todo el ruido; con lista blanca
solo entra lo que se nombró.

---

### El nombre del perfil llega gratis

`value.contacts[1].profile.name` viene en **cada** mensaje entrante, sin
pedirlo. No sirve como nombre formal —la gente pone apodos, emojis o el
nombre de su negocio— pero es información gratis que ayuda a identificar a
quien escribe.

---

### Guardá el dato, no la foto del dato

**Síntoma:** una fecha guardada como `"04/09/2026 - 11:51"` se ve perfecta y
no sirve para nada: no se puede ordenar, ni comparar, ni restar.

**Causa:** se guardó el **formato de mostrar** en vez del valor. Y encima,
distintos módulos lo formatearon distinto —uno en UTC, otro en hora local—
sin que se notara, porque el último en escribir tapaba al anterior.

**Solución:** en el almacenamiento va el instante crudo (`now`, tipo Date).
El `formatDate` con zona horaria va **solo** donde lo lee un humano: la
planilla, el mensaje.

**Cómo verificar en un data store de Make:** la columna muestra un ícono de
**calendario** si el campo es Date, y el de texto si es texto.

**Por qué importa:** funciones como *"derivar al humano si la conversación
quedó a medias más de 24 horas"* son una resta de fechas. Sobre un texto no
se pueden construir — y cuando te das cuenta, los registros viejos ya
quedaron así.

---

### Un comando no es un dato

**Síntoma:** el bot pide el nombre, la persona toca un botón de un mensaje
anterior, y el bot guarda `"info"` como su nombre. *"Gracias, info."*

**Causa:** los botones de WhatsApp siguen funcionando **24 horas**. Scrollear
para arriba y tocar uno es normal, no es un error del usuario. Y la rama que
recogía el dato aceptaba cualquier cosa que llegara, sin distinguir entre una
respuesta y una orden de navegación.

**Solución:** separar los dos tipos de entrada.

| | Vale en |
|---|---|
| **Comando** (`turno`, `info`, `doctor`, `1`, `2`, `3`) | cualquier estado |
| **Dato** (un nombre, una preferencia) | solo donde se lo pidieron |

- Las ramas de comando pierden la condición de estado fijo y solo exigen que
  el registro exista.
- Las ramas de datos agregan `Does not match pattern` con la lista de
  comandos.

**Regla:** si alguien toca un botón, quiso navegar. **El comando gana
siempre**, y el dato que estaba a medias se vuelve a pedir.

---

### Una palabra clave no puede robarle la respuesta a una pregunta

**Síntoma:** el bot pregunta *"¿qué días te vienen mejor?"*, la persona
contesta *"cuanto antes, cualquier horario"*, y recibe el bloque de precios.

**Causa:** el filtro que detecta preguntas buscaba `cuanto` y `horario` como
subcadenas, **en cualquier estado**. Una respuesta legítima las contenía.

**Solución:** partir la condición en dos bloques unidos por OR.

```
Bloque 1:  el botón exacto        → vale en cualquier estado
Bloque 2:  las palabras sueltas   → solo cuando no se está esperando nada
```

**Regla:** un botón es inequívoco —si lo tocó, lo quiso tocar—. Una palabra
adentro de una frase es una adivinanza, y adivinar solo se justifica cuando
la persona no está contestando una pregunta.

---

# Monitoreo

### Un vigilante que solo habla cuando hay problemas no se distingue de uno muerto

Si el escenario que vigila se rompe, no recibís nada — igual que cuando todo
está bien. **El silencio significa dos cosas opuestas.**

**Solución:** que mande un aviso **siempre**, con el estado en el asunto:

```
✅ Bot consultorio OK
⚠️ ALERTA Bot consultorio
```

Los buenos se borran sin abrir. Y **si un día no llega ninguno, ese silencio
también es una alarma** — porque ahora significa una sola cosa.

Y la palabra `ALERTA` fija en el asunto permite filtrar y reenviar solo lo
que importa, sin que el filtro se rompa cuando cambien los textos.

---

### Calibrar antes de dejarlo solo

Un vigilante que avisa de más se vuelve inútil más rápido que uno que no
avisa: **a la tercera falsa alarma dejás de mirarlo, y la cuarta era la de
verdad.**

Antes de activarlo, verificar el caso "todo bien" tanto como el caso
"algo falla". Acá una plantilla con un separador literal habría mandado
alerta todos los días, para siempre, sin que nada estuviera mal.

---

### Las conexiones vencen y nadie avisa

Las conexiones de Google muestran una fecha de reautorización — del orden de
seis meses. Cuando vence, el módulo deja de funcionar.

Si lo que vence es el módulo que manda los avisos, **el sistema de monitoreo
se apaga en silencio** y el silencio se lee como "todo bien".

Lo mismo con los tokens de la API de WhatsApp: los temporales duran 24 horas.
Para producción hace falta uno permanente de *System User*.

**Anotar las fechas de vencimiento en un calendario, fuera de la herramienta
que puede fallar.**
