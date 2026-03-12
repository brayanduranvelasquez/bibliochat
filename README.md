# 📚 BiblioChat - RAG Académico

¡Bienvenido a **BiblioChat**! Un proyecto experimental y académico diseñado para explorar las capacidades de los sistemas de **Generación Aumentada por Recuperación (RAG)** aplicados al mundo literario.

## 🌟 ¿Qué es BiblioChat?

BiblioChat es una plataforma de chat inteligente enfocada en libros. No es solo un chat convencional; es una implementación práctica de cómo conectar una base de datos relacional con modelos de lenguaje avanzados (LLM) utilizando herramientas de vanguardia en la industria del desarrollo web.

La idea central es que, antes de responder sobre un libro, el sistema consulte su propia base de datos para ofrecer información precisa y contextualizada basada en los registros existentes.

## 🛠️ Tecnologías Utilizadas

Este proyecto utiliza un stack moderno y profesional dividido en microservicios:

### 🖥️ Frontend
*   **React + Vite**: Para una interfaz rápida, reactiva y moderna.
*   **Vercel AI SDK**: Integración directa con flujos de IA y streaming de respuestas.
*   **Tailwind CSS 4**: Diseño premium, minimalista y responsivo.
*   **Shadcn UI / Radix UI**: Componentes de alta calidad y accesibles.
*   **TanStack Query**: Gestión eficiente del estado y las peticiones asíncronas.

### ⚙️ Backend
*   **NestJS**: Framework de Node.js robusto y escalable.
*   **Prisma ORM**: Modelado de datos elegante y seguro.
*   **PostgreSQL**: Base de datos relacional para el almacenamiento de libros y usuarios.
*   **OpenRouter**: Gateway para acceder a los modelos de IA más potentes del mercado.

---

## ⚙️ Configuración del Entorno

Para que el proyecto funcione correctamente, es necesario configurar las variables de entorno en ambos directorios.

### 🔌 Backend (`/back`)

Crea un archivo `.env` en la carpeta `back/` con los siguientes valores:

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/bibliochat?schema=public"
OPENROUTER_API="tu_api_key_de_openrouter"
```

### 🎨 Frontend (`/front`)

Crea un archivo `.env` en la carpeta `front/` con los siguientes valores:

```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Cómo Levantar el Proyecto

Sigue estos pasos para poner en marcha la aplicación en tu entorno local.

### 1. Configuración de Base de Datos y Backend

Asegúrate de tener un servidor de **PostgreSQL** corriendo. Luego, ejecuta:

```bash
cd back
npm install

# Generar el cliente de Prisma y ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Sembrar la base de datos con libros de prueba
npm run seed

# Iniciar el servidor en modo desarrollo
npm run start:dev
```

### 2. Configuración del Frontend

En una nueva terminal, ejecuta:

```bash
cd front
npm install

# Iniciar la aplicación de React con Vite
npm run dev
```

---

## 🎓 Propósito Académico

Este repositorio tiene un fin estrictamente **didáctico y no comercial**. Se enfoca en resolver los siguientes desafíos técnicos:

1.  **Integración de RAG**: Cómo "alimentar" al modelo de IA con datos específicos de una base de datos antes de generar una respuesta.
2.  **Streaming de IA**: Implementación de respuestas en tiempo real usando el SDK de Vercel.
3.  **Arquitectura Limpia**: Separación clara entre la lógica de negocio (NestJS) y la capa de presentación (React).
4.  **Autenticación y Sesiones**: Manejo de perfiles de usuario y conversaciones persistentes.

## 🚀 Flujo de Trabajo (RAG)

Cuando un usuario pregunta sobre un libro en BiblioChat:
1.  **Consulta Previa**: El sistema intercepta la pregunta y busca en la base de datos de libros (vía Prisma).
2.  **Contextualización**: Si el libro existe, se extrae su información (título, descripción, autor).
3.  **Prompt Engineering**: Se envía el contexto al LLM (vía OpenRouter) para que genere una respuesta basada en los datos reales.
4.  **Respuesta Inteligente**: El usuario recibe una respuesta precisa, verificada por el sistema.
5.  **Prevención**: Si el libro no existe en la base de datos, de igual manera responde con la información que pueda responder el LLM.

---

> [!NOTE]
> Este proyecto es una **práctica de uso/académica**. Todos los datos y funcionalidades están diseñados para demostrar la conexión de tecnologías modernas de IA.
