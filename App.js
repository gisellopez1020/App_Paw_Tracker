import { StatusBar } from "expo-status-bar";
import { StyleSheet, ImageBackground } from "react-native";
import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./screens/Login";
import Home from "./screens/Home";

export default function App() {
  const Stack = createStackNavigator();

  function MyStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            title: "LOGIN",
            headerTintColor: "white",
            headerTitleAlign: "center",
            headerBackground: () => (
              <ImageBackground
                source={require("./assets/1.png")}
                style={{ flex: 1, width: "100%", height: "100%" }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: "PawTracker",
            headerTintColor: "white",
            headerTitleAlign: "center",
            headerBackground: () => (
              <ImageBackground
                source={require("./assets/1.png")}
                style={{ flex: 1, width: "100%", height: "100%" }}
              />
            ),
          }}
        />
      </Stack.Navigator>
    );
  }
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
