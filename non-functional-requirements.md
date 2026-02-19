# Requerimientos No Funcionales (RNF) - Plataforma Evcureso

**Este documento detalla los atributos de calidad, estándares técnicos y restricciones de seguridad que rigen el desarrollo de la plataforma Evcureso.**
enadas en la base de datos deben estar cifradas mediante el algoritmo de hash bcrypt.

**RNF-04:** El sistema debe implementar un control de acceso basado en roles (RBAC), distinguiendo claramente los permisos entre Usuario Explorador (anónimo), Promotor y Moderador/Administrador.

**RNF-05:** La sesión de usuario debe gestionarse mediante tokens seguros (JSON Web Tokens - JWT) con un tiempo de expiración definido.

## 3. Usabilidad y Diseño (UX/UI)

RNF-06: La aplicación debe seguir un diseño Mobile-First utilizando Bootstrap 5, garantizando que sea completamente funcional en dispositivos móviles y de escritorio.

RNF-07: La interfaz debe utilizar la paleta de colores oficial establecida (#2A5C82, #FF8C42, #43B05C, #F4F7F6) para mantener la identidad visual y la jerarquía de información.

## 4. Disponibilidad y Servicio

**RNF-08:** El sistema debe informar al promotor sobre el estado de su validación de cuenta en un plazo máximo de 24 horas (implementado mediante un mensaje de estado en el Dashboard tras el inicio de sesión).

**RNF-09:** El backend debe estar estructurado siguiendo el patrón de arquitectura MVC (Modelo-Vista-Controlador) para asegurar el cumplimiento de la separación de responsabilidades.

## 5. Estándares Técnicos

**RNF-10:** Los datos geográficos deben almacenarse y transmitirse siguiendo estrictamente el estándar GeoJSON.

**RNF-11:** El código fuente (nombres de variables, funciones y rutas) se escribirá en Inglés, mientras que los comentarios y la interfaz de usuario final estarán en Español.

**RNF-12:** El sistema debe utilizar MongoDB Atlas como base de datos en la nube para garantizar la persistencia de los datos y la facilidad de conexión.

_Atributos de calidad validados para el Proyecto Integrador 1 - 2026_
