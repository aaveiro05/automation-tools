# Blueprints

Escenarios de Make exportados, como **plantillas**. Los datos del negocio
están reemplazados por marcadores:

| Marcador | Qué va |
|---|---|
| `{{NOMBRE_NEGOCIO}}` | Nombre del negocio, como figura en la conexión de WhatsApp |
| `{{NOMBRE_PROFESIONAL}}` | A quién representa el bot |
| `{{DIRECCION}}` / `{{LINK_MAPS}}` | Dónde atiende |
| `{{PRECIO_CONSULTA}}` | Precio que menciona el bot |
| `{{SPREADSHEET_ID}}` | ID de la planilla de Google donde se anota la bitácora |
| `{{NUMERO_DE_PRUEBA_ID}}` | ID del número de WhatsApp que envía |
| `tu-cuenta@example.com` | Cuenta de Google de la conexión |

Las conexiones, el data store y el webhook apuntan a IDs de mi cuenta de Make:
al importar hay que elegir los propios.

Son versiones viejas, de antes de la agenda automática. Las versiones en uso,
con los datos reales, están en un repositorio privado.
