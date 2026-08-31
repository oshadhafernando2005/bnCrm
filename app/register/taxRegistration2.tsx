import { useLocalSearchParams, useRouter } from "expo-router";
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
  View,
} from "react-native";
import { auth, db } from "../../firebase";

export default function Step2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollRef = useRef<any>(null);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();
          setAddress(data.address || "");
          setPhone(data.phone || "");
          setWhatsapp(data.whatsapp || data.phone || "");
          setEmail(data.email || "");
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBottomFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: 0, y: 150, animated: true });
    }, 300);
  };

  const next = () => {
    if (!address || !phone || !email) {
      alert("Please fill required fields");
      return;
    }

    router.push({
      pathname: "/register/taxRegistration3",
      params: {
        ...params,
        address,
        phone,
        whatsapp,
        email,
      },
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
          <Text style={styles.progress}>Step 2 of 3</Text>
          <Text style={styles.title}>Contact Info</Text>
          <Text style={styles.subtitle}>
            Review and update your contact details
          </Text>

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            returnKeyType="next"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              setWhatsapp(val); // keep whatsapp in sync unless user changes it separately
            }}
            returnKeyType="next"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>WhatsApp Number</Text>
          <TextInput
            style={styles.input}
            value={whatsapp}
            onChangeText={setWhatsapp}
            returnKeyType="next"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            onFocus={handleBottomFocus}
            returnKeyType="done"
            keyboardType="email-address"
          />

          <TouchableOpacity style={styles.button} onPress={next}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>Back</Text>
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
    color: "#061f84",
    fontWeight: "500",
  },

  progress: {
    marginBottom: 15,
    textAlign: "center",
    color: "#888",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2555",
    marginBottom: 6,
    marginLeft: 4,
  },
});
