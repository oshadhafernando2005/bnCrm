import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function Layout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#1abc9c",
        tabBarInactiveTintColor: "#8899bb",
        tabBarItemStyle: {
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="documents"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name={focused ? "document" : "document-outline"}
                size={24}
                color={focused ? "#1abc9c" : "#8899bb"}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Docs
              </Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? "#1abc9c" : "#8899bb"}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Home
              </Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="newPage"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name={focused ? "cash" : "cash-outline"}
                size={24}
                color={focused ? "#1abc9c" : "#8899bb"}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Pays
              </Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={focused ? "#1abc9c" : "#8899bb"}
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
  paddingTop: 10,
  paddingBottom: 8,
  backgroundColor: "#0d1f3c",
  borderTopWidth: 0,
  marginHorizontal: 16,
  marginBottom: 40,
  borderRadius: 24,
  elevation: 20,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  position: "absolute",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8899bb",
  },
  tabLabelActive: {
    color: "#1abc9c",
  },
  homeWrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
  },
  homeBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  homeBtnActive: {
    backgroundColor: "#17a589",
  },
});
