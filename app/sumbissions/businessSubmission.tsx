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
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db, storage } from "../../firebase";

// 📋 Single file sections
const SINGLE_SECTIONS = [
  { key: "businessRegistration", label: "Business Registration" },
  { key: "previousYearFinancial", label: "Previous Year Financial Report" },
];

type FileData = {
  url: string;
  name: string;
  storagePath: string;
};

type SingleFilesState = {
  [key: string]: FileData | null;
};

type MultiFileData = FileData[];

export default function BusinessIncome() {
  const router = useRouter();

  // Single file states
  const [singleFiles, setSingleFiles] = useState<SingleFilesState>({
    businessRegistration: null,
    previousYearFinancial: null,
  });

  // Multiple file state for bank statements
  const [bankStatements, setBankStatements] = useState<MultiFileData>([]);

  const [fullNameNIC, setFullNameNIC] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentOnSelect, setCurrentOnSelect] = useState<((uri: string, name: string) => void) | null>(null);

  // 🔄 Fetch existing data
  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();
        setFullNameNIC(data.fullNameNIC || user.uid);

        const business = data?.documents?.business || {};

        // Load single files
        const updatedSingle: SingleFilesState = {
          businessRegistration: null,
          previousYearFinancial: null,
        };

        SINGLE_SECTIONS.forEach(({ key }) => {
          if (business[key]?.url) {
            updatedSingle[key] = business[key];
          }
        });

        setSingleFiles(updatedSingle);

        // Load bank statements array
        const statements = business?.bankStatements;
        if (Array.isArray(statements)) {
          setBankStatements(statements);
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
  const showUploadOptions = (onSelect: (uri: string, name: string) => void) => {
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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
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

  // 📤 Upload file to Firebase Storage
  const uploadFile = async (
    uri: string,
    name: string,
    sectionKey: string
  ): Promise<{ url: string; storagePath: string }> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const response = await fetch(uri);
    const blob = await response.blob();

    const folderName = fullNameNIC || user.uid;
    const storagePath = `documents/${folderName}/business/${sectionKey}_${name}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);

    return { url, storagePath };
  };

  // ➕ Upload single file
  const handleUploadSingle = (sectionKey: string) => {
    showUploadOptions(async (uri, name) => {
      try {
        setUploading(sectionKey);
        const { url, storagePath } = await uploadFile(uri, name, sectionKey);

        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          [`documents.business.${sectionKey}`]: { url, name, storagePath },
        });

        setSingleFiles((prev) => ({
          ...prev,
          [sectionKey]: { url, name, storagePath },
        }));

        Alert.alert("Success", "Document uploaded ✅");
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Upload failed ❌");
      } finally {
        setUploading(null);
      }
    });
  };

  // 🔁 Replace single file
  const handleReplaceSingle = (sectionKey: string) => {
    showUploadOptions(async (uri, name) => {
      try {
        setUploading(sectionKey);
        const { url, storagePath } = await uploadFile(uri, name, sectionKey);

        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          [`documents.business.${sectionKey}`]: { url, name, storagePath },
        });

        setSingleFiles((prev) => ({
          ...prev,
          [sectionKey]: { url, name, storagePath },
        }));

        Alert.alert("Updated", "Document replaced ✅");
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Replace failed ❌");
      } finally {
        setUploading(null);
      }
    });
  };

  // 🗑️ Delete single file
  const handleDeleteSingle = (sectionKey: string) => {
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
              setUploading(sectionKey);
              const user = auth.currentUser;
              if (!user) return;

              const storagePath = singleFiles[sectionKey]?.storagePath;
              if (storagePath) {
                await deleteObject(ref(storage, storagePath)).catch(() => {});
              }

              await updateDoc(doc(db, "users", user.uid), {
                [`documents.business.${sectionKey}`]: null,
              });

              setSingleFiles((prev) => ({ ...prev, [sectionKey]: null }));
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

  // ➕ Add bank statement
  const handleAddBankStatement = () => {
    showUploadOptions(async (uri, name) => {
      try {
        setUploading("bankStatement_add");
        const { url, storagePath } = await uploadFile(
          uri,
          `${Date.now()}_${name}`,
          "bankStatements"
        );

        const newFile: FileData = { url, name, storagePath };
        const updated = [...bankStatements, newFile];

        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          "documents.business.bankStatements": updated,
        });

        setBankStatements(updated);
        Alert.alert("Success", "Bank statement added ✅");
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Upload failed ❌");
      } finally {
        setUploading(null);
      }
    });
  };

  // 🗑️ Delete bank statement
  const handleDeleteBankStatement = (index: number) => {
    Alert.alert(
      "Delete Bank Statement",
      "Are you sure you want to delete this file?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setUploading(`bankStatement_${index}`);
              const user = auth.currentUser;
              if (!user) return;

              const storagePath = bankStatements[index]?.storagePath;
              if (storagePath) {
                await deleteObject(ref(storage, storagePath)).catch(() => {});
              }

              const updated = bankStatements.filter((_, i) => i !== index);

              await updateDoc(doc(db, "users", user.uid), {
                "documents.business.bankStatements": updated,
              });

              setBankStatements(updated);
              Alert.alert("Deleted", "Bank statement removed ✅");
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

  // 🔁 Replace bank statement
  const handleReplaceBankStatement = (index: number) => {
    showUploadOptions(async (uri, name) => {
      try {
        setUploading(`bankStatement_${index}`);

        // Delete old file from storage
        const oldPath = bankStatements[index]?.storagePath;
        if (oldPath) {
          await deleteObject(ref(storage, oldPath)).catch(() => {});
        }

        const { url, storagePath } = await uploadFile(
          uri,
          `${Date.now()}_${name}`,
          "bankStatements"
        );

        const updated = [...bankStatements];
        updated[index] = { url, name, storagePath };

        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          "documents.business.bankStatements": updated,
        });

        setBankStatements(updated);
        Alert.alert("Updated", "Bank statement replaced ✅");
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Replace failed ❌");
      } finally {
        setUploading(null);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A6CF7" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* 👈 BACK BUTTON */}
      <TouchableOpacity
        onPress={() => router.push("/Tabs/documents")}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Documents</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Business Income</Text>
      <Text >April 1 to March 31 of the following year</Text> 

      {/* ── SINGLE FILE SECTIONS ── */}
      {SINGLE_SECTIONS.map(({ key, label }) => (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionLabel}>{label}</Text>

          <View style={styles.uploadBox}>
            {singleFiles[key] ? (
              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>📄</Text>
                <Text style={styles.fileName} numberOfLines={1}>
                  {singleFiles[key]?.name}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={() => handleUploadSingle(key)}
                disabled={uploading === key}
              >
                {uploading === key ? (
                  <ActivityIndicator color="#4A6CF7" />
                ) : (
                  <>
                    <Text style={styles.uploadIcon}>⬆️</Text>
                    <Text style={styles.uploadText}>Tap to upload</Text>
                    <Text style={styles.uploadHint}>PDF or Image</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {singleFiles[key] && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.replaceBtn}
                onPress={() => handleReplaceSingle(key)}
                disabled={uploading === key}
              >
                {uploading === key ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnText}>🔁 Replace</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteSingle(key)}
                disabled={uploading === key}
              >
                <Text style={styles.btnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      {/* ── BANK STATEMENTS (MULTIPLE) ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Bank Statement</Text>
        <Text >Our Agent will contact you regarding this </Text>
        {/* Existing bank statement files */}
        {bankStatements.map((file, index) => (
          <View key={index} style={styles.multiFileRow}>
            <View style={styles.fileInfo}>
              <Text style={styles.fileIcon}>📄</Text>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
            </View>

            <View style={styles.multiActionRow}>
              <TouchableOpacity
                style={styles.smallReplaceBtn}
                onPress={() => handleReplaceBankStatement(index)}
                disabled={uploading === `bankStatement_${index}`}
              >
                {uploading === `bankStatement_${index}` ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnText}>🔁 Replace</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallDeleteBtn}
                onPress={() => handleDeleteBankStatement(index)}
                disabled={uploading === `bankStatement_${index}`}
              >
                <Text style={styles.btnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ➕ Add new bank statement */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddBankStatement}
          disabled={uploading === "bankStatement_add"}
        >
          {uploading === "bankStatement_add" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>+ Add Bank Statement</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 🗂️ UPLOAD MODAL */}
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

            <TouchableOpacity style={styles.modalOption} onPress={handleCamera}>
              <Text style={styles.modalOptionIcon}>📷</Text>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handleGallery}>
              <Text style={styles.modalOptionIcon}>🖼️</Text>
              <Text style={styles.modalOptionText}>Upload from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handlePDF}>
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
    top:0,
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
    marginBottom: 24,
    marginTop: 80,
    textAlign: "center",
    color: "#1A2555",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2555",
    marginBottom: 10,
  },
  uploadBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#d0d7f0",
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  uploadArea: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  uploadIcon: {
    fontSize: 28,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#03114a",
  },
  uploadHint: {
    fontSize: 12,
    color: "#999",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  fileIcon: {
    fontSize: 26,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  replaceBtn: {
    flex: 1,
    backgroundColor: "#ff9800",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  // Multi file styles
  multiFileRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  multiActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  smallReplaceBtn: {
    flex: 1,
    backgroundColor: "#ff9800",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  smallDeleteBtn: {
    flex: 1,
    backgroundColor: "#e53935",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: "#00a69c",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // Modal styles
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