# Requerimientos Funcionales (RF) - Plataforma Evcureso

**A continuación se listan los requerimientos para el sistema Evcureso, diseñados para ser medibles y verificables, integrando la gestión de accesos con la lógica operativa del mapa.**

## 1. Gestión de Acceso y Perfiles (Autenticación)

**RF-01:** El sistema permitirá el registro de Promotores solicitando datos básicos (Nombre, Correo, Organización). Las cuentas nuevas quedarán en estado "Pendiente".

**RF-02:** El sistema permitirá el inicio de sesión para Promotores y Moderadores. Los Usuarios Exploradores podrán usar el mapa sin registrarse (acceso anónimo).

**RF-03:** El Administrador/Moderador podrá cambiar el estado de un Promotor a "Aprobado" mediante una interfaz sencilla de lista.

## 2. Gestión de Eventos (Promotores)

**RF-04:** El sistema debe permitir a los promotores autenticados crear eventos proporcionando: nombre, descripción, fecha/hora, ubicación geográfica (mediante pin en mapa) y categorías.

**RF-05:** El sistema debe validar que la cancelación de un evento ocurra con un tiempo mínimo de 63 horas de antelación. De lo contrario, la opción de cancelar estará inhabilitada.

**RF-06:** El promotor debe poder visualizar un panel de "Sugerencias de la Comunidad" para aprobar o rechazar eventos propuestos por usuarios en su zona.

## 3. Exploración y Usuario (Geolocalización)

**RF-07:** El sistema debe mostrar un mapa interactivo (Leaflet) con pines representativos de los eventos activos, diferenciando visualmente oficiales de comunitarios.

**RF-08:** El usuario debe poder definir un radio de interés (5km, 10km, 20km) mediante un selector; el mapa actualizará los pines automáticamente según esta preferencia.

**RF-09:** Los usuarios deben poder sugerir eventos enviando una foto (vía URL o archivo) y ubicación. Estos se guardarán con el estado inicial "Por Verificar".

**RF-10:** El sistema debe permitir guardar eventos en una lista personalizada denominada "Plan para el finde".

## 4. Moderación y Calidad de Datos

**RF-11:** El moderador debe tener una herramienta de "Fusión" para unir eventos detectados como duplicados, manteniendo la información más completa de ambos registros.

**RF-12:** El moderador debe poder asignar etiquetas de categoría (#AireLibre, #Cultura, etc.) a eventos comunitarios antes de su publicación masiva en el mapa.
