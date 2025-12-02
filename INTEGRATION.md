# 🔗 Integración PawTracker ↔ GPS-Dog

## Visión General

Este documento explica cómo **PawTracker** (aplicación móvil) y **GPS-Dog** (aplicación web) trabajan juntos para proporcionar un sistema completo de rastreo GPS.

```
┌──────────────────┐         ┌──────────────┐         ┌──────────────────┐
│   PawTracker     │         │   Firebase   │         │     GPS-Dog      │
│  (React Native)  │────────▶│   Realtime   │◀────────│   (React DOM)    │
│                  │  Write  │   Database   │  Read   │                  │
│  📱 Mobile App   │         │              │         │  🗺️ Web Map      │
└──────────────────┘         └──────────────┘         └──────────────────┘
```

## Arquitectura de Integración

### Flujo de Datos Completo

```
1. Usuario inicia sesión en PawTracker
        ↓
2. PawTracker captura coordenadas GPS
        ↓
3. Coordenadas se envían a Firebase Realtime Database
        ↓
4. Firebase notifica a GPS-Dog (listener)
        ↓
5. GPS-Dog lee las nuevas coordenadas
        ↓
6. GPS-Dog actualiza el mapa con marcador
        ↓
7. Usuario ve su ubicación en el mapa web
```

## Estructura de Datos Compartida

Ambas aplicaciones utilizan la misma estructura en Firebase:

```
firebase-database/
└── users/
    └── {userId}/
        └── locations/
            └── {date}/                 // Formato: YYYY-MM-DD
                └── {locationId}/       // Push ID único
                    ├── latitude: number
                    ├── longitude: number
                    └── timestamp: string (ISO 8601)
```

### Ejemplo de Datos

```json
{
  "users": {
    "xK3mP9qL2nR8sT4vW1yZ5": {
      "locations": {
        "2025-12-01": {
          "-NqxYz123abc": {
            "latitude": -34.6037,
            "longitude": -58.3816,
            "timestamp": "2025-12-01T14:30:15.123Z"
          },
          "-NqxYz456def": {
            "latitude": -34.6045,
            "longitude": -58.382,
            "timestamp": "2025-12-01T14:30:20.456Z"
          },
          "-NqxYz789ghi": {
            "latitude": -34.6053,
            "longitude": -58.3825,
            "timestamp": "2025-12-01T14:30:25.789Z"
          }
        },
        "2025-12-02": {
          "-NqxZa123jkl": {
            "latitude": -34.61,
            "longitude": -58.39,
            "timestamp": "2025-12-02T09:15:00.000Z"
          }
        }
      }
    }
  }
}
```

## PawTracker: Escritura de Datos

### Implementación en Home.js

```javascript
import { getDatabase, ref, child, push, set } from "firebase/realtime-database";
import { format } from "date-fns";

const db = getDatabase(appFirebase);

const sendLocationToFirebase = async (latitude, longitude) => {
  try {
    if (userId) {
      // Path: users/{userId}/locations
      const userLocationRef = ref(db, `users/${userId}/locations`);

      // Fecha actual en formato YYYY-MM-DD
      const currentDate = format(new Date(), "yyyy-MM-dd");

      // Crear referencia con fecha
      const newLocationRef = push(child(userLocationRef, currentDate));

      // Guardar coordenadas
      await set(newLocationRef, {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });

      console.log("✅ Ubicación enviada a Firebase");
    }
  } catch (error) {
    console.error("❌ Error al enviar ubicación:", error);
  }
};
```

### Frecuencia de Envío

```javascript
// Configuración en Home.js
await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 5000, // Cada 5 segundos
  distanceInterval: 5, // O cada 5 metros
  showsBackgroundLocationIndicator: true,
  foregroundService: {
    notificationTitle: "Seguimiento activo",
    notificationBody: "Rastreando ubicación",
  },
});
```

## GPS-Dog: Lectura de Datos

### Estructura Esperada en GPS-Dog

GPS-Dog debe implementar listeners de Firebase para recibir actualizaciones en tiempo real.

```javascript
// Ejemplo de implementación en GPS-Dog (React)
import { getDatabase, ref, onValue } from "firebase/database";

const GpsDogMap = ({ userId }) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const db = getDatabase();
    const locationsRef = ref(db, `users/${userId}/locations`);

    // Listener en tiempo real
    const unsubscribe = onValue(locationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Convertir objeto a array
        const locationsArray = [];
        Object.keys(data).forEach((date) => {
          Object.keys(data[date]).forEach((locationId) => {
            locationsArray.push({
              id: locationId,
              date: date,
              ...data[date][locationId],
            });
          });
        });

        // Ordenar por timestamp
        locationsArray.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        setLocations(locationsArray);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <Map>
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
          timestamp={location.timestamp}
        />
      ))}
    </Map>
  );
};
```

