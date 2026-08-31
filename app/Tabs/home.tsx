import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const MENU_ITEMS = [
  {
    key: "personal",
    label: "Personal Details",
    icon: "person-outline",
    route: "/register/taxRegistration1",
    description: "Update your personal information",
  },
  {
    key: "incomes",
    label: "Incomes",
    icon: "cash-outline",
    route: "/incomes/income1",
    description: "Manage your income sources",
  },
  {
    key: "documents",
    label: "Update Documents",
    icon: "document-text-outline",
    route: "/Tabs/documents",
    description: "Upload and manage documents",
  },
  {
    key: "assets",
    label: "Assets",
    icon: "wallet-outline",
    route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  },
  {
    key: "liabilities",
    label: "Liabilities",
    icon: "card-outline",
    route: "/liabilities/loan",
    description: "Loans and lease details",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ── Logo below stats ── */}
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/images/whiteLogo.png")}
            style={styles.poweredLogo}
            resizeMode="contain"
          />
        </View>

      {/* ── Top Dark Header ── */}
      <View style={styles.header}>

        {/* Stats Row */}
        <View style={styles.statsRow}>

          {/* Tax Year */}
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#1abc9c" />
            <Text style={styles.statLabel}>Tax Year</Text>
            <Text style={styles.statValue}>2025/26</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Due Date */}
          <View style={styles.statBox}>
            <Ionicons name="time-outline" size={20} color="#39c4a8" />
            <Text style={styles.statLabel}>Due Date</Text>
            <Text style={styles.statValue}>Overdue</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Help */}
          <View style={styles.statBox}>
            <Ionicons name="help-circle-outline" size={20} color="#1abc9c" />
            <Text style={styles.statLabel}>Help</Text>
            <Text style={styles.statValue}>Support Center</Text>
          </View>

        </View>

        

      </View>

      {/* ── Bottom White Section ── */}
      <View style={styles.bottomSection}>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.menuList}>

          {/* ── Main Menu Items ── */}
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuCard}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.85}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name={item.icon as any} size={24} color="#1abc9c" />
              </View>

              <View style={styles.menuTextBox}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>

              <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}

          {/* ── Small Buttons Row ── */}
          <View style={styles.smallBtnRow}>

            {/* ── Call Agent Button ── */}
           
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => router.push("/crm/crmHome")}
                activeOpacity={0.8}
              >
                <Ionicons name="call-outline" size={14} color="#1abc9c" />
                <Text style={styles.smallBtnText}>CRM</Text>
                <Ionicons name="chevron-forward-outline" size={14} color="#1abc9c" />
              </TouchableOpacity>

            {/* ── TIN Button ── */}
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => router.push("/Tin/tinApply" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="card-outline" size={14} color="#1abc9c" />
              <Text style={styles.smallBtnText}>TIN Registration</Text>
              <Ionicons name="chevron-forward-outline" size={14} color="#1abc9c" />
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1f3c",
  },

  // ── Header ──
  header: {
    backgroundColor: "#0d1f3c",
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#162840",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-around",
    marginTop:-40
  },
  statBox: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#2a3f5f",
  },
  statLabel: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  // ── Logo ──
  logoWrapper: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom:-10
  },
  poweredLogo: {
    width: 100,       // 👈 adjust size as needed
    height: 40,       // 👈 adjust size as needed
    resizeMode: "contain",
    marginTop:30
  
  },

  // ── Bottom White Section ──
  bottomSection: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2555",
    marginBottom: 16,
  },

  // ── Menu Cards ──
  menuList: {
    gap: 10,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e8faf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuTextBox: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A2555",
    marginBottom: 3,
  },
  menuDescription: {
    fontSize: 12,
    color: "#aaa",
  },

  // ── Small Buttons Row ──
  smallBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 2,
  },
  smallBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8faf5",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1abc9c",
  },
});