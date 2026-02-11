import { Tabs } from "expo-router";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0A84FF",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 0.5,
          borderTopColor: "rgba(255,255,255,0.1)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-balance-wallet" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="insights" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlists"
        options={{
          title: "Watchlists",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="star" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

