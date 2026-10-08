# CV Harvard

El CV usa una columna, tipografía Times New Roman, texto negro sobre blanco y secciones convencionales. Sigue la guía y la plantilla de viñetas del Mignone Center for Career Success de Harvard:

- https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/
- https://careerservices.fas.harvard.edu/resources/bullet-point-resume-template/

Prioriza formación y proyectos de software para una primera oportunidad en tecnología. No muestra foto, edad, nacionalidad, habilidades con porcentajes ni resultados numéricos sin respaldo. Incluye Cambridge English B2 First, nivel B2 confirmado por Matias; el año del examen y de CyberAR se omiten porque no están confirmados.

## Ver y exportar

- Español: `/cv?lang=es`
- Inglés: `/cv?lang=en`
- El botón del portfolio abre la versión del idioma seleccionado.
- “Guardar PDF / Imprimir” abre la impresión del navegador. Elegir A4, desactivar encabezados y pies de página del navegador y guardar como PDF.
- El CV conserva el formato blanco y negro al imprimir desde cualquiera de los temas del portfolio.

## Editar desde el admin

En Profile están los campos `CV ·` para email, portfolio publicado, conocimientos, idiomas y actividades. En Experiences, Education y Projects están los aportes, notas o tecnologías específicos del CV y la opción “Excluir del CV”. Los campos traducibles también aparecen en Copies ES / Copies EN.

Los datos habituales (nombre, instituciones, cargos y fechas) siguen viniendo de los registros originales. Los textos del CV son independientes de las descripciones extensas del portfolio. Los valores iniciales se incorporan al leer los registros; no se escriben automáticamente en Supabase. Al editar y guardar un registro en el admin, sus campos de CV se guardan en el JSONB existente. No hace falta migrar tablas.

Los proyectos de GPS y amplificador quedan fuera de esta versión enfocada en software; siguen visibles en el portfolio. Un proyecto nuevo, visible y no ficticio, aparece en el CV salvo que se marque “Excluir del CV”. No se recorta contenido para forzar una página: al agregar más información, revisar la impresión y seleccionar lo relevante para cada postulación.

## Regenerar los archivos entregables

Con Node y Python (reportlab y pypdf):

```powershell
node --experimental-strip-types scripts/generate-cv-data.ts
python scripts/generate-cv-pdf.py
```

El primer comando usa el contenido inicial local. Para usar un respaldo JSON con el contenido actual, pasar su ruta al primer comando. No incluir credenciales en ese JSON.

Las versiones PDF se generan en `output/pdf/`. Son archivos independientes del CV dinámico: cuando se cambie el contenido hay que regenerarlos. Para publicar las descargas directas, copiar los dos PDF a `public/cv/` antes de preparar el paquete de publicación. La página `/cv` siempre consulta el contenido actualizado de Supabase.

## Versiones publicadas

Los CV iniciales se verificaron en Chrome: cambio de idioma, vista móvil sin desbordamiento e impresión de una página en ambos idiomas. Si se agrega contenido desde el admin, revisar nuevamente la impresión.

- CV español: https://matiasmeneclier.com.ar/cv?lang=es
- CV inglés: https://matiasmeneclier.com.ar/cv?lang=en
- PDF español: https://matiasmeneclier.com.ar/cv/Matias-Meneclier-CV-ES.pdf
- PDF inglés: https://matiasmeneclier.com.ar/cv/Matias-Meneclier-Resume-EN.pdf

Las evidencias de despliegue y los respaldos se conservan localmente, fuera del repositorio público.
