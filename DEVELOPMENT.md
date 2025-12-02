# 📖 Guía de Desarrollo - PawTracker

## Configuración del Entorno de Desarrollo

### 1. Instalación de Herramientas

#### Node.js y npm

```bash
# Verificar instalación
node --version  # Debe ser v14+
npm --version
```

#### Expo CLI

```bash
# Instalar globalmente
npm install -g expo-cli

# Verificar instalación
expo --version
```

#### Git

```bash
git --version
```

### 2. Clonar y Configurar el Proyecto

```bash
# Clonar repositorio
git clone https://github.com/gisellopez1020/App_Paw_Tracker.git
cd App_Paw_Tracker

# Instalar dependencias
npm install

# O con yarn
yarn install
```

### 3. Configuración de Firebase

#### Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Authentication** (Email/Password)
4. Habilita **Realtime Database**

#### Configurar Reglas de Seguridad

**Realtime Database Rules**:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "locations": {
          ".indexOn": [".value"]
        }
      }
    }
  }
}
```

#### Obtener Credenciales

1. Ve a **Project Settings** → **General**
2. Añade una app web
3. Copia las credenciales

#### Configurar credenciales.js

```javascript
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abc123",
  databaseURL: "https://tu-proyecto.firebaseio.com",
};

const appFirebase = initializeApp(firebaseConfig);
export default appFirebase;
```

### 4. Configuración de Android

#### Android Studio

1. Descarga e instala [Android Studio](https://developer.android.com/studio)
2. Abre Android Studio → SDK Manager
3. Instala SDK Platform 33 (Android 13)
4. Instala Android SDK Build-Tools
5. Configura variables de entorno:

```bash
# Windows
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"
```

#### Crear AVD (Android Virtual Device)

1. Android Studio → AVD Manager
2. Create Virtual Device
3. Selecciona Pixel 5 o similar
4. System Image: Android 13 (API 33)
5. Finish

### 5. Configuración de iOS (Solo macOS)

#### Xcode

```bash
# Instalar Xcode desde App Store

# Instalar Command Line Tools
xcode-select --install

# Instalar CocoaPods
sudo gem install cocoapods
```

## Estructura de Desarrollo

### Organización de Archivos

```
App_Paw_Tracker/
├── assets/                     # Recursos estáticos
│   ├── icon.png               # 1024x1024 px
│   ├── splash.png             # 1242x2436 px
│   ├── adaptive-icon.png      # 1024x1024 px
│   └── ...
├── screens/                    # Pantallas de la app
│   ├── Login.js               # Autenticación
│   └── Home.js                # Rastreo GPS
├── App.js                     # Entrada principal
├── credenciales.js            # Config Firebase
├── package.json               # Dependencias
└── app.json                   # Config Expo
```

### Convenciones de Código

#### Nomenclatura

```javascript
// Componentes: PascalCase
const Login = () => { ... }
const Home = () => { ... }

// Funciones: camelCase
const logueo = async () => { ... }
const sendLocationToFirebase = async () => { ... }

// Constantes: UPPER_SNAKE_CASE
const LOCATION_TASK_NAME = "background-location-task";

// Variables: camelCase
const [email, setEmail] = useState();
const [isTracking, setIsTracking] = useState(false);
```

#### Estructura de Componentes

```javascript
import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

// 1. Imports externos

// 2. Imports locales

// 3. Constantes

// 4. Componente principal
const MiComponente = () => {
  // 4.1. State
  const [state, setState] = useState();

  // 4.2. Effects
  useEffect(() => {
    // ...
  }, []);

  // 4.3. Handlers
  const handleAction = () => {
    // ...
  };

  // 4.4. Render
  return <View style={styles.container}>{/* JSX */}</View>;
};

// 5. Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// 6. Export
export default MiComponente;
```

## Comandos de Desarrollo

### Iniciar Desarrollo

```bash
# Iniciar servidor Expo
npm start

# Iniciar con cache limpio
npm start -- --clear

# Iniciar en modo túnel (ngrok)
npm start -- --tunnel
```

### Ejecutar en Dispositivos

```bash
# Android
npm run android

# iOS (solo macOS)
npm run ios

# Web
npm run web
```

### Testing en Dispositivo Real

#### Opción 1: Expo Go App

1. Instala **Expo Go** desde Play Store o App Store
2. Escanea el QR code que muestra `npm start`
3. La app se cargará en tu dispositivo

#### Opción 2: Development Build

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Crear build de desarrollo
eas build --profile development --platform android

# Instalar en dispositivo
eas build:run -p android
```

