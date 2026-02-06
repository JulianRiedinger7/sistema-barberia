# StyleSync: Sistema de Gestión para Barbería

Bienvenido a **StyleSync**, una plataforma moderna diseñada para simplificar la gestión de turnos, clientes y finanzas de tu barbería tradicional.

## Características Principales

### 📅 Gestión de Turnos (Admin & Barbero)
- **Agenda Interactiva:** Visualiza turnos agrupados por día.
- **Filtros Rápidos:** Navega fácilmente entre Hoy, Mañana y la Semana.
- **Acciones:** Marca turnos como "Asistió" (cobra) o elimínalos si fueron cancelados.
- **Bloqueo Inteligente:** Previene el cobro de turnos futuros.

### 💇‍♂️ Reserva de Turnos (Cliente)
- Interfaz intuitiva para elegir barbero, servicio y horario.
- Validación automática de disponibilidad (no permite reservar en el pasado).
- Confirmación visual inmediata.

### 💰 Finanzas y Administración
- **Control de Caja:** Registro automático de ingresos al completar turnos.
- **Gastos:** Formulario simple para registrar salidas de dinero.
- **Gráficos:** Visualización clara de Ingresos vs. Gastos.
- **Gestión de Equipo:** Alta y baja de barberos, y configuración de horarios laborales.

## Tecnologías Utilizadas

- **Framework:** Next.js 15+ (App Router)
- **Lenguaje:** TypeScript
- **Base de Datos & Auth:** Supabase
- **Estilos:** Tailwind CSS + Shadcn/UI
- **Gráficos:** Recharts
- **Manejo de Fechas:** date-fns

## Configuración para Desarrollo

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/stylesync.git
    cd stylesync
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y agrega tus credenciales de Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```

4.  **Correr el proyecto:**
    ```bash
    npm run dev
    ```

    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue

Este proyecto está optimizado para ser desplegado en **Vercel**. Simplemente conecta tu repositorio de GitHub a Vercel e importa el proyecto. Recuerda configurar las mismas variables de entorno en el panel de Vercel.

---
Desarrollado con ❤️ para Barbería Tradicional.
