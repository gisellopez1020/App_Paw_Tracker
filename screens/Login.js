import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

import appFirebase from "../credenciales";
import {
  getAuth,
  signInWithEmailAndPassword,
  getReactNativePersistence,
} from "firebase/auth";

const auth = getAuth(appFirebase, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default function Login(props) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const logueo = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Iniciando sesión", "Accediendo...");
      props.navigation.navigate("Home");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "El usuario o la contraseña son incorrectos.");
    }
  };

  return (
    <View style={styles.padre}>
      <View>
        <Image
          source={require("../assets/perrito1.png")}
          style={styles.profile}
        />
      </View>
      <View style={styles.tarjeta}>
        <View style={styles.cajaTexto}>
          <TextInput
            placeholder="correo@gmail.com"
            style={{ paddingHorizontal: 15 }}
            onChangeText={(text) => setEmail(text)}
            placeholderTextColor="gray"
          />
        </View>
        <View style={styles.cajaTexto}>
          <TextInput
            placeholder="Password"
            style={{ paddingHorizontal: 15 }}
            secureTextEntry={true}
            onChangeText={(text) => setPassword(text)}
            placeholderTextColor="gray"
          />
        </View>
        <View style={styles.PadreBoton}>
          <TouchableOpacity style={styles.cajaBoton} onPress={logueo}>
            <Text style={styles.TextoBoton}>
              Sign In
              <Icon name="paw" size={18} color="#fff" style={styles.paw} />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  padre: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  profile: {
    width: 200,
    height: 200,
    borderRadius: 20,
    borderColor: "white",
  },
  paw: {
    marginLeft: 5,
  },
  tarjeta: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cajaTexto: {
    paddingVertical: 20,
    backgroundColor: "#cccccc40",
    borderRadius: 30,
    marginVertical: 10,
  },
  PadreBoton: {
    alignItems: "center",
  },
  cajaBoton: {
    backgroundColor: "#4B9BFF",
    borderRadius: 30,
    paddingVertical: 20,
    width: 150,
    marginTop: 20,
  },
  TextoBoton: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
});
