import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1abc9c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── Top Dark Header ── */}
      <View style={styles.header}>
       

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>

      {/* ── Bottom White Section ── */}
      <ScrollView
        style={styles.bottomSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Account Info ── */}
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="person-outline" size={18} color="#1abc9c" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="mail-outline" size={18} color="#1abc9c" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="call-outline" size={18} color="#1abc9c" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{user.phone || "Not provided"}</Text>
            </View>
          </View>
        </View>

        {/* ── Settings ── */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuCard}>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push("/register/taxRegistration1")}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="create-outline" size={20} color="#1abc9c" />
            </View>
            <Text style={styles.menuLabel}>Edit Personal Details</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert("Change Password", "A password reset email will be sent to your registered email address.", [
              { text: "Cancel", style: "cancel" },
              { text: "Send", onPress: () => {} },
            ])}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#1abc9c" />
            </View>
            <Text style={styles.menuLabel}>Change Password</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          

        </View>

        {/* ── Support ── */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert("Help & Support", "For assistance please contact us at tax@brisca.lk")}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="help-circle-outline" size={20} color="#1abc9c" />
            </View>
            <Text style={styles.menuLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push("/homeTabs/privacyPolicy")}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="shield-outline" size={20} color="#1abc9c" />
            </View>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          

          <View style={styles.infoDivider} />

        </View>

        {/* ── App Info ── */}
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuRow}>
            <View style={styles.menuIconBox}>
              <Ionicons name="information-circle-outline" size={20} color="#1abc9c" />
            </View>
            <Text style={styles.menuLabel}>Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>

        {/* ── Logout Button ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1f3c",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
  },

  // ── Header ──
  header: {
    backgroundColor: "#0d1f3c",
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1abc9c",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
  },
  userName: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "#aaa",
  },

  // ── Bottom Section ──
  bottomSection: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#888",
    marginBottom: 10,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Info Card ──
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#e8faf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: "#aaa",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2555",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 14,
  },

  // ── Menu Card ──
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#e8faf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2555",
  },
  versionText: {
    fontSize: 13,
    color: "#aaa",
  },

  // ── Logout ──
  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#e53935",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});