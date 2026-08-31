import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Block back button
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => subscription.remove();
  }, []);

  // ✅ Login
  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login Successful ✅");
      router.replace("/Tabs/home");
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  // ✅ Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Enter Email",
        "Please enter your email address first then tap Forgot Password."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Email Sent ✅",
        "A password reset link has been sent to:\n\n" +
          email +
          "\n\nPlease check your inbox."
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* ── Top Dark Section ── */}
          <View style={styles.topSection}>

            {/* Logo Image */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/newIcon.jpg")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Input fields */}
            <View style={styles.inputsContainer}>

              {/* Email */}
              <View style={styles.inputBox}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#888"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Email or Phone"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <View style={styles.inputBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#888"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#aaa"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

            </View>
          </View>

          {/* ── Bottom White Section ── */}
          <View style={styles.bottomSection}>

            {/* ── Forgot Password ── */}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Error / Success message */}
            {message ? (
              <Text style={styles.message}>{message}</Text>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            {/* Or */}
            <Text style={styles.orText}>or</Text>

            {/* Create Account Button */}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push("/register/register1")}
            >
              <Text style={styles.createText}>Create an account</Text>
            </TouchableOpacity>

            {/* Powered By */}
            <View style={styles.poweredContainer}>
              <Text style={styles.poweredText}>Powered by</Text>
              <Image
                source={require("../assets/images/loadingPageLogo.png")}
                style={styles.poweredLogo}
              />
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1f3c",
  },

  // ── Top Dark Section ──
  topSection: {
    flex: 1,
    backgroundColor: "#00163b",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: "center",
  },

  // ── Logo ──
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
  },
  logoImage: {
    width: 220,
    height: 150,
  },

  // ── Inputs ──
  inputsContainer: {
    gap: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "#c5cfe0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },

  // ── Bottom White Section ──
  bottomSection: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 0,
  },

  // ── Forgot Password ──
  forgotText: {
    textAlign: "center",
    color: "#1abc9c",   // 👈 changed to teal so it looks clickable
    fontSize: 13,
    marginBottom: 16,
    fontWeight: "600",
  },

  // ── Message ──
  message: {
    textAlign: "center",
    color: "#e53935",
    fontSize: 13,
    marginBottom: 12,
  },

  // ── Login Button ──
  loginBtn: {
    backgroundColor: "#1abc9c",
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 16,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // ── Or ──
  orText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 13,
    marginBottom: 16,
  },

  // ── Create Account Button ──
  createBtn: {
    backgroundColor: "#d6e4e0",
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 24,
  },
  createText: {
    color: "#444",
    fontSize: 15,
    fontWeight: "600",
  },

  // ── Powered By ──
  poweredContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  poweredText: {
    fontSize: 13,
    color: "#999",
    marginRight: 8,
    marginTop: 0,
  },
  poweredLogo: {
    width: 70,
    height: 22,
    resizeMode: "contain",
    marginTop: 0,
  },
});