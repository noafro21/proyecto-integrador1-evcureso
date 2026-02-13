# Evcureso: Plataforma de Eventos Localizada

Evcureso es una plataforma colaborativa diseñada para centralizar el descubrimiento de eventos culturales, recreativos y sociales en tiempo real. Mediante el uso de geolocalización, el sistema permite a los usuarios descubrir actividades en su radio de interés, superando las limitaciones de la información tradicional.

## Convenciones de Nomenclatura y Formato

### Para mantener la consistencia en el proyecto, se establecen las siguientes reglas:

1. **Archivos y Carpetas:** Se utilizará kebab-case (ejemplo: gestion-eventos.js, main-style.css).

2. **Variables y Funciones:** Se utilizará camelCase (ejemplo: const eventLocation;, function calculateDistance()).

3. **Clases (CSS y JS):** Se utilizará PascalCase para clases de JavaScript y kebab-case para clases de CSS.

4. **Idiomas:** El código (variables, funciones) se escribirá en Inglés, mientras que la documentación, comentarios y la interfaz de usuario final estarán en Español.

## Estrategia de Git y Control de Versiones

### Se implementará el flujo de trabajo _Gitflow_, que permite una gestión organizada mediante ramas especializadas:

#### Ramas Principales

- main: Contiene el código oficial de producción. Cada commit en esta rama corresponde a una versión estable y etiquetada bajo la convención de Semantic Versioning (vMajor.Minor.Patch), por ejemplo: v1.0.0.

- develop: Es la rama principal de desarrollo donde se integran todas las funcionalidades completadas antes de pasar a producción.

#### Ramas de Soporte

- feature/nombre-funcionalidad: Ramas que nacen de develop para trabajar en características específicas. Una vez finalizadas, se reintegran mediante un Pull Request.

- release/vX.X.X: Ramas de preparación para una nueva entrega. Se utilizan para correcciones finales y limpieza antes de fusionar con main y develop.

- hotfix/nombre-error: Ramas que nacen de main para corregir errores críticos en producción de forma inmediata.

### Convención de Commits

Los mensajes de commit deben ser descriptivos y seguir el formato: tipo: descripción breve.

#### Tipos de commit permitidos:

- feat: Nueva funcionalidad.

- fix: Corrección de un error (bug).

- docs: Cambios en la documentación (.md).

- style: Cambios que no afectan la lógica (espacios, formato, puntos y comas).

- refactor: Cambio en el código que no corrige un error ni añade funcionalidad.

- test: Añadir o corregir pruebas.

_Proyecto Integrador 1 - Universidad CENFOTEC - 2026_