## Debugging

### Console Logs

```javascript
// En el código
console.log("Debug:", variable);

// Ver logs en terminal donde corre npm start
```

### React Native Debugger

```bash
# Instalar
npm install -g react-devtools

# Iniciar
react-devtools

# En la app (shake device):
# → Debug JS Remotely
```

### Chrome DevTools

1. Abre la app en Expo
2. Shake el dispositivo → Debug Remote JS
3. Se abre Chrome con DevTools

### Logs de Firebase

```javascript
import { getAuth } from "firebase/auth";

const auth = getAuth();
console.log("Usuario actual:", auth.currentUser);
```

## Solución de Problemas Comunes

### 1. Error de permisos de ubicación

```javascript
// Verificar que app.json tenga:
"plugins": [
  [
    "expo-location",
    {
      "locationAlwaysAndWhenInUsePermission": "...",
      "isAndroidBackgroundLocationEnabled": true
    }
  ]
]

// Reinstalar app después de cambiar permisos
```

### 2. Firebase Authentication no funciona

```javascript
// Verificar que Firebase Auth esté habilitado
// Console Firebase → Authentication → Sign-in method → Email/Password (Enabled)

// Verificar credenciales en credenciales.js
console.log(firebaseConfig);
```

### 3. Location no se actualiza en background

```javascript
// Android: Verificar que el servicio foreground esté activo
// iOS: Verificar permisos "Always Allow"

// Verificar que la tarea esté registrada
const isRegistered = await TaskManager.isTaskRegisteredAsync(
  LOCATION_TASK_NAME
);
console.log("Tarea registrada:", isRegistered);
```

### 4. App crashea al iniciar

```bash
# Limpiar cache
npm start -- --clear

# Reinstalar dependencias
rm -rf node_modules
npm install

# Rebuild
expo prebuild --clean
```

### 5. No se conecta a Firebase

```javascript
// Verificar conexión a internet
// Verificar que databaseURL esté configurado
// Verificar reglas de Firebase Database
```

## Testing

### Testing Manual

#### Checklist de Testing

**Login**:

- [ ] Login exitoso con credenciales válidas
- [ ] Error con credenciales inválidas
- [ ] Persistencia de sesión
- [ ] Navegación a Home tras login

**Home - Permisos**:

- [ ] Solicitud de permisos de ubicación
- [ ] Manejo de permisos denegados
- [ ] Solicitud de permisos de background

**Home - Rastreo**:

- [ ] Iniciar seguimiento muestra ubicación actual
- [ ] Botón cambia a "Detener Seguimiento"
- [ ] Ubicación se actualiza cada 5 segundos
- [ ] Rastreo continúa en background
- [ ] Notificación visible en background
- [ ] Detener seguimiento funciona correctamente

**Firebase**:

- [ ] Datos se guardan en estructura correcta
- [ ] userId correcto en path
- [ ] Fecha formateada correctamente (yyyy-MM-dd)
- [ ] Timestamp en formato ISO
- [ ] Coordenadas son números válidos

### Testing Automatizado (Futuro)

```bash
# Instalar Jest
npm install --save-dev jest @testing-library/react-native

# Configurar package.json
"scripts": {
  "test": "jest"
}

# Ejecutar tests
npm test
```

## Build para Producción

### Android APK

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar proyecto
eas build:configure

# Build APK
eas build -p android --profile preview

# O Build para Google Play
eas build -p android --profile production
```

### iOS IPA (Solo macOS)

```bash
# Build para TestFlight
eas build -p ios --profile production

# Submit a App Store
eas submit -p ios
```

## Variables de Entorno

### Para Producción

```javascript
// Usa variables de entorno en credenciales.js
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  // ...
};
```

## Git Workflow

### Branching

```bash
# Crear branch de feature
git checkout -b feature/nombre-feature

# Hacer commits
git add .
git commit -m "feat: descripción del cambio"

# Push
git push origin feature/nombre-feature

# Merge a main
git checkout main
git merge feature/nombre-feature
```

### Commits Convencionales

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, sin cambios de código
refactor: refactorización de código
test: añadir tests
chore: tareas de mantenimiento
```

## Recursos Útiles

### Documentación

- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [Firebase](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)

### Comunidad

- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

**¿Problemas?** Abre un issue en GitHub o contacta al equipo de desarrollo.
