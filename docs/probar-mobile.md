# Probar la versión de celular antes de publicar

En la terminal de VS Code, dentro de la carpeta del proyecto, ejecutá:

```powershell
.\probar-local.cmd
```

Abrí la dirección **Local** que muestre Next.js. En Chrome, pulsá **F12** y después **Ctrl + Shift + M** para activar la vista de dispositivos. Probá 360, 390 y 430 px de ancho, en modo claro y oscuro. Los cambios de código se actualizan al guardarlos; publicar en CasaOS sigue siendo un paso aparte.

La laptop aparece también en celular. Podés abrirla con el scroll, tocarla para reproducir la transición de 2,5 segundos o usar «Saltar intro». El scroll sigue siendo nativo y permite volver a la laptop. Si el dispositivo tiene activado «Reducir movimiento», abre directamente el portfolio.

Los proyectos se deslizan horizontalmente con el dedo y se ajustan a cada tarjeta. Un gesto vertical sobre ellos permite seguir bajando la página. También conservan los botones y el teclado. La descripción y el enlace corresponden al proyecto seleccionado; el espacio debajo se mantiene estable al cambiar de tarjeta.

Para repetir las pruebas automáticas, con el servidor local encendido y Chrome instalado:

```powershell
node tests/mobile-browser.mjs
```

Si Next.js muestra un puerto distinto a 3000, indicá la dirección antes de ejecutar las pruebas:

```powershell
$env:TEST_BASE_URL = 'http://127.0.0.1:3001'
node tests/mobile-browser.mjs
```

Las pruebas revisan laptop, transición, retorno sin recentrado, resize, swipe horizontal y vertical, controles, temas y movimiento reducido. Guardan capturas en `outputs/previews/mobile`.

Esta prueba no envía mensajes ni modifica contenido. Para editar textos, el admin local configurado con Supabase sí utiliza la base de datos del sitio publicado.
