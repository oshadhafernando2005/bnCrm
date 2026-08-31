import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
  Linking,
    Platform,
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

type User = {
  id: string;
  company: string;
  contactPerson: string;
  mobileNumber: string;
  email?: string;
  city?: string;
  industry: string;
  stage: number;
  notes?: string;
};

export default function FinalStage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "CRMusers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as User))
        .filter((u) => u.stage === 3); // only Final Stage users
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openUser = (user: User) => {
    setSelectedUser(user);
    setNotes(user.notes || "");
  };

  const closeModal = () => {
    setSelectedUser(null);
    setNotes("");
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleCompleteDeal = async () => {
    if (!selectedUser) return;
    Alert.alert(
      "Complete Deal",
      `Mark ${selectedUser.company} as a completed deal?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              setSaving(true);
              await updateDoc(doc(db, "CRMusers", selectedUser.id), {
                stage: 4,
                completedAt: new Date(),
              });
              closeModal();
              Alert.alert("Deal Completed 🎉", `${selectedUser.company} marked as completed!`);
            } catch (e: any) {
              Alert.alert("Error ❌", e?.message || "Something went wrong.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, "CRMusers", selectedUser.id), { notes });
      Alert.alert("Saved ✅", "Notes saved successfully.");
    } catch (e: any) {
      Alert.alert("Error ❌", e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    Alert.alert(
      "Delete User",
      `Are you sure you want to remove ${selectedUser.company}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "CRMusers", selectedUser.id));
              closeModal();
            } catch (e: any) {
              Alert.alert("Error ❌", e?.message || "Something went wrong.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Final Stage</Text>
        <Text style={styles.headerCount}>{users.length} users</Text>
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1abc9c" />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="checkmark-done-outline" size={48} color="#8899bb" />
          <Text style={styles.emptyText}>No users in Final Stage yet</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {users.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.card}
              onPress={() => openUser(user)}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.company?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardName}>{user.company}</Text>
                  <Text style={styles.cardIndustry}>{user.industry}</Text>
                  <Text style={styles.cardPerson}>{user.contactPerson}</Text>
                </View>
              </View>
              <View style={styles.stageBadge}>
                <Text style={styles.stageBadgeText}>Final</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* User Detail Modal */}
      <Modal
        visible={!!selectedUser}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalCompany}>{selectedUser?.company}</Text>
                <Text style={styles.modalIndustry}>{selectedUser?.industry}</Text>
              </View>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#0d1f3c" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Info */}
              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#8899bb" />
                  <Text style={styles.infoText}>{selectedUser?.contactPerson}</Text>
                </View>
                {selectedUser?.email ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={16} color="#8899bb" />
                    <Text style={styles.infoText}>{selectedUser?.email}</Text>
                  </View>
                ) : null}
                {selectedUser?.city ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#8899bb" />
                    <Text style={styles.infoText}>{selectedUser?.city}</Text>
                  </View>
                ) : null}
              </View>

              {/* Current Stage */}
              <View style={styles.currentStage}>
                <Text style={styles.currentStageText}>Current: Final Stage</Text>
              </View>

              {/* Call Button */}
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(selectedUser?.mobileNumber || "")}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.callBtnText}>
                  Call {selectedUser?.mobileNumber}
                </Text>
              </TouchableOpacity>

              {/* Complete Deal */}
              <Text style={styles.sectionLabel}>Close Deal</Text>
              <TouchableOpacity
                style={[styles.completeBtn, saving && styles.completeBtnDisabled]}
                onPress={handleCompleteDeal}
                disabled={saving}
              >
                <Ionicons name="trophy-outline" size={18} color="#fff" />
                <Text style={styles.completeBtnText}>Complete Deal 🎉</Text>
              </TouchableOpacity>

              {/* Notes */}
              <Text style={styles.sectionLabel}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Write notes about this user..."
                placeholderTextColor="#aaa"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Save Notes */}
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveNotes}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={16} color="#fff" />
                    <Text style={styles.saveBtnText}>Save Notes</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color="#e53935" />
                <Text style={styles.deleteBtnText}>Remove User</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1f3c",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: "#8899bb",
    fontSize: 15,
  },
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
    marginTop:30
  },
  backText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  headerCount: {
    fontSize: 13,
    color: "#8899bb",
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1abc9c",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0d1f3c",
  },
  cardIndustry: {
    fontSize: 12,
    color: "#1abc9c",
    fontWeight: "600",
    marginTop: 2,
  },
  cardPerson: {
    fontSize: 12,
    color: "#8899bb",
    marginTop: 2,
  },
  stageBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#1abc9c",
  },
  stageBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
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
  currentStage: {
    borderWidth: 1.5,
    borderColor: "#1abc9c",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "#1abc9c20",
  },
  currentStageText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1abc9c",
  },
  callBtn: {
    backgroundColor: "#0d1f3c",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  callBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0d1f3c",
    marginBottom: 10,
  },
  completeBtn: {
    backgroundColor: "#f39c12",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  completeBtnDisabled: {
    backgroundColor: "#aaa",
  },
  completeBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  notesInput: {
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#333",
    minHeight: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e4ef",
  },
  saveBtn: {
    backgroundColor: "#1abc9c",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  saveBtnDisabled: {
    backgroundColor: "#aaa",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#e53935",
  },
  deleteBtnText: {
    color: "#e53935",
    fontSize: 15,
    fontWeight: "600",
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
