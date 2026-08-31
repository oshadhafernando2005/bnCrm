import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

const DOC_ITEMS = [
  {
    key: "hasJob",
    label: "Employment Documents",
    description: "T10 certificates and job related documents",
    icon: "briefcase-outline",
    route: "/sumbissions/jobSubmission",
  },
  {
    key: "hasBusiness",
    label: "Business Documents",
    description: "Business registration and financial reports",
    icon: "business-outline",
    route: "/sumbissions/businessSubmission",
  },
  {
    key: "hasInvestment",
    label: "Investment Documents",
    description: "Interest, dividends and rent certificates",
    icon: "trending-up-outline",
    route: "/sumbissions/investmentSubmission",
  },
  {
    key: "foreignIncome",
    label: "Other Income Documents",
    description: "Foreign income and other related documents",
    icon: "globe-outline",
    route: "/sumbissions/foreignSubmission",
  },
];

export default function DocumentsPage() {
  const router = useRouter();
  const { refresh } = useLocalSearchParams();

  const [taxInfo, setTaxInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setTaxInfo(snap.data().taxInfo);
      }

      setLoading(false);
    };

    fetchData();
  }, [refresh]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1abc9c" />
      </View>
    );
  }

  // Filter only applicable documents
  const visibleItems = DOC_ITEMS.filter(
    (item) => taxInfo?.[item.key] === "yes"
  );

  return (
    <View style={styles.container}>

      {/* ── Top Dark Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
        <Text style={styles.headerSubtitle}>
          Select a category to upload or manage your documents
        </Text>
      </View>

      {/* ── Bottom White Section ── */}
      <View style={styles.bottomSection}>
        <Text style={styles.sectionTitle}>Your Categories</Text>

        {visibleItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="document-outline"
              size={48}
              color="#ccc"
            />
            <Text style={styles.emptyText}>
              No document categories found.{"\n"}Please complete your tax info first.
            </Text>
          </View>
        ) : (
          <View style={styles.menuList}>
            {visibleItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuCard}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: item.route as any,
                    params: { refresh: Date.now() },
                  })
                }
              >
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color="#1abc9c"
                  />
                </View>

                <View style={styles.menuTextBox}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>
                    {item.description}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#ccc"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
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
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#aaa",
    lineHeight: 20,
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
    fontSize: 14,
    fontWeight: "700",
    color: "#888",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Menu Cards ──
  menuList: {
    gap: 12,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuIconBox: {
    width: 48,
    height: 48,
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
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: "#aaa",
  },

  // ── Empty State ──
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 22,
  },
});