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
type InterestEntry = { source: string; annualValue: string };
type RentEntry = { property: string; annualAmount: string };
type DividendEntry = { company: string; annualIncome: string };

export default function InvestmentIncome() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Interest ──
  const [interestCount, setInterestCount] = useState("");
  const [interests, setInterests] = useState<InterestEntry[]>([]);

  // ── Rent ──
  const [rentCount, setRentCount] = useState("");
  const [rents, setRents] = useState<RentEntry[]>([]);

  // ── Dividend ──
  const [dividendCount, setDividendCount] = useState("");
  const [dividends, setDividends] = useState<DividendEntry[]>([]);

  // 🔄 Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data()?.investmentIncome || {};

          // Pre-fill interests
          if (Array.isArray(data.interests) && data.interests.length > 0) {
            setInterestCount(String(data.interests.length));
            setInterests(data.interests);
          }

          // Pre-fill rents
          if (Array.isArray(data.rents) && data.rents.length > 0) {
            setRentCount(String(data.rents.length));
            setRents(data.rents);
          }

          // Pre-fill dividends
          if (Array.isArray(data.dividends) && data.dividends.length > 0) {
            setDividendCount(String(data.dividends.length));
            setDividends(data.dividends);
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

  // ─── Generate fields when count changes ───────────────

  // Interest count changed
  const handleInterestCount = (val: string) => {
    setInterestCount(val);
    const count = parseInt(val) || 0;
    const updated: InterestEntry[] = Array.from({ length: count }, (_, i) => ({
      source: interests[i]?.source || "",
      annualValue: interests[i]?.annualValue || "",
    }));
    setInterests(updated);
  };

  // Rent count changed
  const handleRentCount = (val: string) => {
    setRentCount(val);
    const count = parseInt(val) || 0;
    const updated: RentEntry[] = Array.from({ length: count }, (_, i) => ({
      property: rents[i]?.property || "",
      annualAmount: rents[i]?.annualAmount || "",
    }));
    setRents(updated);
  };

  // Dividend count changed
  const handleDividendCount = (val: string) => {
    setDividendCount(val);
    const count = parseInt(val) || 0;
    const updated: DividendEntry[] = Array.from({ length: count }, (_, i) => ({
      company: dividends[i]?.company || "",
      annualIncome: dividends[i]?.annualIncome || "",
    }));
    setDividends(updated);
  };

  // ─── Field update helpers ─────────────────────────────

  const updateInterest = (index: number, field: keyof InterestEntry, value: string) => {
    const updated = [...interests];
    updated[index] = { ...updated[index], [field]: value };
    setInterests(updated);
  };

  const updateRent = (index: number, field: keyof RentEntry, value: string) => {
    const updated = [...rents];
    updated[index] = { ...updated[index], [field]: value };
    setRents(updated);
  };

  const updateDividend = (index: number, field: keyof DividendEntry, value: string) => {
    const updated = [...dividends];
    updated[index] = { ...updated[index], [field]: value };
    setDividends(updated);
  };

  // ─── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        investmentIncome: {
          interests,
          rents,
          dividends,
        },
      });

      Alert.alert("Success", "Investment income saved ✅", [
        { text: "OK", onPress: () => router.push("/Tabs/documents") },
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
          onPress={() => router.push("/Tabs/documents")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Documents </Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Investment Income</Text>
        <Text >April 1 to March 31 of the following year</Text> 

        {/* ── INTEREST ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <Text style={styles.sectionSubtitle}>
            How many interest incomes do you have?
          </Text>

          <TextInput
            style={styles.countInput}
            placeholder="Enter number (e.g. 3)"
            value={interestCount}
            onChangeText={handleInterestCount}
            keyboardType="numeric"
            maxLength={2}
          />

          {interests.map((item, index) => (
            <View key={index} style={styles.entryCard}>
              <Text style={styles.entryTitle}>Interest Source {index + 1}</Text>

              <TextInput
                style={styles.input}
                placeholder={`Interest Source ${index + 1}`}
                value={item.source}
                onChangeText={(val) => updateInterest(index, "source", val)}
              />
              <TextInput
                style={styles.input}
                placeholder="Annual Value (LKR)"
                value={item.annualValue}
                onChangeText={(val) => updateInterest(index, "annualValue", val)}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>

        {/* ── RENT ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rent Income</Text>
          <Text style={styles.sectionSubtitle}>
            How many rent incomes do you have?
          </Text>

          <TextInput
            style={styles.countInput}
            placeholder="Enter number (e.g. 2)"
            value={rentCount}
            onChangeText={handleRentCount}
            keyboardType="numeric"
            maxLength={2}
          />

          {rents.map((item, index) => (
            <View key={index} style={styles.entryCard}>
              <Text style={styles.entryTitle}>Property {index + 1}</Text>

              <TextInput
                style={styles.input}
                placeholder={`Property ${index + 1}`}
                value={item.property}
                onChangeText={(val) => updateRent(index, "property", val)}
              />
              <TextInput
                style={styles.input}
                placeholder="Annual Amount (LKR)"
                value={item.annualAmount}
                onChangeText={(val) => updateRent(index, "annualAmount", val)}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>

        {/* ── DIVIDEND ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dividend</Text>
          <Text style={styles.sectionSubtitle}>
            How many dividend incomes do you have?
          </Text>

          <TextInput
            style={styles.countInput}
            placeholder="Enter number (e.g. 2)"
            value={dividendCount}
            onChangeText={handleDividendCount}
            keyboardType="numeric"
            maxLength={2}
          />

          {dividends.map((item, index) => (
            <View key={index} style={styles.entryCard}>
              <Text style={styles.entryTitle}>Company {index + 1}</Text>

              <TextInput
                style={styles.input}
                placeholder={`Company Name ${index + 1}`}
                value={item.company}
                onChangeText={(val) => updateDividend(index, "company", val)}
              />
              <TextInput
                style={styles.input}
                placeholder="Annual Income (LKR)"
                value={item.annualIncome}
                onChangeText={(val) => updateDividend(index, "annualIncome", val)}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>

        {/* ── SUBMIT ── */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
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
  position: "absolute",
  top: 50,          // adjust based on device (40–60)
  left: 20,
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
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 85,
    textAlign: "center",
    color: "#1A2555",
  },
  section: {
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2555",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 12,
  },
  countInput: {
    backgroundColor: "#f0f2f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 15,
  },
  entryCard: {
    backgroundColor: "#f7f8fc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e4f0",
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00a69c",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    padding: 11,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#062042",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});