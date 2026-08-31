import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { db } from "../../firebase";

const industries = [
  "Accounting",
  "Manufacturing",
  "Trading",
  "Construction",
  "Education",
  "Healthcare",
  "IT",
  "Other",
];

export default function AddUser() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if ( !mobileNumber ) {
      Alert.alert(
        "Missing Info",
        "Please fill in Company, Contact Person, Mobile Number and Industry."
      );
      return;
    }

    try {
      setSaving(true);

      const docRef = await addDoc(collection(db, "CRMusers"), {
        company,
        contactPerson,
        mobileNumber,
        email,
        city,
        industry,
        stage: 1,           // 👈 automatically set to 1
        createdAt: new Date(),
      });

      console.log("✅ Saved! Doc ID:", docRef.id);

      Alert.alert("Success ✅", "User added successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);

    } catch (error: any) {
      console.log("❌ Error:", error?.message);
      Alert.alert("Error ❌", error?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* 👈 Dismiss keyboard when tapping outside inputs */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >

            {/* ── Back Button ── */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

           

            {/* Company */}
            <Text style={styles.label}>Company </Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Company name"
              placeholderTextColor="#8899bb"
              returnKeyType="next"
            />

            {/* Contact Person */}
            <Text style={styles.label}>Contact Person </Text>
            <TextInput
              style={styles.input}
              value={contactPerson}
              onChangeText={setContactPerson}
              placeholder="Contact person's name"
              placeholderTextColor="#8899bb"
              returnKeyType="next"
            />

            {/* Mobile Number */}
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="+94 7X XXX XXXX"
              placeholderTextColor="#8899bb"
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor="#8899bb"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            {/* City */}
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor="#8899bb"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss} // 👈 dismiss keyboard when done
            />

            {/* Industry */}
            <Text style={styles.label}>Industry </Text>
            <View style={styles.chipWrap}>
              {industries.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    industry === item && styles.chipActive,
                  ]}
                  onPress={() => {
                    Keyboard.dismiss(); // 👈 dismiss keyboard when selecting industry
                    setIndustry(item);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      industry === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected industry */}
            {industry ? (
              <Text style={styles.selectedText}>
                ✅ Selected: {industry}
              </Text>
            ) : null}

           

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Ionicons
                name={saving ? "hourglass-outline" : "checkmark-circle-outline"}
                size={18}
                color="#fff"
              />
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : "Save User"}
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1f3c",
  },
  scroll: {
    padding: 20,
    paddingBottom: 60,
  },

  // ── Back Button ──
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
    marginTop:15
  },
  backText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8899bb",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0d1f3c",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#1abc9c",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: "#1abc9c",
  },
  chipText: {
    color: "#1abc9c",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  selectedText: {
    color: "#1abc9c",
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },

  // ── Stage Banner ──
  stageBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(26,188,156,0.1)",
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#1abc9c",
  },
  stageText: {
    color: "#1abc9c",
    fontSize: 13,
    fontWeight: "500",
  },

  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#1abc9c",
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  saveBtnDisabled: {
    backgroundColor: "#aaa",
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});