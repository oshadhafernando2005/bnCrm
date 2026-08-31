import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // 👈 add getDoc
import React, { useEffect, useState } from "react"; // 👈 add useEffect
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

const ProgressBar = ({ step }: { step: number }) => {
  return (
    <View style={{ width: "100%", marginBottom: 20 }}>
    </View>
  );
};

export default function Page4() {
  const router = useRouter();

  const [job, setJob] = useState<"yes" | "no">("no");
  const [business, setBusiness] = useState<"yes" | "no">("no");
  const [investment, setInvestment] = useState<"yes" | "no">("no");
  const [foreign, setForeign] = useState<"yes" | "no">("no");

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true); // 👈 loading for fetch
  const [message, setMessage] = useState("");

  // 🔄 Fetch existing selections
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const taxInfo = snap.data()?.taxInfo;
          if (taxInfo) {
            setJob(taxInfo.hasJob || "no");
            setBusiness(taxInfo.hasBusiness || "no");
            setInvestment(taxInfo.hasInvestment || "no");
            setForeign(taxInfo.foreignIncome || "no");
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggle = (
    value: "yes" | "no",
    setter: (v: "yes" | "no") => void
  ) => {
    setter(value === "yes" ? "no" : "yes");
  };

  const handleDone = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        setMessage("User not logged in ❌");
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        taxInfo: {
          hasJob: job,
          hasBusiness: business,
          hasInvestment: investment,
          foreignIncome: foreign,
        },
      });

      setMessage("Tax data saved successfully ✅");
      router.push("/Tabs/home");

    } catch (error: any) {
      console.log(error);
      setMessage("Error saving data ❌");
    } finally {
      setLoading(false);
    }
  }; 

  const renderOption = (
    label: string,
    value: "yes" | "no",
    setter: (v: "yes" | "no") => void
  ) => (
    <TouchableOpacity
      style={[styles.option, value === "yes" && styles.optionActive]}
      onPress={() => toggle(value, setter)}
    >
      <Text
        style={[styles.optionText, value === "yes" && styles.optionTextActive]}
      >
        {label} {value === "yes" ? "✔" : ""}
      </Text>
    </TouchableOpacity>
  );

  // ⏳ Show loader while fetching
  if (fetchLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A6CF7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProgressBar step={4} />

      <TouchableOpacity
        onPress={() => router.push("/Tabs/home")}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Select Your Income Sources</Text>

      {renderOption("Employment Income", job, setJob)}
      {renderOption("Business Income", business, setBusiness)}
      {renderOption("Investment Income", investment, setInvestment)}
      {renderOption("Foreign Income", foreign, setForeign)}

      {loading && <ActivityIndicator size="large" color="#4A6CF7" />}

      {!loading && (
        <TouchableOpacity style={styles.submit} onPress={handleDone}>
          <Text style={styles.text}>Save</Text>
        </TouchableOpacity>
      )}

      {message !== "" && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 25,
  },
  option: {
    backgroundColor: "#e0e4ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionActive: {
    backgroundColor: "#00a69c",
  },
  optionText: {
    textAlign: "center",
    color: "#333",
    fontSize: 16,
  },
  optionTextActive: {
    color: "#fff",
  },
  submit: {
    marginTop: 20,
    backgroundColor: "#062042",
    padding: 15,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  message: {
    marginTop: 20,
    textAlign: "center",
    color: "green",
  },
  backButton: {
    position: "absolute",
    top: 50,
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
});