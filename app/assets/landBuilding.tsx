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
type LandBuildingEntry = {
  type: "Land" | "Building" | "";
  acquisition: "Gift" | "Purchased" | "";
  location: string;
  marketValue: string;  // if gift
  cost: string;         // if purchased
  dateReceived: string;    // 👈 add this
  datePurchased: string;
};

const emptyEntry = (): LandBuildingEntry => ({
  type: "",
  acquisition: "",
  location: "",
  marketValue: "",
  cost: "",
  dateReceived: "",    // 👈 add this
  datePurchased: "",   // 👈 add this
});

export default function LandAndBuilding() {
  const router = useRouter();

  const [entries, setEntries] = useState<LandBuildingEntry[]>([emptyEntry()]);
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
          const data = snap.data()?.assets?.landAndBuilding;
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
    field: keyof LandBuildingEntry,
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
      if (!e.type) {
        Alert.alert("Validation", `Entry ${i + 1}: Please select Land or Building.`);
        return;
      }
      if (!e.acquisition) {
        Alert.alert("Validation", `Entry ${i + 1}: Please select Gift or Purchased.`);
        return;
      }
      if (!e.location) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter location.`);
        return;
      }
      if (e.acquisition === "Gift" && !e.marketValue) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter market value.`);
        return;
      }
      if (e.acquisition === "Purchased" && !e.cost) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter cost.`);
        return;
      }
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        "assets.landAndBuilding": entries,
      });

      Alert.alert("Success", "Land & Building saved ✅", [
        { text: "OK", onPress: () => router.push("/assets/motorVehicle") },
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
          onPress={() => router.push("/Tabs/home")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Land & Building</Text>

        {/* ── ENTRIES ── */}
        {entries.map((entry, index) => (
          <View key={index} style={styles.card}>

            {/* Card header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Entry {index + 1}</Text>
              {entries.length > 1 && (
                <TouchableOpacity onPress={() => removeEntry(index)}>
                  <Text style={styles.removeText}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Land or Building ── */}
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.toggleRow}>
              {(["Land", "Building"] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.toggleBtn,
                    entry.type === option && styles.toggleBtnActive,
                  ]}
                  onPress={() => updateEntry(index, "type", option)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      entry.type === option && styles.toggleTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Gift or Purchased ── */}
            <Text style={styles.fieldLabel}>Acquisition</Text>
            <View style={styles.toggleRow}>
              {(["Gift", "Purchased"] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.toggleBtn,
                    entry.acquisition === option && styles.toggleBtnActive,
                  ]}
                  onPress={() => updateEntry(index, "acquisition", option)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      entry.acquisition === option && styles.toggleTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Location ── */}
            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              value={entry.location}
              onChangeText={(val) => updateEntry(index, "location", val)}
            />

            {/* ── Market Value + Date Received (Gift only) ── */}
            {entry.acquisition === "Gift" && (
              <>
                <Text style={styles.fieldLabel}>Market Value (LKR)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter market value"
                  value={entry.marketValue}
                  onChangeText={(val) => updateEntry(index, "marketValue", val)}
                  keyboardType="numeric"
                />
                <Text style={styles.fieldLabel}>Date Received</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={entry.dateReceived}
                  onChangeText={(val) => updateEntry(index, "dateReceived", val)}
                />
              </>
            )}

            {/* ── Cost (Purchased only) ── */}
            {/* ── Cost + Date of Purchase (Purchased only) ── */}
            {entry.acquisition === "Purchased" && (
              <>
                <Text style={styles.fieldLabel}>Cost (LKR)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter cost"
                  value={entry.cost}
                  onChangeText={(val) => updateEntry(index, "cost", val)}
                  keyboardType="numeric"
                />
                <Text style={styles.fieldLabel}>Date of Purchase</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  value={entry.datePurchased}
                  onChangeText={(val) => updateEntry(index, "datePurchased", val)}
                />
              </>
            )}
          </View>
        ))}

        {/* ── Add More ── */}
        <TouchableOpacity style={styles.addMoreBtn} onPress={addEntry}>
          <Text style={styles.addMoreText}>+ Add More</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push("/assets/motorVehicle")}
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
    marginBottom: 24,
    marginTop: 50,
    textAlign: "center",
    color: "#1A2555",
  },

  // ── Card ──
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

  // ── Toggle buttons ──
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#d0d7f0",
    alignItems: "center",
    backgroundColor: "#f7f8fc",
  },
  toggleBtnActive: {
    backgroundColor: "#4A6CF7",
    borderColor: "#4A6CF7",
  },
  toggleText: {
    fontWeight: "600",
    color: "#555",
    fontSize: 14,
  },
  toggleTextActive: {
    color: "#fff",
  },

  // ── Input ──
  input: {
    backgroundColor: "#f0f2f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // ── Add More ──
  addMoreBtn: {
    borderWidth: 2,
    borderColor: "#4A6CF7",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f0f3ff",
  },
  addMoreText: {
    color: "#4A6CF7",
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Submit ──
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
});