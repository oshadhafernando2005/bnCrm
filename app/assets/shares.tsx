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

// ─── Types ───────────────────────────────────────────
type ShareEntry = {
  financialInstitute: string;
  numberOfShares: string;
  dateOfPurchase: string;
  value: string;
};

const emptyEntry = (): ShareEntry => ({
  financialInstitute: "",
  numberOfShares: "",
  dateOfPurchase: "",
  value: "",
});

export default function Shares() {
  const router = useRouter();

  const [entries, setEntries] = useState<ShareEntry[]>([emptyEntry()]);
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
          const data = snap.data()?.assets?.shares;
          if (Array.isArray(data) && data.length > 0) {
            setEntries(data);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ─── Field update helper ──────────────────────────────
  const updateEntry = (
    index: number,
    field: keyof ShareEntry,
    value: string
  ) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  // ─── Add new entry ────────────────────────────────────
  const addEntry = () => {
    setEntries((prev) => [...prev, emptyEntry()]);
  };

  // ─── Remove entry ─────────────────────────────────────
  const removeEntry = (index: number) => {
    Alert.alert(
      "Remove Entry",
      "Are you sure you want to remove this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setEntries((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  // ─── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    // Validate
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e.financialInstitute) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter the financial institute.`);
        return;
      }
      if (!e.numberOfShares) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter the number of shares.`);
        return;
      }
      if (!e.dateOfPurchase) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter the date of purchase.`);
        return;
      }
      if (!e.value) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter the value.`);
        return;
      }
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        "assets.shares": entries,
      });

      Alert.alert("Success", "Shares saved ✅", [
        { text: "OK", onPress: () => router.push("/Tabs/home") },
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

        <Text style={styles.pageTitle}>Shares</Text>
        <Text style={styles.pageSubtitle}>
          Enter details of your share investments
        </Text>

        {/* ── ENTRIES ── */}
        {entries.map((entry, index) => (
          <View key={index} style={styles.card}>

            {/* Card header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Share {index + 1}</Text>
              {entries.length > 1 && (
                <TouchableOpacity onPress={() => removeEntry(index)}>
                  <Text style={styles.removeText}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Financial Institute */}
            <Text style={styles.fieldLabel}>Financial Institute</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bank of Ceylon, CSE"
              value={entry.financialInstitute}
              onChangeText={(val) =>
                updateEntry(index, "financialInstitute", val)
              }
            />

            {/* Number of Shares */}
            <Text style={styles.fieldLabel}>Number of Shares</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number of shares"
              value={entry.numberOfShares}
              onChangeText={(val) =>
                updateEntry(index, "numberOfShares", val)
              }
              keyboardType="numeric"
            />

            {/* Date of Purchase */}
            <Text style={styles.fieldLabel}>Date of Purchase</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={entry.dateOfPurchase}
              onChangeText={(val) =>
                updateEntry(index, "dateOfPurchase", val)
              }
            />

            {/* Value */}
            <Text style={styles.fieldLabel}>Value (LKR)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current market value"
              value={entry.value}
              onChangeText={(val) => updateEntry(index, "value", val)}
              keyboardType="numeric"
            />

          </View>
        ))}

        {/* ── Add More ── */}
        <TouchableOpacity style={styles.addMoreBtn} onPress={addEntry}>
          <Text style={styles.addMoreText}>+ Add More</Text>
        </TouchableOpacity>

        {/* ── Skip ── */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push("/Tabs/home")}
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
            <Text style={styles.submitText}>Submit & Finish ✓</Text>
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
    marginTop: 40,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2555",
  },
  removeText: {
    color: "#e53935",
    fontWeight: "600",
    fontSize: 13,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#f0f2f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addMoreBtn: {
    borderWidth: 2,
    borderColor: "#4A6CF7",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f0f3ff",
  },
  addMoreText: {
    color: "#4A6CF7",
    fontWeight: "700",
    fontSize: 15,
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