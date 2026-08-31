import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

export default function MyInfo() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ ADDED: moved fetch function outside useEffect
  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));

    if (snap.exists()) {
      setData(snap.data());
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
      setLoading(false);
    };

    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTaxChange = (key: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      taxInfo: {
        ...prev.taxInfo,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setSaving(true);

      await updateDoc(doc(db, "users", user.uid), {
        ...data,
        updatedAt: new Date(),
      });

      // ✅ ADDED: refresh after save
      await fetchData();

      Alert.alert("Success", "Updated successfully ✅");

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Update failed ❌");
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

  const tax = data.taxInfo || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Information</Text>

      {/* BASIC */}
      <Text style={styles.section}>Basic Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={data.fullNameNIC || ""}
        onChangeText={(v) => handleChange("fullNameNIC", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Initials"
        value={data.initialsName || ""}
        onChangeText={(v) => handleChange("initialsName", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="NIC"
        value={data.nic || ""}
        onChangeText={(v) => handleChange("nic", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="TIN"
        value={data.tin || ""}
        onChangeText={(v) => handleChange("tin", v)}
      />

      {/* CONTACT */}
      <Text style={styles.section}>Contact</Text>

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={data.address || ""}
        onChangeText={(v) => handleChange("address", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact 1"
        value={data.contact1 || ""}
        onChangeText={(v) => handleChange("contact1", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact 2"
        value={data.contact2 || ""}
        onChangeText={(v) => handleChange("contact2", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="WhatsApp"
        value={data.whatsapp || ""}
        onChangeText={(v) => handleChange("whatsapp", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email (Login)"
        value={data.emailLogin || ""}
        onChangeText={(v) => handleChange("emailLogin", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email (Communication)"
        value={data.emailComm || ""}
        onChangeText={(v) => handleChange("emailComm", v)}
      />

      {/* PREFERENCES */}
      <Text style={styles.section}>Preferences</Text>

      <TextInput
        style={styles.input}
        placeholder="Communication Mode"
        value={data.communicationMode || ""}
        onChangeText={(v) => handleChange("communicationMode", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Language"
        value={data.language || ""}
        onChangeText={(v) => handleChange("language", v)}
      />

      {/* TAX */}
      <Text style={styles.section}>Tax Info</Text>

      {[
        { key: "hasJob", label: "Has Job" },
        { key: "hasBusiness", label: "Has Business" },
        { key: "hasInvestment", label: "Has Investment" },
        { key: "foreignIncome", label: "Foreign Income" },
      ].map((item) => (
        <View key={item.key} style={styles.row}>
          <Text>{item.label}</Text>

          <View style={styles.optionRow}>
            {["yes", "no"].map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.option,
                  tax[item.key] === val && styles.optionActive,
                ]}
                onPress={() => handleTaxChange(item.key, val)}
              >
                <Text
                  style={
                    tax[item.key] === val
                      ? styles.optionTextActive
                      : styles.optionText
                  }
                >
                  {val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f6fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  row: { marginBottom: 15 },
  optionRow: { flexDirection: "row", marginTop: 5 },
  option: {
    backgroundColor: "#ddd",
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  optionActive: { backgroundColor: "#062042" },
  optionText: { color: "#000" },
  optionTextActive: { color: "#fff" },
  button: {
    backgroundColor: "#062042",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});