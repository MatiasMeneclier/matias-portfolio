# Mensajes del portfolio por correo

El destinatario configurado es **matimeneclier@gmail.com**. El formulario guarda
primero el mensaje en la bandeja privada de Supabase y después envía una
notificación mediante Resend. El correo incluye nombre, dirección y mensaje.
Responder desde Gmail utiliza el correo del visitante como Reply-To.

La instancia publicada tiene Supabase y Resend conectados. Para una instalación
nueva, configurar ambos servicios siguiendo los pasos siguientes. Las pruebas
automatizadas usan un proveedor simulado; la entrega real del correo se comprueba
desde la cuenta del destinatario.

## Activación

1. Conectar Supabase siguiendo [SUPABASE.md](SUPABASE.md).
2. Crear una cuenta en [Resend](https://resend.com) y obtener una API key para envío.
3. Verificar el dominio desde el cual saldrán los correos y elegir un remitente
   de ese dominio, por ejemplo `Portfolio <contacto@tu-dominio.com>`.
4. Completar estas variables en `.env.local` para pruebas y en las variables del
   servidor o proveedor de hosting para la web publicada:

```dotenv
RESEND_API_KEY=TU_CLAVE_DE_RESEND
CONTACT_EMAIL_FROM="Portfolio <contacto@tu-dominio.com>"
CONTACT_EMAIL_TO=matimeneclier@gmail.com
```

La clave es privada y se configura solamente en el servidor, sin prefijo
`NEXT_PUBLIC_`. No requiere la contraseña de Gmail. El destinatario no depende
del correo público de Profile ni puede cambiarse desde el formulario.

Para una prueba inicial, Resend permite `onboarding@resend.dev` como remitente
solamente si el destinatario coincide con el correo de la cuenta de Resend.
Por eso esa cuenta debe usar `matimeneclier@gmail.com` si se prueba con ese
remitente. Para producción, usar el dominio verificado.
[Restricción del remitente de prueba](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).

5. Configurar también `NEXT_PUBLIC_SITE_URL` con el origen exacto de la web
   (HTTPS en producción). Reiniciar el servidor; si el hosting despliega por
   builds, publicar una versión con estas variables.
6. Enviar un mensaje desde Contacto y comprobar su llegada a Gmail y a Dashboard.
   Las pruebas automatizadas verifican el flujo con un proveedor simulado;
   la llegada real a Gmail se comprueba después de activar los servicios.

## Comportamiento

- El formulario se habilita cuando Supabase y la configuración de correo están
  presentes. Los visitantes siguen viendo el enlace a LinkedIn mientras falten.
- Se mantienen la validación, el honeypot y los límites de la base de datos.
  Un mensaje rechazado no genera correo.
- Un fallo de red, HTTP 429 o error del servidor de correo se reintenta una vez,
  con la misma clave de idempotencia para evitar correos duplicados.
- Si ambos intentos fallan, el mensaje sigue en la bandeja del admin y se registra
  una advertencia sin datos personales en los logs del servidor. No hay una cola
  automática para reenvíos posteriores.
- La respuesta al visitante confirma la recepción del mensaje; la aceptación
  de Resend no garantiza que Gmail ya lo haya entregado en la bandeja principal.

Implementación basada en la [API oficial de Resend](https://resend.com/docs/api-reference/emails/send-email).
