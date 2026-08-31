import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../../firebase";



export default function Step1() {
  const router = useRouter();
  
  const scrollRef = useRef<any>(null);
  const tinInputRef = useRef(null);
  
  const [fullNameNIC, setFullNameNIC] = useState("");
  const [nic, setNic] = useState("");
  const [tin, setTin] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();
          setFullNameNIC(data.fullNameNIC || "");
          setNic(data.nic || "");
          setTin(data.tin || "");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTinFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 0, y: 70, animated: true });
    }, 300);
  };

  const next = () => {
    if (!fullNameNIC || !nic) {
      alert("Please fill required fields");
      return;
    }

    router.push({
      pathname: "/register/taxRegistration2",
      params: { fullNameNIC, nic, tin },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#062042" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.kavContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TouchableOpacity onPress={() => router.push("/Tabs/home")} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.progress}>Step 1 of 3</Text>

          <Text style={styles.title}>Basic Info</Text>
          <Text style={styles.subtitle}>
            Review and update your details if needed
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullNameNIC}
            onChangeText={setFullNameNIC}
            returnKeyType="next"
          />

          <Text style={styles.label}>NIC</Text>
          <TextInput
            style={styles.input}
            value={nic}
            onChangeText={setNic}
            returnKeyType="next"
          />

          <Text style={styles.label}>TIN (Optional)</Text>
          <TextInput
            ref={tinInputRef}
            style={styles.input}
            value={tin}
            onChangeText={setTin}
            onFocus={handleTinFocus}
            returnKeyType="done"
          />

          <TouchableOpacity style={styles.button} onPress={next}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kavContainer: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
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

  input: {
    backgroundColor: "#f0f2f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#062042",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 80,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: -70,
    left: 5,
    backgroundColor: "#062042",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 10,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2555",
    marginBottom: 6,
    marginLeft: 4,
  },
});
