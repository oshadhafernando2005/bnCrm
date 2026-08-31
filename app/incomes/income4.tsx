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
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

export default function Page4() {
  const router = useRouter();
  const { job,business ,investment } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDone = async (foreign: string) => {
    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        setMessage("User not logged in ❌");
        return;
      }

      // 🔥 Save to Firestore
      await updateDoc(doc(db, "users", user.uid), {
        taxInfo: {
          hasJob: job,
          hasBusiness: business,
          hasInvestment: investment,
          foreignIncome: foreign,
        },
      });

      setMessage("Tax data saved successfully ✅");

      // 👉 Navigate (change this if needed)
      router.push("/register/taxRegistration1"); // or "/home"

    } catch (error: any) {
      console.log(error);
      setMessage("Error saving data ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressBar step={3} />

      {/* Question */}
      <Text style={styles.title}>
        Do you have foreign income?
      </Text>

      {/* Loading */}
      {loading && <ActivityIndicator size="large" color="#4A6CF7" />}

      {/* Buttons */}
      {!loading && (
        <>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleDone("yes")}
          >
            <Text style={styles.text}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn2}
            onPress={() => handleDone("no")}
          >
            <Text style={styles.text}>No</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Message */}
      {message !== "" && (
        <Text style={styles.message}>{message}</Text>
      )}
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
  message: {
    marginTop: 20,
    textAlign: "center",
    color: "green",
  },
});