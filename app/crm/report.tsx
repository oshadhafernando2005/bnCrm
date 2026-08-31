import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebase";

type CompletedUser = {
  id: string;
  company: string;
  contactPerson: string;
  mobileNumber: string;
  email?: string;
  city?: string;
  industry: string;
  stage: number;
  notes?: string;
  completedAt?: any;
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "Unknown";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Reports() {
  const router = useRouter();
  const [users, setUsers] = useState<CompletedUser[]>([]);
  const [filtered, setFiltered] = useState<CompletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<CompletedUser | null>(null);

  // 🔄 Fetch completed deals (stage === 4)
  useEffect(() => {
    const q = query(
      collection(db, "CRMusers"),
      where("stage", "==", 4),
      orderBy("completedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as CompletedUser[];

      setUsers(data);
      setFiltered(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🔍 Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(users);
      return;
    }

    const lower = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.company?.toLowerCase().includes(lower) ||
          u.contactPerson?.toLowerCase().includes(lower) ||
          u.industry?.toLowerCase().includes(lower)
      )
    );
  }, [search, users]);

  const openUser = (user: CompletedUser) => {
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>Completed Deals</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Summary Card ── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIconBox}>
              <Ionicons name="trophy-outline" size={28} color="#f39c12" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Completed Deals</Text>
              <Text style={styles.summaryCount}>
                {loading ? "—" : users.length}
              </Text>
            </View>
          </View>
          <View style={styles.summaryBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#1abc9c" />
            <Text style={styles.summaryBadgeText}>All Time</Text>
          </View>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#8899bb" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by company, person or industry..."
            placeholderTextColor="#8899bb"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#8899bb" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Results Count ── */}
        {!loading && (
          <Text style={styles.resultsText}>
            {filtered.length} deal{filtered.length !== 1 ? "s" : ""} found
          </Text>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1abc9c" />
          </View>
        ) : filtered.length === 0 ? (

          /* ── Empty State ── */
          <View style={styles.emptyBox}>
            <Ionicons
              name="checkmark-done-outline"
              size={56}
              color="#8899bb"
            />
            <Text style={styles.emptyTitle}>No completed deals yet</Text>
            <Text style={styles.emptySubtitle}>
              Completed deals will appear here.
            </Text>
          </View>
        ) : (

          /* ── Completed Deals List ── */
          <View style={styles.list}>
            {filtered.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.card}
                onPress={() => openUser(user)}
                activeOpacity={0.85}
              >
                {/* Card Header */}
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.company?.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardCompany}>{user.company}</Text>
                    <Text style={styles.cardPerson}>{user.contactPerson}</Text>
                    <Text style={styles.cardIndustry}>{user.industry}</Text>
                  </View>

                  <View style={styles.completedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#1abc9c"
                    />
                    <Text style={styles.completedBadgeText}>Done</Text>
                  </View>
                </View>

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  {user.city ? (
                    <View style={styles.cardFooterItem}>
                      <Ionicons
                        name="location-outline"
                        size={13}
                        color="#8899bb"
                      />
                      <Text style={styles.cardFooterText}>{user.city}</Text>
                    </View>
                  ) : null}

                  {user.mobileNumber ? (
                    <View style={styles.cardFooterItem}>
                      <Ionicons
                        name="call-outline"
                        size={13}
                        color="#8899bb"
                      />
                      <Text style={styles.cardFooterText}>
                        {user.mobileNumber}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.cardFooterItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#8899bb"
                    />
                    <Text style={styles.cardFooterText}>
                      {formatDate(user.completedAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      {/* ── Detail Modal ── */}
      <Modal
        visible={!!selectedUser}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBox}>
                <Text style={styles.modalCompany}>
                  {selectedUser?.company}
                </Text>
                <Text style={styles.modalIndustry}>
                  {selectedUser?.industry}
                </Text>
              </View>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#0d1f3c" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Status Badge */}
              <View style={styles.statusBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#1abc9c"
                />
                <Text style={styles.statusText}>Deal Completed</Text>
              </View>

              {/* Completion Date */}
              <View style={styles.completionDateBox}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#f39c12"
                />
                <Text style={styles.completionDateText}>
                  Completed: {formatDate(selectedUser?.completedAt)}
                </Text>
              </View>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#8899bb" />
                  <Text style={styles.infoText}>
                    {selectedUser?.contactPerson}
                  </Text>
                </View>

                {selectedUser?.email ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={16} color="#8899bb" />
                    <Text style={styles.infoText}>{selectedUser?.email}</Text>
                  </View>
                ) : null}

                {selectedUser?.mobileNumber ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color="#8899bb" />
                    <Text style={styles.infoText}>
                      {selectedUser?.mobileNumber}
                    </Text>
                  </View>
                ) : null}

                {selectedUser?.city ? (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#8899bb"
                    />
                    <Text style={styles.infoText}>{selectedUser?.city}</Text>
                  </View>
                ) : null}
              </View>

              {/* Notes */}
              {selectedUser?.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Notes</Text>
                  <Text style={styles.notesText}>{selectedUser?.notes}</Text>
                </View>
              ) : null}

              {/* Call Button */}
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() =>
                  handleCall(selectedUser?.mobileNumber || "")
                }
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.callBtnText}>
                  Call {selectedUser?.mobileNumber}
                </Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={closeModal}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1f3c",
  },

  // ── Header ──
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
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
    marginBottom: 16,
    marginTop: 30,
  },
  backText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#8899bb",
    marginTop: 4,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // ── Summary Card ──
  summaryCard: {
    backgroundColor: "#162840",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  summaryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(243,156,18,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#8899bb",
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(26,188,156,0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  summaryBadgeText: {
    color: "#1abc9c",
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Search ──
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#162840",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
  },
  resultsText: {
    fontSize: 12,
    color: "#8899bb",
    marginBottom: 12,
  },

  // ── Center / Empty ──
  center: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8899bb",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#8899bb",
    textAlign: "center",
  },

  // ── List ──
  list: {
    gap: 12,
  },

  // ── Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f39c12",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  cardInfo: {
    flex: 1,
  },
  cardCompany: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0d1f3c",
  },
  cardPerson: {
    fontSize: 12,
    color: "#8899bb",
    marginTop: 2,
  },
  cardIndustry: {
    fontSize: 12,
    color: "#1abc9c",
    fontWeight: "600",
    marginTop: 2,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e8faf5",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  completedBadgeText: {
    color: "#1abc9c",
    fontSize: 11,
    fontWeight: "700",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
    gap: 6,
  },
  cardFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardFooterText: {
    fontSize: 12,
    color: "#8899bb",
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitleBox: {
    flex: 1,
    paddingRight: 10,
  },
  modalCompany: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0d1f3c",
  },
  modalIndustry: {
    fontSize: 13,
    color: "#1abc9c",
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e8faf5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1abc9c",
  },
  completionDateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef9ec",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  completionDateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f39c12",
  },
  infoBox: {
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#555",
  },
  notesBox: {
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8899bb",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  notesText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },
  callBtn: {
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  callBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  closeBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#e0e4ef",
  },
  closeBtnText: {
    color: "#8899bb",
    fontSize: 15,
    fontWeight: "600",
  },
});