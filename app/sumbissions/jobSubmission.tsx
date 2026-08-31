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

export default function JobDocuments() {

  const router = useRouter();
  const [t10File, setT10File] = useState<string | null>(null);
  const [t10FileName, setT10FileName] = useState<string | null>(null);
  const [fullNameNIC, setFullNameNIC] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentOnSelect, setCurrentOnSelect] = useState<((uri: string, name: string) => void) | null>(null);

  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();
        setFullNameNIC(data.fullNameNIC || user.uid);

        const t10 = data?.documents?.employment?.t10;
        if (t10?.url) {
          setT10File(t10.url);
          setT10FileName(t10.name || "Uploaded File");
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

  // 📁 Show custom modal
  const showUploadOptions = (onSelect: (uri: string, name: string) => void) => {
    setCurrentOnSelect(() => onSelect);
    setShowModal(true);
  };

  // 📷 Take Photo
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

  // 📤 Upload to Firebase Storage
  const uploadFile = async (uri: string, name: string): Promise<{ url: string; storagePath: string }> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    const response = await fetch(uri);
    const blob = await response.blob();

    const folderName = fullNameNIC || user.uid;
    const storagePath = `documents/${folderName}/employment/${name}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);

    return { url, storagePath };
  };

  // ➕ Upload T10
  const handleUploadT10 = () => {
    showUploadOptions(async (uri, name) => {
      try {
        setUploading(true);
        const { url, storagePath } = await uploadFile(uri, name);

        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          "documents.employment.t10": { url, name, storagePath },
        });

        setT10File(url);
        setT10FileName(name);
        Alert.alert("Success", "T10 Certificate uploaded ✅");
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Upload failed ❌");
      } finally {
        setUploading(false);
      }
    });
  };

  // 🔁 Replace T10
  const handleReplaceT10 = () => {
    showUploadOptions(async (uri, name) => {
      try {
        setUploading(true);
        const { url, storagePath } = await uploadFile(uri, name);

        await updateDoc(doc(db, "users", auth.currentUser!.uid), {
          "documents.employment.t10": { url, name, storagePath },
        });

        setT10File(url);
        setT10FileName(name);
        Alert.alert("Updated", "T10 Certificate replaced ✅");
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Replace failed ❌");
      } finally {
        setUploading(false);
      }
    });
  };

  // 🗑️ Delete T10
  const handleDeleteT10 = () => {
    Alert.alert(
      "Delete T10 Certificate",
      "Are you sure you want to delete this file?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setUploading(true);
              const user = auth.currentUser;
              if (!user) return;

              const snap = await getDoc(doc(db, "users", user.uid));
              const storagePath = snap.data()?.documents?.employment?.t10?.storagePath;

              if (storagePath) {
                await deleteObject(ref(storage, storagePath)).catch(() => {});
              }

              await updateDoc(doc(db, "users", user.uid), {
                "documents.employment.t10": null,
              });

              setT10File(null);
              setT10FileName(null);
              Alert.alert("Deleted", "T10 Certificate removed ✅");
            } catch (err) {
              console.log(err);
              Alert.alert("Error", "Delete failed ❌");
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
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
      <TouchableOpacity onPress={() => router.push("/Tabs/documents")} style={styles.backButton}>
    <Text style={styles.backText}>← Documents</Text>
  </TouchableOpacity>
      <Text style={styles.pageTitle}>Employment Documents</Text>

      <Text style={styles.sectionLabel}>T10 Certificate</Text>

      <View style={styles.uploadBox}>
        {t10File ? (
          <View style={styles.fileInfo}>
            <Text style={styles.fileIcon}>📄</Text>
            <Text style={styles.fileName} numberOfLines={1}>
              {t10FileName}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handleUploadT10}
            disabled={uploading}
          >
            {uploading ? (
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

      {t10File && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.replaceBtn}
            onPress={handleReplaceT10}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}> Replace</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteT10}
            disabled={uploading}
          >
            <Text style={styles.btnText}> Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🗂️ CUSTOM UPLOAD MODAL */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Upload T10 Certificate</Text>
            

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
    backgroundColor: "#f5f6fa",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 20,
    textAlign: "center",
    color: "#1A2555",
  },
  sectionLabel: {
    fontSize: 16,
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
    minHeight: 120,
  },
  uploadArea: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  uploadIcon: {
    fontSize: 32,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A6CF7",
  },
  uploadHint: {
    fontSize: 12,
    color: "#999",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  fileIcon: {
    fontSize: 28,
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
    marginTop: 12,
  },
  replaceBtn: {
    flex: 1,
    backgroundColor: "#14909d",
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
    fontSize: 14,
  },

  // 🗂️ Modal styles
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
  backButton: {
  backgroundColor: "#062042",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop:20,
    alignSelf: "flex-start",
},
backText: {
  color: "#fff",
    fontSize: 16,
    fontWeight: "600",
},
});