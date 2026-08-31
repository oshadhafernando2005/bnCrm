import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function CashAndAssets() {
  const router = useRouter();

  const [cashInHand, setCashInHand] = useState("");
  const [goldValue, setGoldValue] = useState("");
  const [jewelleryValue, setJewelleryValue] = useState("");
  const [gemsAndSilverValue, setGemsAndSilverValue] = useState("");
  const [loansGranted, setLoansGranted] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔄 Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data()?.assets?.cashAndAssets || {};
          setCashInHand(data.cashInHand || "");
          setGoldValue(data.goldValue || "");
          setJewelleryValue(data.jewelleryValue || "");
          setGemsAndSilverValue(data.gemsAndSilverValue || "");
          setLoansGranted(data.loansGranted || "");
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ─── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (!cashInHand) {
      Alert.alert("Validation", "Please enter Cash in Hand amount.");
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        "assets.cashAndAssets": {
          cashInHand,
          goldValue,
          jewelleryValue,
          gemsAndSilverValue,
          loansGranted,
        },
      });

      Alert.alert("Success", "Cash & Assets saved ✅", [
        { text: "OK", onPress: () => router.push("/assets/shares") }, // 👈 change route
      ]);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A6CF7" />
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
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Cash & Other Assets</Text>
        <Text style={styles.pageSubtitle}>
          Enter the current market value of each asset
        </Text>

        {/* ── FIELDS ── */}
        <View style={styles.card}>

          {/* Cash in Hand */}
          <Text style={styles.fieldLabel}>
            Cash in Hand (LKR) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter cash in hand amount"
            value={cashInHand}
            onChangeText={setCashInHand}
            keyboardType="numeric"
          />

          {/* Gold */}
          <Text style={styles.fieldLabel}>Value of Gold (LKR)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter total value of gold"
            value={goldValue}
            onChangeText={setGoldValue}
            keyboardType="numeric"
          />

          {/* Jewellery */}
          <Text style={styles.fieldLabel}>Value of Jewellery (LKR)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter total value of jewellery"
            value={jewelleryValue}
            onChangeText={setJewelleryValue}
            keyboardType="numeric"
          />

          {/* Gems and Silver */}
          <Text style={styles.fieldLabel}>Value of Gems & Silver (LKR)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter total value of gems and silver"
            value={gemsAndSilverValue}
            onChangeText={setGemsAndSilverValue}
            keyboardType="numeric"
          />

          {/* Loans Granted */}
          <Text style={styles.fieldLabel}>Loans Granted to Others (LKR)</Text>
          <Text style={styles.fieldHint}>
            Total amount of money lent to other individuals or entities
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter total loans granted"
            value={loansGranted}
            onChangeText={setLoansGranted}
            keyboardType="numeric"
          />

        </View>

        {/* ── Skip ── */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push("/assets/shares")} // 👈 change route
        >
          <Text style={styles.skipText}>Skip →</Text>
        </TouchableOpacity>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit & Next →</Text>
          )}
        </TouchableOpacity>

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
    padding: 20,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    marginTop: 38,
    marginLeft:15,
    marginBottom: 5,
    backgroundColor: "#062042",
  paddingVertical: 5,
  paddingHorizontal: 10,
  borderRadius: 25,
  zIndex: 10,
  position: "absolute",
  },
  backText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 50,
    textAlign: "center",
    color: "#1A2555",
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
    marginTop: 8,
  },
  fieldHint: {
    fontSize: 11,
    color: "#aaa",
    marginBottom: 6,
    fontStyle: "italic",
  },
  required: {
    color: "#e53935",
  },
  input: {
    backgroundColor: "#f0f2f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  skipBtn: {
    borderWidth: 1.5,
    borderColor: "#aaa",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  skipText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: "#062042",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});