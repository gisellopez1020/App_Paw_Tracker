# 🏗️ Arquitectura de PawTracker

## Visión General

PawTracker sigue una arquitectura cliente-servidor donde la aplicación móvil actúa como cliente que captura y envía datos GPS, Firebase actúa como servidor backend, y GPS-Dog consume estos datos para visualización.

## Diagrama de Arquitectura Detallado

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                     │
│                      (React Native)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐                    ┌──────────────┐      │
│  │   Login.js   │                    │   Home.js    │      │
│  │              │                    │              │      │
│  │ - Email      │   Navigation       │ - GPS Track  │      │
│  │ - Password   │ ─────────────────► │ - Start/Stop │      │
│  │ - Auth       │                    │ - Location   │      │
│  └──────┬───────┘                    └──────┬───────┘      │
│         │                                   │              │
└─────────┼───────────────────────────────────┼──────────────┘
          │                                   │
          │                                   │
┌─────────┼───────────────────────────────────┼──────────────┐
│         │         CAPA DE SERVICIOS         │              │
│         │                                   │              │
│  ┌──────▼──────┐                   ┌────────▼─────────┐   │
│  │  Firebase   │                   │  expo-location   │   │
│  │    Auth     │                   │                  │   │
│  │             │                   │ - GPS Service    │   │
│  │ - signIn    │                   │ - Background     │   │
│  │ - signOut   │                   │ - Permissions    │   │
│  └──────┬──────┘                   └────────┬─────────┘   │
│         │                                   │              │
│         │                          ┌────────▼─────────┐   │
│         │                          │  TaskManager     │   │
│         │                          │                  │   │
│         │                          │ - Background     │   │
│         │                          │   Location Task  │   │
│         │                          └────────┬─────────┘   │
└─────────┼──────────────────────────────────┼──────────────┘
          │                                   │
          │                                   │
┌─────────┼───────────────────────────────────┼──────────────┐
│         │      CAPA DE ALMACENAMIENTO       │              │
│         │                                   │              │
│  ┌──────▼──────────────────────────────────▼─────────┐    │
│  │         Firebase Realtime Database                │    │
│  │                                                    │    │
│  │  users/                                            │    │
│  │    └── {userId}/                                   │    │
│  │        └── locations/                              │    │
│  │            └── {date}/                             │    │
│  │                └── {locationId}/                   │    │
│  │                    ├── latitude                    │    │
│  │                    ├── longitude                   │    │
│  │                    └── timestamp                   │    │
│  │                                                    │    │
│  └────────────────────────────┬───────────────────────┘    │
└───────────────────────────────┼────────────────────────────┘
                                │
                                │ Realtime Sync
                                │
┌───────────────────────────────▼────────────────────────────┐
│              APLICACIÓN DE VISUALIZACIÓN                   │
│                      (GPS-Dog)                             │
│                                                            │
│  ┌──────────────────────────────────────────────────┐     │
│  │            React DOM Web App                     │     │
│  │                                                  │     │
│  │  - Mapa interactivo (Google Maps/Leaflet)       │     │
│  │  - Marcadores de ubicación                      │     │
│  │  - Rutas y trazados                             │     │
│  │  - Historial de ubicaciones                     │     │
│  │  - Filtros por fecha                            │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Autenticación

```
Usuario → Login.js → Firebase Auth → Validación → Home.js
                          ↓
                    AsyncStorage (Persistencia)
```

### 2. Captura de Ubicación

```
Usuario presiona "Iniciar"
    ↓
Home.js solicita permisos
    ↓
expo-location captura GPS
    ↓
TaskManager programa tarea en segundo plano
    ↓
Cada 5 segundos / 5 metros
    ↓
sendLocationToFirebase()
    ↓
Firebase Realtime Database
    ↓
GPS-Dog recibe actualización en tiempo real
    ↓
Mapa se actualiza con nuevo marcador
```

### 3. Sincronización en Tiempo Real

```
PawTracker (Mobile)          Firebase           GPS-Dog (Web)
       │                        │                      │
       │──── push location ────►│                      │
       │                        │                      │
       │                        │◄──── listen ─────────│
       │                        │                      │
       │                        │──── notify ─────────►│
       │                        │                      │
       │                        │                  Update Map
```

## Componentes Principales

### App.js

**Responsabilidad**: Navegación y estructura principal

- Configura React Navigation
- Define Stack Navigator
- Maneja transiciones entre pantallas
- Aplica estilos globales al header

**Tecnologías**:

- `@react-navigation/native`
- `@react-navigation/stack`

### Login.js

**Responsabilidad**: Autenticación de usuarios

- Captura credenciales (email/password)
- Comunica con Firebase Authentication
- Maneja errores de login
- Persiste sesión con AsyncStorage
- Navega a Home tras éxito

**Estado**:

```javascript
{
  email: string,
  password: string
}
```

**Métodos clave**:

