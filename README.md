# 🐾 PawTracker - Aplicación de Rastreo GPS

![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-~51.0.28-000020?logo=expo)
![Firebase](https://img.shields.io/badge/Firebase-11.0.1-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/License-Private-red)

**PawTracker** es una aplicación móvil desarrollada con React Native y Expo que permite el rastreo GPS en tiempo real de usuarios. La aplicación captura las coordenadas de ubicación (latitud y longitud) del dispositivo y las almacena en Firebase Realtime Database. Las coordenadas se visualizan posteriormente en un mapa interactivo disponible en el repositorio complementario [GPS-Dog](https://github.com/gisellopez1020/GPS-Dog).

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Funcionalidades](#-funcionalidades)
- [Integración con GPS-Dog](#-integración-con-gps-dog)
- [Permisos](#-permisos)
- [Scripts Disponibles](#-scripts-disponibles)
- [Almacenamiento de Datos](#-almacenamiento-de-datos)
- [Documentación Completa](#-documentación-completa)

## ✨ Características

- 🔐 **Autenticación de usuarios** con Firebase Authentication
- 📍 **Seguimiento GPS en tiempo real** con actualización cada 5 segundos
- 🌍 **Rastreo en segundo plano** incluso cuando la app no está activa
- ☁️ **Almacenamiento en la nube** con Firebase Realtime Database
- 📊 **Historial de ubicaciones** organizado por fecha
- 🗺️ **Visualización en mapa** mediante integración con [GPS-Dog](https://github.com/gisellopez1020/GPS-Dog)
- 📱 **Compatibilidad** con Android e iOS
- 🎨 **Interfaz intuitiva** con diseño amigable

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────┐
│   App_Paw_Tracker       │
│   (React Native)        │
│                         │
│  - Captura GPS          │
│  - Autenticación        │
│  - Envío de datos       │
└───────────┬─────────────┘
            │
            │ Firebase SDK
            ▼
┌─────────────────────────┐
│   Firebase              │
│                         │
│  - Authentication       │
│  - Realtime Database    │
└───────────┬─────────────┘
            │
            │ REST API / Realtime Sync
            ▼
┌─────────────────────────┐
│   GPS-Dog               │
│   (React DOM)           │
│                         │
│  - Visualización Mapa   │
│  - Marcadores GPS       │
└─────────────────────────┘
```

## 🛠️ Tecnologías Utilizadas

### Frontend Mobile

- **React Native** 0.74.5 - Framework principal
- **Expo** ~51.0.28 - Plataforma de desarrollo
- **React Navigation** 6.1.18 - Navegación entre pantallas

### Servicios de Backend

- **Firebase Authentication** - Gestión de usuarios
- **Firebase Realtime Database** - Almacenamiento de coordenadas

### Librerías Principales

- **expo-location** ~17.0.1 - Servicios de geolocalización
- **expo-task-manager** 11.8.2 - Tareas en segundo plano
- **date-fns** 4.1.0 - Manejo de fechas
- **react-native-vector-icons** 10.2.0 - Iconos

## 📦 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Cuenta de Firebase con proyecto configurado
- Android Studio (para Android) o Xcode (para iOS)
- Dispositivo móvil o emulador

## 🚀 Instalación

1. **Clona el repositorio:**

```bash
git clone https://github.com/gisellopez1020/App_Paw_Tracker.git
cd App_Paw_Tracker
```

2. **Instala las dependencias:**

```bash
npm install
```

3. **Configura las credenciales de Firebase:**

Edita el archivo `credenciales.js` y agrega tus credenciales de Firebase:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
  databaseURL: "TU_DATABASE_URL",
};
```

4. **Inicia la aplicación:**

```bash
npm start
```

## ⚙️ Configuración

### Variables de Entorno (credenciales.js)

El archivo `credenciales.js` utiliza variables de entorno para mayor seguridad:

```javascript
apiKey: import.meta.env.VITE_FIREBASE_API_KEY;
authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID;
storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
appId: import.meta.env.VITE_FIREBASE_APP_ID;
databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL;
```

### Configuración de Firebase Realtime Database

Estructura de datos recomendada:

```json
{
  "users": {
    "USER_ID": {
      "locations": {
        "2025-12-01": {
          "LOCATION_ID_1": {
            "latitude": -34.123456,
            "longitude": -58.123456,
            "timestamp": "2025-12-01T10:30:00.000Z"
          },
          "LOCATION_ID_2": { ... }
        }
      }
    }
  }
}
```

## 📁 Estructura del Proyecto

```
App_Paw_Tracker/
├── assets/                      # Recursos visuales
│   ├── icon.png                # Ícono de la app
│   ├── splash.png              # Pantalla de carga
│   ├── adaptive-icon.png       # Ícono adaptativo Android
│   ├── perrito1.png            # Imagen de login
│   ├── duke-champion.gif       # Animación en Home
│   └── 1.png                   # Fondo del header
├── screens/                     # Pantallas de la aplicación
│   ├── Login.js                # Pantalla de autenticación
│   └── Home.js                 # Pantalla principal con GPS
├── App.js                      # Componente raíz y navegación
├── credenciales.js             # Configuración de Firebase
├── package.json                # Dependencias del proyecto
├── app.json                    # Configuración de Expo
├── babel.config.js             # Configuración de Babel
├── eas.json                    # Configuración de EAS Build
└── README.md                   # Documentación
```

## 🎯 Funcionalidades

### 1. Autenticación (Login.js)

- **Inicio de sesión** con email y contraseña
- **Validación** de credenciales con Firebase Authentication
- **Persistencia de sesión** con AsyncStorage
- **Alertas** de error para credenciales incorrectas
- **Navegación automática** al Home tras login exitoso

```javascript
// Ejemplo de uso
await signInWithEmailAndPassword(auth, email, password);
```

### 2. Seguimiento GPS (Home.js)

#### Características del Rastreo:

- **Precisión alta**: `Location.Accuracy.BestForNavigation`
- **Intervalo de tiempo**: 5 segundos
- **Distancia mínima**: 5 metros
- **Rastreo en segundo plano** con notificación persistente

#### Funciones Principales:

**Iniciar Seguimiento:**

```javascript
const startTracking = async () => {
  // Solicita permisos
  // Obtiene ubicación inicial
  // Inicia seguimiento en segundo plano
  // Envía coordenadas a Firebase
};
```

**Detener Seguimiento:**

```javascript
const stopTracking = async () => {
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
};
```

**Envío a Firebase:**

```javascript
const sendLocationToFirebase = async (latitude, longitude) => {
  const userLocationRef = ref(db, `users/${userId}/locations`);
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const newLocationRef = push(child(userLocationRef, currentDate));
  await set(newLocationRef, {
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  });
};
```

### 3. Tarea en Segundo Plano

```javascript
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (data) {
    const { locations } = data;
    const location = locations[0];
    await sendLocationToFirebase(
      location.coords.latitude,
      location.coords.longitude
    );
  }
});
```

## 🗺️ Integración con GPS-Dog

Las coordenadas GPS capturadas por **PawTracker** se almacenan en Firebase Realtime Database y son consumidas por la aplicación web [GPS-Dog](https://github.com/gisellopez1020/GPS-Dog) para su visualización en un mapa interactivo.

### Flujo de Datos:

1. **PawTracker** captura coordenadas GPS del dispositivo móvil
2. Las coordenadas se envían a **Firebase Realtime Database** con estructura:
   - `users/{userId}/locations/{date}/{locationId}`
3. **GPS-Dog** (React DOM) lee en tiempo real desde Firebase
4. Las coordenadas se muestran como marcadores en un mapa (Google Maps/Leaflet)
5. El usuario puede visualizar la ruta completa y el historial de ubicaciones

### Sincronización:

- **Tiempo real**: Ambas apps usan Firebase Realtime Database
- **Actualización automática**: Los cambios se reflejan instantáneamente
- **Historial**: Las ubicaciones se agrupan por fecha para fácil consulta

## 🔒 Permisos

### Android (app.json)

```json
"permissions": [
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_BACKGROUND_LOCATION",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_LOCATION"
]
```

### iOS (app.json)

```json
"locationAlwaysAndWhenInUsePermission": "Permitir a PawTracker acceder a tu ubicación en todo momento.",
"locationAlwaysPermission": "Permitir a PawTracker usar tu ubicación en segundo plano",
"locationWhenInUsePermission": "Permitir a PawTracker acceder a tu ubicación cuando la app está en uso.",
"isIosBackgroundLocationEnabled": true
```

## 📜 Scripts Disponibles

```bash
# Iniciar el servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web
```

## 💾 Almacenamiento de Datos

### Estructura en Firebase:

```
users/
  └── {userId}/
      └── locations/
          └── {date}/
              └── {locationId}/
                  ├── latitude: number
                  ├── longitude: number
                  └── timestamp: ISO string
```

### Ejemplo:

```json
{
  "users": {
    "abc123xyz": {
      "locations": {
        "2025-12-01": {
          "-NqxYz123abc": {
            "latitude": -34.6037,
            "longitude": -58.3816,
            "timestamp": "2025-12-01T14:30:00.000Z"
          }
        }
      }
    }
  }
}
```

## 📱 Uso de la Aplicación

1. **Inicia sesión** con tus credenciales de Firebase
2. En la pantalla Home, presiona **"Iniciar Seguimiento"**
3. Acepta los **permisos de ubicación** (incluido segundo plano)
4. La app comenzará a enviar tu ubicación cada 5 segundos
5. Puedes minimizar la app y el seguimiento continuará
6. Visualiza tus coordenadas en tiempo real en [GPS-Dog](https://github.com/gisellopez1020/GPS-Dog)
7. Presiona **"Detener Seguimiento"** cuando desees parar

## 🔗 Repositorio Relacionado

- **GPS-Dog**: [https://github.com/gisellopez1020/GPS-Dog](https://github.com/gisellopez1020/GPS-Dog)
  - Visualización de coordenadas en mapa
  - Interfaz web con React DOM
  - Marcadores y rutas GPS

## 📚 Documentación Completa

Este proyecto cuenta con documentación detallada para diferentes aspectos del desarrollo y despliegue:

### Guías de Referencia

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - 🏗️ Arquitectura Técnica

  - Diagramas detallados del sistema
  - Flujo de datos completo
  - Componentes y responsabilidades
  - Patrones de diseño

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - 💻 Guía de Desarrollo

  - Setup del entorno completo
  - Configuración de herramientas
  - Convenciones de código
  - Debugging y troubleshooting

- **[INTEGRATION.md](INTEGRATION.md)** - 🔗 Integración con GPS-Dog

  - Sincronización en tiempo real
  - Estructura de datos compartida
  - Implementación de lectura/escritura
  - Características avanzadas

- **[DIAGRAMS.md](DIAGRAMS.md)** - 🎨 Diagramas Visuales
  - Diagramas de arquitectura
  - Flujos de proceso
  - Mapas de navegación
  - Timeline de eventos

### Inicio Rápido

**👨‍💻 Desarrollador:**

1. Lee [README.md](README.md) (este archivo)
2. Sigue [DEVELOPMENT.md](DEVELOPMENT.md) para configurar tu entorno
3. Revisa [ARCHITECTURE.md](ARCHITECTURE.md) para entender el sistema

## 📄 Licencia

Este proyecto es con fines educativos.

---

**Nota**: Recuerda configurar correctamente Firebase y los permisos de ubicación antes de ejecutar la aplicación en un dispositivo real.
