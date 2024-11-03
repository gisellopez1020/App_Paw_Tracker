import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Button } from "react-native";
import * as Location from "expo-location";

const API_URL = "http://192.168.1.3:3001";
export default function Home() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);

  // Función para solicitar permisos de ubicación
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Se requiere permiso para acceder a la ubicación");
        return false;
      }
      return true;
    } catch (err) {
      setErrorMsg("Error al solicitar permisos: " + err);
      return false;
    }
  };

  // Función para iniciar el seguimiento
  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      // Configuración del seguimiento
      const options = {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Actualizar cada 5 segundos
        distanceInterval: 5, // Actualizar cada 10 metros
      };

      // Iniciar el seguimiento en tiempo real
      const watchId = await Location.watchPositionAsync(options, (location) => {
        setLocation(location.coords);

        // Se envían los datos a la API
        sendLocationToAPI(location.coords);
      });

      setWatchId(watchId);
      setIsTracking(true);
    } catch (err) {
      setErrorMsg("Error al iniciar el seguimiento: " + err);
    }
  };

  // Función para detener el seguimiento
  const stopTracking = () => {
    if (watchId) {
      watchId.remove();
      setWatchId(null);
    }
    setIsTracking(false);
  };

  // Función para enviar datos a la API
  const sendLocationToAPI = async (coords) => {
    try {
      console.log("Enviando coordenadas:", coords);

      const response = await fetch(`http://${API_URL}/update-location`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error en la petición");
      }

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
    } catch (error) {
      console.error("Error enviando ubicación a la API:", error);
    }
  };

  // Limpiar el seguimiento cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (watchId) {
        watchId.remove();
      }
    };
  }, [watchId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento de Ubicación</Text>

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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
