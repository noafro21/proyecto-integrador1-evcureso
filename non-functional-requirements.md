# Requerimientos No Funcionales (RNF) - Plataforma Evcureso

**Este documento detalla los atributos de calidad, estándares técnicos y restricciones de seguridad que rigen el desarrollo de la plataforma Evcureso.**

## 1. Desempeño y Escalabilidad

**RNF-02:** El sistema debe ser capaz de renderizar hasta 5,000 eventos activos en el mapa sin degradación del rendimiento en el cliente (navegador).

## 2. Seguridad y Autenticación

**RNF-03:** El sistema debe permitir la integración de un doble factor de autenticación (2FA) interno como medida de seguridad obligatoria una vez se ponga en producción.

**RNF-04:** El sistema debe estar preconfigurado para permitir el acceso inmediato con las siguientes cuentas de prueba (_correo/contraseña_):

1. Promotor/Organizador: `p_adi_kamakiri@gmail.com / asd123`

2. Usuario/Explorador: `initado_adi_aguacaliente@gmail.com / qwe123`

3. Moderador/Validador: `validador_adi_ba@gmail.com / zxc123`

**RNF-05:** El sistema debe implementar una lógica de permisos _( Control de Acceso Basado en Roles (RBAC)_) donde las funcionalidades se agrupen por perfiles (Explorador, Promotor y Moderador) .

## 3. Usabilidad y Diseño (UX/UI)

**RNF-06:** La aplicación debe seguir un diseño Mobile-First utilizando Bootstrap 5, garantizando que sea completamente funcional en dispositivos móviles y de escritorio.

**RNF-07:** La interfaz debe utilizar la paleta de colores oficial establecida ( #2A5C82, #FF8C42, #43B05C, #F4F7F6) para mantener la identidad visual y la jerarquía de información.

**RNF-08:** Se deberá utilizar fuentes de Google: Montserrat para títulos y Open Sans para cuerpos de texto.

## 4. Disponibilidad y Servicio

**RNF-09:** El sistema informará al promotor sobre el estado de su validación mediante un mensaje de estado en el Dashboard principal tras el inicio de sesión.

**RNF-10 :** El backend debe estar estructurado siguiendo el patrón de arquitectura MVC (Modelo-Vista-Controlador) para asegurar el cumplimiento de la separación de responsabilidades.

## 5. Estándares Técnicos

**RNF-12:** El código fuente (nombres de variables, funciones y rutas) se escribirá en Inglés, mientras que los comentarios y la interfaz de usuario final estarán en Español.

**RNF-13:** El sistema debe utilizar MongoDB Atlas como base de datos en la nube para garantizar la persistencia de los datos y la facilidad de conexión.

_Atributos de calidad validados para el Proyecto Integrador 1 - 2026_
