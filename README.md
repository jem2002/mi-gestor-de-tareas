# **🚀 Mi Gestor de Tareas Pro**

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Electron](https://img.shields.io/badge/Electron-39.2-47848F?logo=electron) ![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react) ![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css) ![Status](https://img.shields.io/badge/Status-Stable-success)

Una aplicación de escritorio moderna y minimalista diseñada para maximizar la productividad personal. Combina gestión de tareas visual, técnicas de enfoque profundo y planificación a mediano plazo.

> **Nota:** Funciona **100% offline**. Tus datos permanecen privados en tu dispositivo.

---

## **✨ Características Principales**

### **1. 🚦 Gestor de Tareas Visual**
El núcleo de la aplicación. Clasifica tus tareas automáticamente según su urgencia con un código de colores intuitivo:

*   **🟣 Hoy (Púrpura):** Foco inmediato y prioritario.
*   **🔴 1-3 Días (Rojo):** Crítico, fecha límite próxima.
*   **🟠 4-9 Días (Ámbar):** Atención requerida pronto.
*   **🟢 10-21 Días (Verde):** Tiempo seguro para planificar.
*   **⚪ 22+ Días (Gris):** Futuro lejano / Backlog.
*   **🏁 Completadas:** Se archivan visualmente sin estorbar.

### **2. ⏱️ Modo Enfoque (Focus Timer)**
Un sistema diseñado para evitar el *burnout* y mantener la concentración:

*   **Configuración Previa:** Define tu tarea y tiempo antes de empezar.
*   **Regla 4:1:** Calcula automáticamente el tiempo de descanso ideal (ej: 60 min trabajo -> 15 min descanso).
*   **Transiciones Automáticas:** Al terminar el trabajo, automáticamente inicia el descanso (y viceversa).
*   **Gestión Flexible:** Cambia de tarea o complétalas durante la sesión sin interrumpir tu flujo.
*   **Modal de Sesión Completada:** Celebra tu logro con un resumen al finalizar ambos temporizadores.
*   **🔔 Notificaciones:** Alerta de sonido y notificación nativa en cada transición.

### **3. 📅 Calendario Interactivo Dual**
Planificación visual a mediano plazo:

*   **Vista Dual:** Muestra el mes actual y el siguiente simultáneamente.
*   **Indicadores Inteligentes:** Puntos de color en los días según la tarea más urgente.
*   **Detalle Diario:** Clickea un día para ver y gestionar sus tareas específicas.

### **4. 🎨 Experiencia de Usuario (UX)**
*   **Modo Oscuro Nativo:** Perfecto para trabajar de noche.
*   **Barra Lateral Colapsable:** Maximiza el espacio de trabajo.
*   **Persistencia Local:** Datos guardados en `localStorage`. Privacidad total.

---

## **🛠️ Instalación y Desarrollo**

### **Prerrequisitos**
Necesitas tener instalado [Node.js](https://nodejs.org/) (v18 o superior).

### **Pasos para iniciar**

1.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

2.  **Modo Desarrollo (Hot Reload):**
    ```bash
    npm run electron:dev
    ```

3.  **Generar Ejecutable (.exe):**
    El instalador se guardará en la carpeta `release/`.
    ```bash
    npm run electron:build
    ```

---

## **📂 Estructura del Proyecto**

| Archivo/Carpeta | Descripción |
| :--- | :--- |
| `src/App.jsx` | **Core**. Lógica de negocio, estado (Tasks, Timer, Calendar) y UI. |
| `main.js` | Configuración del proceso principal de Electron (Ventana, OS). |
| `src/index.css` | Estilos globales y configuración de Tailwind v4. |
| `public/icon.ico` | Icono de la aplicación para el escritorio y barra de tareas. |

---

## **💡 Atajos y Trucos**

*   **Gestión en Sesión:** Durante el Modo Enfoque, usa el selector para cambiar de tarea o el botón verde para completarla sin salir.
*   **Configuración Rápida:** El campo de minutos permite borrado completo para entrada rápida de nuevos valores.
*   **Filtros Rápidos:** Usa la barra superior en la lista de tareas para filtrar por etiquetas (Trabajo, Personal, etc.).
*   **Backup:** Al ser local, puedes hacer backup copiando el archivo de almacenamiento local de tu navegador/electron si es necesario.

---

<div align="center">
  <i>Creado para dominar el tiempo, no para que el tiempo te domine a ti.</i>
</div>