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
type LoanType = "Home Loan" | "Personal Loan" | "Education Loan" | "Motor Vehicle Loan" | "";

type LoanEntry = {
  loanType: LoanType;
  loanNo: string;
  referenceNo: string;
  financialInstitute: string;
  originalAmount: string;
};

const emptyEntry = (): LoanEntry => ({
  loanType: "",
  loanNo: "",
  referenceNo: "",
  financialInstitute: "",
  originalAmount: "",
});

const LOAN_TYPES: LoanType[] = [
  "Home Loan",
  "Personal Loan",
  "Education Loan",
  "Motor Vehicle Loan",
];

export default function Loans() {
  const router = useRouter();

  const [entries, setEntries] = useState<LoanEntry[]>([emptyEntry()]);
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
          const data = snap.data()?.liabilities?.loans;
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
    field: keyof LoanEntry,
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
      if (!e.loanType) {
        Alert.alert("Validation", `Entry ${i + 1}: Please select a loan type.`);
        return;
      }
      if (!e.loanNo) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter the loan number.`);
        return;
      }
      if (!e.referenceNo) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter the reference number.`);
        return;
      }
      if (!e.financialInstitute) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter the financial institute.`);
        return;
      }
      if (!e.originalAmount) {
        Alert.alert("Validation", `Entry ${i + 1}: Please enter the original loan amount.`);
        return;
      }
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        "liabilities.loans": entries,
      });

      Alert.alert("Success", "Loans saved ✅", [
        { text: "OK", onPress: () => router.push("/liabilities/lease") },
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

        <Text style={styles.pageTitle}>Loans</Text>

        {/* ── Balance Notice ── */}
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeIcon}></Text>
          <Text style={styles.noticeText}>
            Please enter all loan balances as at 31st March
          </Text>
        </View>

        {/* ── ENTRIES ── */}
        {entries.map((entry, index) => (
          <View key={index} style={styles.card}>

            {/* Card header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Loan {index + 1}</Text>
              {entries.length > 1 && (
                <TouchableOpacity onPress={() => removeEntry(index)}>
                  <Text style={styles.removeText}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Loan Type ── */}
            <Text style={styles.fieldLabel}>Loan Type</Text>
            <View style={styles.loanTypeGrid}>
              {LOAN_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.loanTypeBtn,
                    entry.loanType === type && styles.loanTypeBtnActive,
                  ]}
                  onPress={() => updateEntry(index, "loanType", type)}
                >
                  <Text
                    style={[
                      styles.loanTypeText,
                      entry.loanType === type && styles.loanTypeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Loan No ── */}
            <Text style={styles.fieldLabel}>Loan Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter loan number"
              value={entry.loanNo}
              onChangeText={(val) => updateEntry(index, "loanNo", val)}
            />

            {/* ── Reference No ── */}
            <Text style={styles.fieldLabel}>Reference Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter reference number"
              value={entry.referenceNo}
              onChangeText={(val) => updateEntry(index, "referenceNo", val)}
            />

            {/* ── Financial Institute ── */}
            <Text style={styles.fieldLabel}>Financial Institute</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bank of Ceylon, Sampath Bank"
              value={entry.financialInstitute}
              onChangeText={(val) =>
                updateEntry(index, "financialInstitute", val)
              }
            />

            {/* ── Original Amount ── */}
            <Text style={styles.fieldLabel}>Original Loan Amount (LKR)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter original loan amount"
              value={entry.originalAmount}
              onChangeText={(val) => updateEntry(index, "originalAmount", val)}
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
          onPress={() => router.push("/liabilities/lease")}
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
  paddingVertical: 8,
  paddingHorizontal: 20,
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
    marginBottom: 16,
    marginTop: 10,
    textAlign: "center",
    color: "#1A2555",
  },

  // ── Notice Banner ──
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
    gap: 10,
  },
  noticeIcon: {
    fontSize: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: "#7a6000",
    fontWeight: "500",
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

  // ── Loan Type Grid ──
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginTop: 4,
  },
  loanTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  loanTypeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#d0d7f0",
    backgroundColor: "#f7f8fc",
  },
  loanTypeBtnActive: {
    backgroundColor: "#4A6CF7",
    borderColor: "#4A6CF7",
  },
  loanTypeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  loanTypeTextActive: {
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
    marginBottom: 12,
    backgroundColor: "#f0f3ff",
  },
  addMoreText: {
    color: "#4A6CF7",
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Skip ──
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
});