import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Button } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const LOCATION_TASK_NAME = "background-location-task";
const API_URL = "https://api-paw-tracker.onrender.com";

// Definimos la tarea antes de cualquier otro código
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Error in background location task:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      try {
        console.log("Sending location to server:", {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const response = await fetch(`${API_URL}/update-location`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().toISOString(),
          }),
        });

        const responseData = await response.json();
        console.log("Server response:", responseData);

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
      } catch (error) {
        console.error("Error sending location from background:", error);
        // Podríamos implementar aquí un sistema de reintento
      }
    }
  }
});

export default function Home() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

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
      console.log("Error checking tracking status:", error);
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

      // Verificar si la tarea ya está registrada
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        LOCATION_TASK_NAME
      );
      if (!isRegistered) {
        console.log("Registrando tarea de ubicación...");
      }

      // Primero enviamos la ubicación actual al servidor
      const initialLocation = await Location.getCurrentPositionAsync({});
      console.log("Initial location:", initialLocation.coords);

      try {
        const response = await fetch(`${API_URL}/update-location`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
            timestamp: new Date().toISOString(),
          }),
        });

        const data = await response.json();
        console.log("Server response for initial location:", data);
      } catch (error) {
        console.error("Error sending initial location:", error);
      }

      // Luego iniciamos el tracking en segundo plano
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Tracking de ubicación activo",
          notificationBody: "Rastreando tu ubicación",
        },
      });

      setLocation(initialLocation.coords);
      setIsTracking(true);
    } catch (err) {
      console.error("Error completo:", err);
      setErrorMsg("Error al iniciar el seguimiento: " + err.message);
    }
  };

  const stopTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(false);
    } catch (error) {
      console.error("Error al detener:", error);
      setErrorMsg("Error al detener el seguimiento: " + error);
    }
  };

  return (
    <View style={styles.container}>
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      {location ? (
        <View style={styles.locationInfo}>
          <Text>Latitud: {location.latitude}</Text>
          <Text>Longitud: {location.longitude}</Text>
        </View>
      ) : (
        <Text>Obteniendo ubicación...</Text>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
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
