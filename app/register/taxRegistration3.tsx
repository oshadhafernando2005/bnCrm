import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

export default function Step3() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [communicationMode, setCommunicationMode] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();
          setCommunicationMode(data.communicationMode || "");
          setLanguage(data.language || "");
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!communicationMode || !language) {
      alert("Please select all fields");
      return;
    }

    try {
      setSaving(true);

      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        // 🔹 Step 1
        fullNameNIC: params.fullNameNIC,
        nic: params.nic,
        tin: params.tin,

        // 🔹 Step 2
        address: params.address,
        phone: params.phone,
        whatsapp: params.whatsapp,
        email: params.email,

        // 🔹 Step 3
        communicationMode,
        language,

        updatedAt: new Date(),
      });

      alert("Saved Successfully ✅");
      router.replace("/Tabs/home");

    } catch (error) {
      console.log(error);
      alert("Error saving data ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#062042" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.progress}>Step 3 of 3</Text>

        <Text style={styles.title}>Preferences</Text>
        <Text style={styles.subtitle}>
          Review and complete your setup
        </Text>

        {/* COMMUNICATION */}
        <Text style={styles.label}>Preferred Communication</Text>
        <View style={styles.row}>
          {["call", "email", "whatsapp"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.option,
                communicationMode === item && styles.optionActive,
              ]}
              onPress={() => setCommunicationMode(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  communicationMode === item && styles.optionTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LANGUAGE */}
        <Text style={styles.label}>Language</Text>
        <View style={styles.row}>
          {["Engliah","Tamil", "Sinhala"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.option,
                language === item && styles.optionActive,
              ]}
              onPress={() => setLanguage(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  language === item && styles.optionTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    justifyContent: "center",
    alignItems: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#1A2555",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },

  progress: {
    marginBottom: 15,
    textAlign: "center",
    color: "#888",
  },

  label: {
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  option: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginHorizontal: 3,
    borderRadius: 10,
    backgroundColor: "#e0e4ff",
    alignItems: "center",
  },

  optionActive: {
    backgroundColor: "#062042",
  },

  optionText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 13,
  },

  optionTextActive: {
    color: "#fff",
  },

  button: {
    backgroundColor: "#062042",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  backButton: {
    marginTop: 10,
    alignItems: "center",
  },

  backText: {
    color: "#0f257b",
    fontWeight: "500",
  },
});
