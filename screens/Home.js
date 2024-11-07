import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Button, Image } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import appFirebase from "../credenciales";

const LOCATION_TASK_NAME = "background-location-task";

const Home = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const db = getDatabase(appFirebase);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth(appFirebase);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    checkTrackingStatus();
  }, []);

  const checkTrackingStatus = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      ).catch(() => false);
      setIsTracking(hasStarted);
    } catch (error) {
      console.log("Error al verificar el estado del seguimiento:", error);
      setIsTracking(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        setErrorMsg("Se requiere permiso para acceder a la ubicación");
        return false;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== "granted") {
        setErrorMsg("Se requiere permiso para ubicación en segundo plano");
        return false;
      }

      return true;
    } catch (err) {
      setErrorMsg("Error al solicitar permisos: " + err);
      return false;
    }
  };

  const startTracking = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      if (!userId) {
        setErrorMsg("Debes iniciar sesión para usar esta funcionalidad");
        return;
      }

      // Verificar si la tarea ya está registrada
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        LOCATION_TASK_NAME
      );
      if (!isRegistered) {
        console.log("Registrando tarea de ubicación...");
      }

      // Obtener la ubicación inicial y enviarla a Firebase
      const initialLocation = await Location.getCurrentPositionAsync({});
      await sendLocationToFirebase(
        initialLocation.coords.latitude,
        initialLocation.coords.longitude
      );

      // Iniciar el seguimiento de ubicación en segundo plano
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Seguimiento de ubicación activo",
          notificationBody: "Rastreando tu ubicación",
        },
      });

      setLocation(initialLocation.coords);
      setIsTracking(true);
    } catch (err) {
      console.error("Error al iniciar el seguimiento:", err);
      setErrorMsg("Error al iniciar el seguimiento: " + err.message);
    }
  };

  const stopTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(false);
    } catch (error) {
      console.error("Error al detener el seguimiento:", error);
      setErrorMsg("Error al detener el seguimiento: " + error);
    }
  };

  const sendLocationToFirebase = async (latitude, longitude) => {
    try {
      if (userId) {
        const userLocationRef = ref(db, `users/${userId}/location`);
        const colombiaTimezone = -5; // UTC-5
        const currentTime =
          new Date().getTime() + colombiaTimezone * 60 * 60 * 1000;
        await set(userLocationRef, {
          latitude,
          longitude,
          timestamp: new Date(currentTime).toISOString(),
        });
      }
    } catch (error) {
      console.error("Error al enviar la ubicación a Firebase:", error);
    }
  };

  // tarea de seguimiento de ubicación en segundo plano
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error("Error en la tarea de ubicación en segundo plano:", error);
      return;
    }
    if (data) {
      const { locations } = data;
      const location = locations[0];
      if (location) {
        await sendLocationToFirebase(
          location.coords.latitude,
          location.coords.longitude
        );
      }
    }
  });

  return (
    <View style={styles.container}>
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      <View style={styles.gifContainer}>
        <Image
          source={require("../assets/duke-champion.gif")}
          style={styles.gif}
        />
      </View>
      {location ? (
        <View style={styles.locationInfo}>
          <Text>Latitud: {location.latitude}</Text>
          <Text>Longitud: {location.longitude}</Text>
        </View>
      ) : (
        <Text>Presiona el botón para obtener tu ubicación...</Text>
      )}
      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <Button
            title="Iniciar Seguimiento"
            onPress={startTracking}
            color="#4CAF50"
          />
        ) : (
          <Button
            title="Detener Seguimiento"
            onPress={stopTracking}
            color="#f44336"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gifContainer: {
    marginVertical: 20,
  },
  gif: {
    width: 200,
    height: 200,
  },
  locationInfo: {
    marginVertical: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    marginVertical: 10,
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
  },
});

export default Home;
