import emailjs, { init } from "@emailjs/react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
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

const generateReferralCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export default function Register() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    init({ publicKey: "ophzURbz2aXLZmZ6w" });
  }, []);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (!agreed) {
      setMessage("Please agree to the Terms & Privacy.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const myReferralCode = generateReferralCode();

      const usersRef = collection(db, "users");
      await setDoc(doc(usersRef, user.uid), {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        referralCode: myReferralCode,
        referredBy: referralCode || "",
        referralCount: 0,
        discountPercent: 0,
        finalTaxAmount: 0,
        createdAt: new Date(),
      });

      if (referralCode.trim() !== "") {
        const q = query(
          collection(db, "users"),
          where("referralCode", "==", referralCode.trim())
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const referrerDoc = snap.docs[0];
          await updateDoc(referrerDoc.ref, {
            referralCount: increment(1),
            discountPercent: increment(10),
          });
        }
      }

      // ✅ Navigate home immediately — don't wait for email
      setMessage("User Registered Successfully ✅");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setReferralCode("");
      router.replace("/Tabs/home");

      // 📧 Send email in background — won't block the user
      emailjs.send(
        "service_4fngdb4",
        "template_ot7dbac",
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          referral_code: myReferralCode,
          registered_at: new Date().toLocaleString(),
        }
      ).catch((err) => console.log("EmailJS error (non-blocking):", err));

    } catch (error: any) {
      console.log("Register error:", error);

      let msg = "Something went wrong";
      switch (error.code) {
        case "auth/email-already-in-use":
          msg = "This email is already registered";
          break;
        case "auth/invalid-email":
          msg = "Please enter a valid email address";
          break;
        case "auth/weak-password":
          msg = "Password should be at least 6 characters";
          break;
        case "auth/missing-password":
          msg = "Please enter a password";
          break;
        case "auth/network-request-failed":
          msg = "Check your internet connection";
          break;
        default:
          msg = error.message
            ?.replace("Firebase: ", "")
            ?.replace(/\(auth.*?\)\.?/, "")
            ?.trim() || "Error";
      }
      setMessage(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerSub}>Let's</Text>
            <Text style={styles.headerTitle}>
              Create{"\n"}Your{"\n"}Account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* First Name & Last Name */}
            <View style={styles.nameRow}>
              <View style={[styles.inputBox, styles.nameBox]}>
                <Ionicons name="person-outline" size={18} color="#888" style={styles.inputIcon} />
                <TextInput
                  placeholder="First Name"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputBox, styles.nameBox]}>
                <TextInput
                  placeholder="Last Name"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputBox}>
              <Ionicons name="call-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                placeholder="Mobile Number"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password */}
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* Referral Code */}
            <View style={styles.inputBox}>
              <Ionicons name="gift-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                placeholder="Referral Code (Optional)"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={referralCode}
                onChangeText={setReferralCode}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            {/* Terms & Privacy */}
            <View style={styles.checkRow}>
              <TouchableOpacity
                onPress={() => setAgreed(!agreed)}
                style={styles.checkboxWrapper}
              >
                <View style={[styles.checkbox, agreed ? styles.checkboxChecked : null]}>
                  {agreed ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : null}
                </View>
              </TouchableOpacity>

              <Text style={styles.checkText}>
                {"I agree to the "}
                <Text
                  style={styles.checkLink}
                  onPress={() => router.push("/register/terms")}
                >
                  {"Terms & Privacy"}
                </Text>
              </Text>
            </View>

            {/* Error / Success message */}
            {message ? (
              <Text style={styles.message}>{message}</Text>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity style={styles.signUpBtn} onPress={handleRegister}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity style={styles.signInRow} onPress={() => router.push("/")}>
              <Text style={styles.signInText}>
                {"Have an account? "}
                <Text style={styles.signInLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    backgroundColor: "#0d1f3c",
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerSub: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "400",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    color: "#fff",
    fontWeight: "800",
    lineHeight: 40,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  nameRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 0,
  },
  nameBox: {
    flex: 1,
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#c5cfe0",
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  checkboxWrapper: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#aaa",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#1abc9c",
    borderColor: "#1abc9c",
  },
  checkText: {
    fontSize: 13,
    color: "#555",
  },
  checkLink: {
    fontWeight: "700",
    color: "#0d1f3c",
  },
  message: {
    textAlign: "center",
    color: "#e53935",
    fontSize: 13,
    marginBottom: 12,
  },
  signUpBtn: {
    backgroundColor: "#1abc9c",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  signUpText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  signInRow: {
    alignItems: "center",
  },
  signInText: {
    fontSize: 13,
    color: "#888",
  },
  signInLink: {
    color: "#0d1f3c",
    fontWeight: "700",
  },
});