### Visualización en Mapa

GPS-Dog puede usar Google Maps o Leaflet:

#### Con Google Maps

```javascript
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";

<GoogleMap
  center={{ lat: locations[0]?.latitude, lng: locations[0]?.longitude }}
  zoom={15}
>
  {/* Marcadores */}
  {locations.map((loc) => (
    <Marker
      key={loc.id}
      position={{ lat: loc.latitude, lng: loc.longitude }}
      label={new Date(loc.timestamp).toLocaleTimeString()}
    />
  ))}

  {/* Línea de ruta */}
  <Polyline
    path={locations.map((loc) => ({
      lat: loc.latitude,
      lng: loc.longitude,
    }))}
    options={{
      strokeColor: "#FF0000",
      strokeWeight: 3,
    }}
  />
</GoogleMap>;
```

#### Con Leaflet

```javascript
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

<MapContainer
  center={[locations[0]?.latitude, locations[0]?.longitude]}
  zoom={15}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

  {/* Marcadores */}
  {locations.map((loc) => (
    <Marker key={loc.id} position={[loc.latitude, loc.longitude]} />
  ))}

  {/* Línea de ruta */}
  <Polyline
    positions={locations.map((loc) => [loc.latitude, loc.longitude])}
    color="red"
  />
</MapContainer>;
```

## Sincronización en Tiempo Real

### Event Flow

```
PawTracker                  Firebase                    GPS-Dog
    │                          │                           │
    │──── Write Location ─────▶│                           │
    │     (latitude, lon)      │                           │
    │                          │                           │
    │                          │◄──── onValue listener ────│
    │                          │                           │
    │                          │──── Snapshot ────────────▶│
    │                          │     (new data)            │
    │                          │                           │
    │                          │                       Update Map
    │                          │                        Add Marker
```

### Latencia Esperada

- **Escritura en Firebase**: < 100ms
- **Propagación a listeners**: < 200ms
- **Actualización de UI**: < 100ms
- **Total**: Aproximadamente 300-500ms

## Filtros y Consultas

### Por Fecha (GPS-Dog)

```javascript
// Obtener ubicaciones de una fecha específica
const getLocationsByDate = (userId, date) => {
  const db = getDatabase();
  const dateRef = ref(db, `users/${userId}/locations/${date}`);

  return onValue(dateRef, (snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val();
    }
  });
};

// Uso
getLocationsByDate(userId, "2025-12-01");
```

### Por Rango de Tiempo

```javascript
// Filtrar últimas N ubicaciones
const getRecentLocations = (locations, count = 10) => {
  return locations
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, count);
};
```

### Por Distancia

```javascript
// Calcular distancia entre dos puntos
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Filtrar ubicaciones en un radio
const getLocationsInRadius = (locations, centerLat, centerLon, radiusKm) => {
  return locations.filter((loc) => {
    const distance = haversine(
      centerLat,
      centerLon,
      loc.latitude,
      loc.longitude
    );
    return distance <= radiusKm;
  });
};
```

## Características Avanzadas

### 1. Geocoding Inverso

```javascript
// Convertir coordenadas a dirección (GPS-Dog)
const getAddress = async (latitude, longitude) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`
  );
  const data = await response.json();
  return data.results[0]?.formatted_address;
};
```

### 2. Estadísticas de Movimiento

```javascript
// Calcular distancia total recorrida
const getTotalDistance = (locations) => {
  let total = 0;
  for (let i = 1; i < locations.length; i++) {
    total += haversine(
      locations[i - 1].latitude,
      locations[i - 1].longitude,
      locations[i].latitude,
      locations[i].longitude
    );
  }
  return total;
};

