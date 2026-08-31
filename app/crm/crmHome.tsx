import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebase";

const MAIN_ACTIONS = [
  {
    label: "Add a User",
    icon: "person-add-outline",
    route: "crm/addUser",
    description: "Register a new CRM contact",
    color: "#1abc9c",
    bg: "#e8faf5",
  },
  {
    label: "All Users",
    icon: "people-outline",
    route: "crm/1stage",
    description: "View all stage 1 users",
    color: "#4A6CF7",
    bg: "#eef0fe",
  },
  {
    label: "2nd Stage",
    icon: "layers-outline",
    route: "crm/2stage",
    description: "Users in second stage",
    color: "#f39c12",
    bg: "#fef9ec",
  },
  {
    label: "Final Stage",
    icon: "checkmark-done-outline",
    route: "crm/finalStage",
    description: "Completed conversions",
    color: "#e74c3c",
    bg: "#fdecea",
  },
];

export default function CrmHome() {
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState(0);
  const [stage2Count, setStage2Count] = useState(0);
  const [finalCount, setFinalCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "CRMusers"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => d.data());
      setTotalUsers(data.length);
      setStage2Count(data.filter((u) => u.stage === 2).length);
      setFinalCount(data.filter((u) => u.stage === 3).length);
    });
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
           
          </View>
          
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="people-outline" size={18} color="#1abc9c" />
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statValue}>{totalUsers}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="layers-outline" size={18} color="#f39c12" />
            <Text style={styles.statLabel}>Stage 2</Text>
            <Text style={styles.statValue}>{stage2Count}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="checkmark-done-outline" size={18} color="#e74c3c" />
            <Text style={styles.statLabel}>Final</Text>
            <Text style={styles.statValue}>{finalCount}</Text>
          </View>
        </View>

        {/* ── Section Title ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {/* ── Main Action Cards ── */}
        <View style={styles.grid}>
          {MAIN_ACTIONS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                <Ionicons
                  name={item.icon as any}
                  size={26}
                  color={item.color}
                />
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Report Button ── */}
        <Text style={styles.sectionTitle}>Reports</Text>
        <TouchableOpacity
          style={styles.reportBtn}
          activeOpacity={0.85}
          onPress={() => router.push("crm/report" as any)}
        >
          <View style={styles.reportLeft}>
            <View style={styles.reportIconBox}>
              <Ionicons name="bar-chart-outline" size={24} color="#4A6CF7" />
            </View>
            <View>
              <Text style={styles.reportLabel}>View Report</Text>
              <Text style={styles.reportDescription}>
                Analytics and user pipeline overview
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1f3c",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 5,
    marginTop:20
  },
  backText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerGreeting: {
    fontSize: 13,
    color: "#8899bb",
    fontWeight: "500",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(26,188,156,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
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
    marginBottom: 24,
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
    color: "#8899bb",
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },

  // ── Section Title ──
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8899bb",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Grid Cards ──
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  iconWrap: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0d1f3c",
    textAlign: "center",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    color: "#aaa",
    textAlign: "center",
  },

  // ── Report Button ──
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  reportLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  reportIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#eef0fe",
    alignItems: "center",
    justifyContent: "center",
  },
  reportLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0d1f3c",
    marginBottom: 3,
  },
  reportDescription: {
    fontSize: 12,
    color: "#aaa",
  },
});
