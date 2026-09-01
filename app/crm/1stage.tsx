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
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  createdAt?: any;
};

const stageLabel = (stage: number) => {
  if (stage === 1) return { label: "Stage 1", color: "#f39c12" };
  if (stage === 2) return { label: "Stage 2", color: "#3498db" };
  if (stage === 3) return { label: "Final", color: "#1abc9c" };
  return { label: "Stage 1", color: "#f39c12" };
};

const industries = [
  "Accounting",
  "Manufacturing",
  "Trading",
  "Construction",
  "Education",
  "Healthcare",
  "IT",
  "Other",
];

export default function AllUsers() {
  const router = useRouter();
  const scrollRef = useRef<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Edit states ──
  const [editMode, setEditMode] = useState(false);
  const [editCompany, setEditCompany] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editIndustry, setEditIndustry] = useState("");

  useEffect(() => {
    const q = query(collection(db, "CRMusers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as User))
        .filter((u) => u.stage === 1);
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openUser = (user: User) => {
    setSelectedUser(user);
    setNotes(user.notes || "");
    setEditMode(false);
  };

  const closeModal = () => {
  setSelectedUser(null);
  setNotes("");
  setEditMode(false);
};

  const startEdit = () => {
    if (!selectedUser) return;
    setEditCompany(selectedUser.company || "");
    setEditContact(selectedUser.contactPerson || "");
    setEditMobile(selectedUser.mobileNumber || "");
    setEditEmail(selectedUser.email || "");
    setEditCity(selectedUser.city || "");
    setEditIndustry(selectedUser.industry || "");
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    if (!editMobile) {
      Alert.alert("Missing Info", "Company and Mobile Number are required.");
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, "CRMusers", selectedUser.id), {
        company: editCompany,
        contactPerson: editContact,
        mobileNumber: editMobile,
        email: editEmail,
        city: editCity,
        industry: editIndustry,
      });

      setSelectedUser({
        ...selectedUser,
        company: editCompany,
        contactPerson: editContact,
        mobileNumber: editMobile,
        email: editEmail,
        city: editCity,
        industry: editIndustry,
      });

      setEditMode(false);
      Alert.alert("Updated ✅", "User details saved successfully.");
    } catch (e: any) {
      Alert.alert("Error ❌", e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleUpgrade = async (stage: number) => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, "CRMusers", selectedUser.id), { stage });
      setSelectedUser({ ...selectedUser, stage });
      Alert.alert(
        "Updated ✅",
        `User moved to ${stage === 2 ? "Stage 2" : "Final Stage"}`
      );
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

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Users</Text>
        <Text style={styles.headerCount}>{users.length} users</Text>
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1abc9c" />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={48} color="#8899bb" />
          <Text style={styles.emptyText}>No users yet</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {users.map((user) => {
            const stage = stageLabel(user.stage);
            return (
              <TouchableOpacity
                key={user.id}
                style={styles.card}
                onPress={() => openUser(user)}
                activeOpacity={0.85}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.company?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View style={styles.cardTextBox}>
                    <Text style={styles.cardName}>
                      {user.company || "No Company"}
                    </Text>
                    <Text style={styles.cardIndustry}>
                      {user.industry || "No Industry"}
                    </Text>
                    <Text style={styles.cardPerson}>
                      {user.contactPerson || "No Contact Person"}
                    </Text>
                  </View>
                </View>
                <View style={[styles.stageBadge, { backgroundColor: stage.color }]}>
                  <Text style={styles.stageBadgeText}>{stage.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* User Detail Modal */}
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
                  {selectedUser?.company || "No Company"}
                </Text>
                <Text style={styles.modalIndustry}>
                  {selectedUser?.industry || "No Industry"}
                </Text>
              </View>
              <View style={styles.modalHeaderBtns}>
                {/* Edit toggle button */}
                <TouchableOpacity
                  style={styles.editToggleBtn}
                  onPress={editMode ? () => setEditMode(false) : startEdit}
                >
                  <Ionicons
                    name={editMode ? "close-outline" : "create-outline"}
                    size={18}
                    color="#4A6CF7"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#0d1f3c" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>

              {/* ── VIEW MODE ── */}
              {!editMode && (
                <>
                  {/* Info Box */}
                  <View style={styles.infoBox}>

                    {/* Contact Person */}
                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={16} color="#8899bb" />
                      {selectedUser?.contactPerson ? (
                        <Text style={styles.infoText}>
                          {selectedUser.contactPerson}
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={startEdit}>
                          <Text style={styles.infoEmpty}>
                            + Add contact person
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Email */}
                    <View style={styles.infoRow}>
                      <Ionicons name="mail-outline" size={16} color="#8899bb" />
                      {selectedUser?.email ? (
                        <Text style={styles.infoText}>{selectedUser.email}</Text>
                      ) : (
                        <TouchableOpacity onPress={startEdit}>
                          <Text style={styles.infoEmpty}>+ Add email</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Mobile */}
                    <View style={styles.infoRow}>
                      <Ionicons name="call-outline" size={16} color="#8899bb" />
                      {selectedUser?.mobileNumber ? (
                        <Text style={styles.infoText}>
                          {selectedUser.mobileNumber}
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={startEdit}>
                          <Text style={styles.infoEmpty}>+ Add mobile</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* City */}
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={16} color="#8899bb" />
                      {selectedUser?.city ? (
                        <Text style={styles.infoText}>{selectedUser.city}</Text>
                      ) : (
                        <TouchableOpacity onPress={startEdit}>
                          <Text style={styles.infoEmpty}>+ Add city</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                  </View>

                  {/* Current Stage */}
                  <View
                    style={[
                      styles.currentStage,
                      {
                        backgroundColor:
                          stageLabel(selectedUser?.stage || 1).color + "20",
                        borderColor: stageLabel(selectedUser?.stage || 1).color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.currentStageText,
                        { color: stageLabel(selectedUser?.stage || 1).color },
                      ]}
                    >
                      Current: {stageLabel(selectedUser?.stage || 1).label}
                    </Text>
                  </View>

                  {/* Call Button */}
                  {selectedUser?.mobileNumber ? (
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => handleCall(selectedUser?.mobileNumber || "")}
                    >
                      <Ionicons name="call" size={18} color="#fff" />
                      <Text style={styles.callBtnText}>
                        Call {selectedUser?.mobileNumber}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.callBtnDisabled}
                      onPress={startEdit}
                    >
                      <Ionicons name="call-outline" size={18} color="#aaa" />
                      <Text style={styles.callBtnDisabledText}>
                        Add mobile number to call
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Upgrade Buttons */}
                  <Text style={styles.sectionLabel}>Upgrade Stage</Text>
                  <View style={styles.upgradeRow}>
                    <TouchableOpacity
                      style={[
                        styles.upgradeBtn,
                        selectedUser?.stage === 2 && styles.upgradeBtnActive,
                      ]}
                      onPress={() => handleUpgrade(2)}
                      disabled={saving}
                    >
                      <Ionicons
                        name="layers-outline"
                        size={16}
                        color={selectedUser?.stage === 2 ? "#fff" : "#3498db"}
                      />
                      <Text
                        style={[
                          styles.upgradeBtnText,
                          selectedUser?.stage === 2 && styles.upgradeBtnTextActive,
                        ]}
                      >
                        Stage 2
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.upgradeBtn,
                        styles.upgradeBtnFinal,
                        selectedUser?.stage === 3 && styles.upgradeBtnFinalActive,
                      ]}
                      onPress={() => handleUpgrade(3)}
                      disabled={saving}
                    >
                      <Ionicons
                        name="checkmark-done-outline"
                        size={16}
                        color={selectedUser?.stage === 3 ? "#fff" : "#1abc9c"}
                      />
                      <Text
                        style={[
                          styles.upgradeBtnText,
                          styles.upgradeBtnTextFinal,
                          selectedUser?.stage === 3 && styles.upgradeBtnTextActive,
                        ]}
                      >
                        Final Stage
                      </Text>
                    </TouchableOpacity>
                  </View>

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
                    onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 500)}
                  />

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

                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={16} color="#e53935" />
                    <Text style={styles.deleteBtnText}>Remove User</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* ── EDIT MODE ── */}
              {editMode && (
                <>
                  <View style={styles.editBanner}>
                    <Ionicons name="create-outline" size={16} color="#4A6CF7" />
                    <Text style={styles.editBannerText}>
                      Editing user details
                    </Text>
                  </View>

                  <Text style={styles.editLabel}>Company </Text>
                  <TextInput
                    style={styles.editInput}
                    value={editCompany}
                    onChangeText={setEditCompany}
                    placeholder="Company name"
                    placeholderTextColor="#aaa"
                  />

                  <Text style={styles.editLabel}>Contact Person</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editContact}
                    onChangeText={setEditContact}
                    placeholder="Contact person's name"
                    placeholderTextColor="#aaa"
                  />

                  <Text style={styles.editLabel}>Mobile Number *</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editMobile}
                    onChangeText={setEditMobile}
                    placeholder="+94 7X XXX XXXX"
                    placeholderTextColor="#aaa"
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.editLabel}>Email</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="email@example.com"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.editLabel}>City</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editCity}
                    onChangeText={setEditCity}
                    placeholder="City"
                    placeholderTextColor="#aaa"
                  />

                  <Text style={styles.editLabel}>Industry</Text>
                  <View style={styles.chipWrap}>
                    {industries.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.chip,
                          editIndustry === item && styles.chipActive,
                        ]}
                        onPress={() => setEditIndustry(item)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            editIndustry === item && styles.chipTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Save Edit Button */}
                  <TouchableOpacity
                    style={[styles.saveEditBtn, saving && styles.saveBtnDisabled]}
                    onPress={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Cancel Edit */}
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={styles.closeBtnText}>Cancel</Text>
                  </TouchableOpacity>

                </>
              )}

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
    marginTop: 30,
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
    backgroundColor: "#0d1f3c",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#1abc9c",
    fontSize: 18,
    fontWeight: "800",
  },
  cardTextBox: {
    flex: 1,
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
  modalTitleBox: {
    flex: 1,
    paddingRight: 10,
  },
  modalHeaderBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#eef0fe",
    alignItems: "center",
    justifyContent: "center",
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
    gap: 12,
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
  infoEmpty: {
    fontSize: 13,
    color: "#4A6CF7",
    fontStyle: "italic",
  },
  currentStage: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 14,
  },
  currentStageText: {
    fontSize: 13,
    fontWeight: "700",
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
  callBtnDisabled: {
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  callBtnDisabledText: {
    color: "#aaa",
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0d1f3c",
    marginBottom: 10,
  },
  upgradeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  upgradeBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#3498db",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  upgradeBtnActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  upgradeBtnFinal: {
    borderColor: "#1abc9c",
  },
  upgradeBtnFinalActive: {
    backgroundColor: "#1abc9c",
    borderColor: "#1abc9c",
  },
  upgradeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3498db",
  },
  upgradeBtnTextFinal: {
    color: "#1abc9c",
  },
  upgradeBtnTextActive: {
    color: "#fff",
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

  // ── Edit Mode ──
  editBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eef0fe",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  editBannerText: {
    color: "#4A6CF7",
    fontSize: 13,
    fontWeight: "600",
  },
  editLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 10,
  },
  editInput: {
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0d1f3c",
    borderWidth: 1,
    borderColor: "#e0e4ef",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#1abc9c",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: "#1abc9c",
  },
  chipText: {
    color: "#1abc9c",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  saveEditBtn: {
    backgroundColor: "#1c2856",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    marginTop: 8,
  },
});