// Calcular velocidad promedio
const getAverageSpeed = (locations) => {
  if (locations.length < 2) return 0;

  const totalDistance = getTotalDistance(locations);
  const totalTime =
    (new Date(locations[locations.length - 1].timestamp) -
      new Date(locations[0].timestamp)) /
    1000 /
    3600; // horas

  return totalDistance / totalTime; // km/h
};
```

### 3. Detección de Paradas

```javascript
// Detectar si el usuario está detenido
const detectStops = (locations, minTimeMinutes = 5, maxDistanceMeters = 50) => {
  const stops = [];
  let currentStop = null;

  for (let i = 1; i < locations.length; i++) {
    const distance =
      haversine(
        locations[i - 1].latitude,
        locations[i - 1].longitude,
        locations[i].latitude,
        locations[i].longitude
      ) * 1000; // metros

    if (distance < maxDistanceMeters) {
      if (!currentStop) {
        currentStop = {
          start: locations[i - 1],
          end: locations[i],
          location: locations[i - 1],
        };
      } else {
        currentStop.end = locations[i];
      }
    } else {
      if (currentStop) {
        const duration =
          (new Date(currentStop.end.timestamp) -
            new Date(currentStop.start.timestamp)) /
          1000 /
          60; // minutos

        if (duration >= minTimeMinutes) {
          stops.push(currentStop);
        }
        currentStop = null;
      }
    }
  }

  return stops;
};
```

## Seguridad y Privacidad

### Reglas de Firebase

```json
{
  "rules": {
    "users": {
      "$uid": {
        // Solo el propietario puede leer sus datos
        ".read": "$uid === auth.uid",

        // Solo el propietario puede escribir sus datos
        ".write": "$uid === auth.uid",

        "locations": {
          "$date": {
            "$locationId": {
              // Validar estructura de datos
              ".validate": "newData.hasChildren(['latitude', 'longitude', 'timestamp'])",

              "latitude": {
                ".validate": "newData.isNumber() && newData.val() >= -90 && newData.val() <= 90"
              },
              "longitude": {
                ".validate": "newData.isNumber() && newData.val() >= -180 && newData.val() <= 180"
              },
              "timestamp": {
                ".validate": "newData.isString()"
              }
            }
          }
        }
      }
    }
  }
}
```

### Autenticación Compartida

Ambas apps deben usar el mismo proyecto de Firebase:

**PawTracker**:

```javascript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
const auth = getAuth(appFirebase);
await signInWithEmailAndPassword(auth, email, password);
```

**GPS-Dog**:

```javascript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
const auth = getAuth(appFirebase);
await signInWithEmailAndPassword(auth, email, password);
```

## Testing de Integración

### 1. Test de Escritura (PawTracker)

```javascript
// Test manual
const testSendLocation = async () => {
  await sendLocationToFirebase(-34.6037, -58.3816);
  console.log("✅ Ubicación de prueba enviada");
};
```

### 2. Test de Lectura (GPS-Dog)

```javascript
// Verificar que se reciben datos
const db = getDatabase();
const locationsRef = ref(db, `users/${userId}/locations`);

get(locationsRef).then((snapshot) => {
  if (snapshot.exists()) {
    console.log("✅ Datos recibidos:", snapshot.val());
  } else {
    console.log("❌ No hay datos");
  }
});
```

### 3. Test End-to-End

1. Inicia PawTracker en móvil
2. Inicia GPS-Dog en navegador
3. Inicia seguimiento en PawTracker
4. Verifica que aparezcan marcadores en GPS-Dog en tiempo real
5. Detén seguimiento
6. Verifica que el historial sea visible

## Troubleshooting

### Problema: GPS-Dog no recibe ubicaciones

**Solución**:

```javascript
// Verificar autenticación
const auth = getAuth();
console.log("Usuario:", auth.currentUser);

// Verificar path
console.log("Path:", `users/${userId}/locations`);

// Verificar listener
const locationsRef = ref(db, `users/${userId}/locations`);
onValue(locationsRef, (snapshot) => {
  console.log("Snapshot:", snapshot.exists(), snapshot.val());
});
```

### Problema: Latencia alta

**Solución**:

- Verificar conexión a internet
- Reducir frecuencia de actualización en PawTracker
- Implementar caché local en GPS-Dog
- Usar índices en Firebase Database

### Problema: Datos duplicados

**Solución**:

```javascript
// Usar push() para generar IDs únicos
const newLocationRef = push(child(userLocationRef, currentDate));
```

## Optimizaciones

### 1. Batching de Ubicaciones

```javascript
// PawTracker: Enviar múltiples ubicaciones a la vez
const locationBuffer = [];

const bufferLocation = (lat, lon) => {
  locationBuffer.push({
    latitude: lat,
    longitude: lon,
    timestamp: new Date().toISOString(),
  });

  if (locationBuffer.length >= 10) {
    sendBatchToFirebase();
  }
};

const sendBatchToFirebase = async () => {
  const updates = {};
  const currentDate = format(new Date(), "yyyy-MM-dd");

  locationBuffer.forEach((location) => {
    const newKey = push(child(ref(db), "temp")).key;
    updates[`users/${userId}/locations/${currentDate}/${newKey}`] = location;
  });

  await update(ref(db), updates);
  locationBuffer.length = 0;
};
```

### 2. Compresión de Datos

```javascript
// Reducir precisión de coordenadas
const compressCoordinates = (lat, lon) => {
  return {
    latitude: Math.round(lat * 1000000) / 1000000, // 6 decimales
    longitude: Math.round(lon * 1000000) / 1000000,
  };
};
```

---

**Para más información sobre GPS-Dog**, visita: https://github.com/gisellopez1020/GPS-Dog
