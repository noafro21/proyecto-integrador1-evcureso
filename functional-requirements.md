# Requerimientos Funcionales (RF) - Plataforma Evcureso

**A continuación se listan los requerimientos para el sistema Evcureso, diseñados para ser medibles y verificables, integrando la gestión de accesos con la lógica operativa del mapa.**

## 1. Gestión de Acceso y Perfiles (Autenticación)

**RF-01:** El sistema debe permitir el registro de nuevos usuarios. Por diseño de negocio y seguridad, todo nuevo registro recibirá automáticamente el rol de "Usuario/Explorador"

**RF-02:** El sistema debe permitir el registro de Promotores, pero sus cuentas quedarán en estado "Pendiente" hasta que un Administrador/Moderador realice la aprobación manual mediante una interfaz de lista.

**RF-03:** El sistema debe permitir el inicio de sesión para los tres roles definidos (Explorador, Promotor, Moderador) utilizando las credenciales de prueba proporcionadas por el cliente.

**RF-04:** Interfaz Dinámica Unificada: Todos los usuarios deben utilizar la misma pantalla principal. Sin embargo, el sistema activará o desactivará herramientas de gestión (botones de creación, paneles de aprobación, etc.) de forma dinámica según el rol detectado al iniciar sesión.

## 2. Gestión de Eventos (Promotores)

**RF-05:** El sistema debe permitir a los promotores autenticados y aprobados crear eventos proporcionando: nombre, descripción, fecha/hora, ubicación geográfica (mediante pin en mapa) y categorías.

**RF-06:** El sistema debe validar que la cancelación de un evento ocurra con un tiempo mínimo de 63 horas de antelación. De lo contrario, la opción de cancelar estará inhabilitada.

**RF-07:** El promotor debe poder visualizar un panel de "Sugerencias de la Comunidad" para aprobar o rechazar eventos propuestos por usuarios en su zona.

## 3. Exploración y Usuario (Geolocalización)

**RF-08:** Los usuarios deben poder sugerir eventos enviando una foto (vía URL o archivo). Estos se guardarán con el estado inicial "Por Verificar".

**RF-09:** El sistema debe permitir guardar eventos en una lista personalizada denominada "Plan para el finde".

## 4. Moderación y Calidad de Datos

**RF-10:** El moderador debe tener una herramienta de "Fusión" para unir eventos detectados como duplicados, manteniendo la información más completa de ambos registros.

**RF-11:** El moderador debe poder asignar etiquetas de categoría (#AireLibre, #Cultura, etc.) a eventos comunitarios antes de su publicación masiva en el mapa.
