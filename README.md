# Evcureso

Plataforma web comunitaria para descubrir, promover y gestionar eventos locales.

## Descripcion

Evcureso conecta tres tipos de usuarios:

1. Exploradores: buscan eventos y arman su plan del fin de semana.
2. Promotores: publican eventos oficiales.
3. Moderadores: revisan sugerencias comunitarias y gestionan usuarios.

## Estructura del Proyecto

1. Frontend: HTML5, CSS3, JavaScript y Bootstrap 5.
2. Backend: Node.js, Express y MongoDB con Mongoose.

## Requisitos Previos

1. Node.js 18 o superior.
2. npm.
3. MongoDB Atlas o instancia local de MongoDB.

## Instalacion

1. Clonar el repositorio.

```bash
git clone https://github.com/TU-USUARIO/evcureso.git
cd evcureso
```

2. Instalar dependencias del backend.

```bash
cd backend
npm install
```

3. Crear el archivo `backend/.env` con al menos esta variable.

```env
MONGODB_URI=tu_uri_de_mongodb
PORT=3000
```

## Ejecucion en Desarrollo

1. Iniciar el backend.

```bash
cd backend
node index.js
```

2. Abrir el frontend desde los archivos HTML en la carpeta `frontend`.

## Convenciones de Codigo

1. Archivos y carpetas: kebab-case.
2. Variables y funciones: camelCase.
3. Clases JS: PascalCase.
4. Idioma: codigo en ingles, interfaz y documentacion en espanol.

## Gitflow

1. Ramas principales: `main` y `develop`.
2. Ramas de trabajo: `feature/*`, `release/*`, `hotfix/*`.

## Convencion de Commits

Formato: `tipo: descripcion breve`

Tipos recomendados: `feat`, `fix`, `docs`, `style`, `refactor`, `test`.

Proyecto Integrador 1 - Universidad CENFOTEC - 2026.
