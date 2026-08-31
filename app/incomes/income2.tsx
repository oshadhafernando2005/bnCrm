const ProgressBar = ({ step }: { step: number }) => {
  return (
    <View style={{ width: "100%", marginBottom: 20 }}>
      <Text style={{ textAlign: "center", marginBottom: 5 }}>
        Step {step} of 4
      </Text>
      <View style={{ height: 6, backgroundColor: "#eee", borderRadius: 5 }}>
        <View
          style={{
            width: `${step * 25}%`,
            height: 6,
            backgroundColor: "#4A6CF7",
            borderRadius: 5,
          }}
        />
      </View>
    </View>
  );
};

import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, } from "react-native";

export default function Page2() {
  const router = useRouter();
  const { job } = useLocalSearchParams();

  const handle = (business: string) => {
    router.push({
      pathname: "/incomes/income3",
      params: { job, business },
    });
  };

  return (
    <View style={styles.container}>
      <ProgressBar step={2} />

      <Text style={styles.title}>Do you have Business income?</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.btn} onPress={() => handle("yes")}>
        <Text style={styles.text}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn2} onPress={() => handle("no")}>
        <Text style={styles.text}>No</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  step: {
    textAlign: "center",
    marginBottom: 10,
    color: "#888",
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 30,
  },
  btn: {
    backgroundColor: "#062042",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  btn2: {
    backgroundColor: "#aaa",
    padding: 15,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});