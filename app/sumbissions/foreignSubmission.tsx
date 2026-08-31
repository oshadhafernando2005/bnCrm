import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db, storage } from "../../firebase";

type FileData = {
  url: string;
  name: string;
  storagePath: string;
};

export default function OtherIncomeDocuments() {
  const router = useRouter();
  const [files, setFiles] = useState<FileData[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentOnSelect, setCurrentOnSelect] = useState<((uri: string, name: string) => void) | null>(null);
  const [fullNameNIC, setFullNameNIC] = useState("");

  // 🔄 Fetch existing data
  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFullNameNIC(data.fullNameNIC || user.uid);

        const foreign = data?.documents?.foreign;
        if (foreign?.files && Array.isArray(foreign.files)) {
          setFiles(foreign.files);
        }
        if (foreign?.note) {
          setNote(foreign.note);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 📁 Show modal
  const showUploadOptions = (
    onSelect: (uri: string, name: string) => void
  ) => {
    setCurrentOnSelect(() => onSelect);
    setShowModal(true);
  };

  // 📷 Camera
  const handleCamera = async () => {
    setShowModal(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Camera access is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && currentOnSelect) {
      const asset = result.assets[0];
      currentOnSelect(asset.uri, `photo_${Date.now()}.jpg`);
    }
  };

  // 🖼️ Gallery
  const handleGallery = async () => {
    setShowModal(false);
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Gallery access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && currentOnSelect) {
      const asset = result.assets[0];
      currentOnSelect(asset.uri, `image_${Date.now()}.jpg`);
    }
  };

  // 📄 PDF
  const handlePDF = async () => {
    setShowModal(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (!result.canceled && currentOnSelect) {
      const file = result.assets[0];
      currentOnSelect(file.uri, file.name);
    }
  };

  // 📤 Upload file
  const uploadFile = async (
    uri: string,
    name: string
  ): Promise<{ url: string; storagePath: string }> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const response = await fetch(uri);
    const blob = await response.blob();

    const folderName = fullNameNIC || user.uid;
    const storagePath = `documents/${folderName}/foreign/${Date.now()}_${name}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);

    return { url, storagePath };
  };

  // 💾 Save note
  const saveNote = async (text: string) => {
    setNote(text);
    try {
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid), {
        "documents.foreign.note": text,
      });
    } catch (err) {
      console.log(err);
    }
  };

  // ➕ Add file
  const handleAddFile = () => {
    showUploadOptions(async (uri, name) => {
      try {
        setUploading("add");
        const { url, storagePath } = await uploadFile(uri, name);
        const newFile: FileData = { url, name, storagePath };
        const updated = [...files, newFile];

        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          "documents.foreign.files": updated,
        });

        setFiles(updated);
        Alert.alert("Success", "Document uploaded ✅");
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Upload failed ❌");
      } finally {
        setUploading(null);
      }
    });
  };

  // 🔁 Replace file
  const handleReplace = (index: number) => {
    showUploadOptions(async (uri, name) => {
      try {
        setUploading(index);

        const oldPath = files[index]?.storagePath;
        if (oldPath) {
          await deleteObject(ref(storage, oldPath)).catch(() => {});
        }

        const { url, storagePath } = await uploadFile(uri, name);
        const updated = [...files];
        updated[index] = { url, name, storagePath };

        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          "documents.foreign.files": updated,
        });

        setFiles(updated);
        Alert.alert("Updated", "Document replaced ✅");
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Replace failed ❌");
      } finally {
        setUploading(null);
      }
    });
  };

  // 🗑️ Delete file
  const handleDelete = (index: number) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this file?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setUploading(index);
              const user = auth.currentUser;
              if (!user) return;

              const storagePath = files[index]?.storagePath;
              if (storagePath) {
                await deleteObject(ref(storage, storagePath)).catch(() => {});
              }

              const updated = files.filter((_, i) => i !== index);
              await updateDoc(doc(db, "users", user.uid), {
                "documents.foreign.files": updated,
              });

              setFiles(updated);
              Alert.alert("Deleted", "Document removed ✅");
            } catch (err) {
              console.log(err);
              Alert.alert("Error", "Delete failed ❌");
            } finally {
              setUploading(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1abc9c" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.push("/Tabs/documents")}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Documents</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Other Income</Text>

      {/* ── Info Banner ── */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Do you have any other income that does not belong to the above
          categories? You can mention it here and upload any supporting
          documents.
        </Text>
      </View>

      {/* ── Note Section ── */}
      <Text style={styles.sectionLabel}>Additional Notes</Text>
      <TextInput
        style={styles.noteInput}
        placeholder="Describe your other income here (e.g. freelance work, royalties, prizes...)"
        placeholderTextColor="#aaa"
        value={note}
        onChangeText={saveNote}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* ── Documents Section ── */}
      <Text style={styles.sectionLabel}>Supporting Documents</Text>

      {/* File list */}
      {files.map((file, index) => (
        <View key={index} style={styles.fileRow}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileIcon}>📄</Text>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
          </View>

          <View style={styles.fileActions}>
            <TouchableOpacity
              style={styles.replaceBtn}
              onPress={() => handleReplace(index)}
              disabled={uploading === index}
            >
              {uploading === index ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>🔁 Replace</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(index)}
              disabled={uploading === index}
            >
              <Text style={styles.btnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Add button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={handleAddFile}
        disabled={uploading === "add"}
      >
        {uploading === "add" ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.addBtnText}>+ Add Document</Text>
        )}
      </TouchableOpacity>

      {/* 🗂️ Upload Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Upload Document</Text>
            <Text style={styles.modalSubtitle}>Choose how to upload</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCamera}
            >
              <Text style={styles.modalOptionIcon}>📷</Text>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleGallery}
            >
              <Text style={styles.modalOptionIcon}>🖼️</Text>
              <Text style={styles.modalOptionText}>Upload from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handlePDF}
            >
              <Text style={styles.modalOptionIcon}>📄</Text>
              <Text style={styles.modalOptionText}>Upload PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f6fa",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
  position: "absolute",
  top: 45,          // 👈 try values between 40–60
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
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 80,
    textAlign: "center",
    color: "#1A2555",
  },

  // ── Info Banner ──
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e8faf5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#1abc9c",
    gap: 10,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#2d6a4f",
    lineHeight: 20,
    fontWeight: "500",
  },

  // ── Note ──
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2555",
    marginBottom: 10,
  },
  noteInput: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#d0d7f0",
    padding: 14,
    fontSize: 14,
    color: "#333",
    minHeight: 110,
    marginBottom: 24,
  },

  // ── File Row ──
  fileRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  fileIcon: {
    fontSize: 24,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  fileActions: {
    flexDirection: "row",
    gap: 10,
  },
  replaceBtn: {
    flex: 1,
    backgroundColor: "#ff9800",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteBtn: {
    backgroundColor: "#e53935",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 14,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  // ── Add Button ──
  addBtn: {
    backgroundColor: "#1A2555",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 30,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A2555",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 14,
  },
  modalOptionIcon: {
    fontSize: 24,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  modalCancel: {
    marginTop: 16,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
  },
  modalCancelText: {
    color: "#e53935",
    fontWeight: "600",
    fontSize: 15,
  },
});