- `logueo()`: Autentica usuario

### Home.js

**Responsabilidad**: Gestión de ubicación GPS

- Solicita permisos de ubicación
- Inicia/detiene seguimiento GPS
- Envía coordenadas a Firebase
- Muestra ubicación actual
- Gestiona historial de ubicaciones

**Estado**:

```javascript
{
  location: {latitude, longitude} | null,
  errorMsg: string | null,
  isTracking: boolean,
  userId: string | null
}
```

**Métodos clave**:

- `requestPermissions()`: Solicita permisos
- `startTracking()`: Inicia rastreo
- `stopTracking()`: Detiene rastreo
- `sendLocationToFirebase()`: Guarda ubicación
- `getLocationHistory()`: Obtiene historial

### TaskManager (Background)

**Responsabilidad**: Seguimiento en segundo plano

- Define tarea `background-location-task`
- Captura ubicaciones cuando app está en background
- Envía datos a Firebase automáticamente
- Muestra notificación persistente

**Configuración**:

```javascript
{
  accuracy: BestForNavigation,
  timeInterval: 5000ms,
  distanceInterval: 5m,
  showsBackgroundLocationIndicator: true
}
```

## Patrones de Diseño Utilizados

### 1. **Container/Presentational Pattern**

- Componentes funcionales con hooks
- Separación de lógica y presentación
- Estado local con `useState`
- Efectos con `useEffect`

### 2. **Observer Pattern**

- Firebase Realtime Database con listeners
- `onAuthStateChanged` para estado de autenticación
- Actualización automática de UI

### 3. **Singleton Pattern**

- Instancia única de Firebase (`appFirebase`)
- Autenticación compartida
- Base de datos compartida

## Seguridad

### Autenticación

- Firebase Authentication con email/password
- Tokens JWT gestionados por Firebase
- Persistencia segura con AsyncStorage

### Permisos

- Solicitud explícita de permisos de ubicación
- Validación de permisos antes de iniciar tracking
- Permisos granulares (foreground/background)

### Datos

- Reglas de seguridad en Firebase
- Solo usuarios autenticados pueden escribir
- Aislamiento de datos por userId

```json
// Firebase Rules (recomendadas)
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## Escalabilidad

### Optimizaciones Actuales

- Envío de ubicaciones cada 5 segundos (no en tiempo real continuo)
- Distancia mínima de 5 metros para reducir escrituras
- Agrupación por fecha para mejor organización
- Push IDs para evitar colisiones

### Mejoras Futuras

- Implementar batching de ubicaciones
- Compresión de datos GPS
- Caché local con sync diferido
- Geohashing para consultas espaciales
- Implementar Cloud Functions para procesamiento

## Tecnologías y Versiones

| Tecnología        | Versión  | Propósito            |
| ----------------- | -------- | -------------------- |
| React Native      | 0.74.5   | Framework mobile     |
| Expo              | ~51.0.28 | Desarrollo y build   |
| Firebase          | 11.0.1   | Backend as a Service |
| expo-location     | ~17.0.1  | Servicios GPS        |
| expo-task-manager | 11.8.2   | Background tasks     |
| React Navigation  | 6.1.18   | Navegación           |
| date-fns          | 4.1.0    | Formateo de fechas   |

## Integración con GPS-Dog

### Contrato de Datos

PawTracker y GPS-Dog comparten el mismo esquema de datos en Firebase:

```typescript
interface Location {
  latitude: number;
  longitude: number;
  timestamp: string; // ISO 8601
}

interface UserLocations {
  [date: string]: {
    [locationId: string]: Location;
  };
}
```

### Sincronización

- **Escritura**: PawTracker escribe en `users/{userId}/locations/{date}/`
- **Lectura**: GPS-Dog lee desde la misma ruta
- **Tiempo real**: Ambos usan Firebase listeners
- **Sin API intermedia**: Comunicación directa vía Firebase

## Limitaciones Conocidas

1. **Consumo de batería**: Tracking continuo consume batería significativa
2. **Precisión GPS**: Varía según dispositivo y condiciones
3. **Límites de Firebase**: Plan gratuito tiene límites de escritura
4. **Background en iOS**: Restricciones más estrictas que Android
5. **Red requerida**: Necesita conexión para enviar datos

## Decisiones de Arquitectura

### ¿Por qué Firebase?

- Realtime Database para sincronización instantánea
- Authentication integrada
- Sin necesidad de servidor propio
- SDKs oficiales para React Native
- Escalabilidad automática

### ¿Por qué Expo?

- Desarrollo más rápido
- Actualizaciones OTA
- APIs nativas simplificadas (Location, TaskManager)
- Build service (EAS)
- Mejor experiencia de desarrollo

### ¿Por qué React Navigation?

- Estándar de la industria
- Navegación stack natural para la app
- Customización de headers
- Transiciones suaves

---

**Última actualización**: Diciembre 2025
