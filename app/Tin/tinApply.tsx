import emailjs, { init } from "@emailjs/react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

export default function TinApply() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState("");
  const [document, setDocument] = useState<{ name: string; uri: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    init({ publicKey: "ophzURbz2aXLZmZ6w" });

    const fetchData = async () => {
      try {
        if (!user) return;
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setWhatsapp(data.whatsapp || "");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 📷 Take photo with camera
  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setDocument({
        name: "Photo_" + Date.now() + ".jpg",
        uri: asset.uri,
      });
    }
  };

  // 📁 Pick document from device
  const handleDocumentPick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setDocument({
        name: asset.name,
        uri: asset.uri,
      });
    }
  };

  // ☁️ Upload file to Firebase Storage and return download URL
  const uploadToStorage = async (uri: string, fileName: string): Promise<string> => {
    setUploadProgress("Uploading document...");

    console.log("📁 Starting upload...");
    console.log("URI:", uri);
    console.log("File name:", fileName);
    console.log("User ID:", user?.uid);

    const storage = getStorage();
    console.log("Storage bucket:", storage.app.options.storageBucket);

    const fileRef = storageRef(storage, `nic-documents/${user!.uid}/${fileName}`);
    console.log("Storage path:", fileRef.fullPath);

    console.log("🔄 Fetching file from URI...");
    const response = await fetch(uri);
    console.log("Fetch status:", response.status, response.ok);
    const blob = await response.blob();
    console.log("Blob size:", blob.size, "type:", blob.type);

    console.log("⬆️ Uploading to Firebase Storage...");
    await uploadBytes(fileRef, blob);
    console.log("✅ Upload done, getting download URL...");
    const downloadURL = await getDownloadURL(fileRef);
    console.log("🔗 Download URL:", downloadURL);

    setUploadProgress("");
    return downloadURL;
  };

  // ✅ Apply TIN
  const applyTin = async () => {
    if (!whatsapp || !document) {
      Alert.alert("Missing Data", "WhatsApp number and a document/photo are required.");
      return;
    }

    try {
      setSaving(true);

      // ☁️ Upload document to Firebase Storage
      const downloadURL = await uploadToStorage(document.uri, document.name);

      // 🔥 Save to Firestore (including the document URL)
      await updateDoc(doc(db, "users", user!.uid), {
        whatsapp,
        nicDocumentURL: downloadURL,
        nicDocumentName: document.name,
        tinApplied: true,
        tinAppliedAt: new Date(),
      });

      // 📧 Send email via EmailJS with the document link
      await emailjs.send(
        "service_4fngdb4",
        "template_4vupjoe",
        {
          whatsapp: whatsapp,
          document_name: document.name,
          document_url: downloadURL,
          user_email: user?.email || "Not provided",
          applied_at: new Date().toLocaleString(),
        }
      );

      Alert.alert(
        "Success ✅",
        "Your TIN application has been submitted successfully. Our team will contact you shortly.",
        [{ text: "OK", onPress: () => router.push("/Tabs/home") }]
      );
    } catch (error: any) {
      console.log("❌ Full error:", JSON.stringify(error));
      console.log("❌ Error message:", error?.message);
      console.log("❌ Error code:", error?.code);
      console.log("❌ Error stack:", error?.stack);
      Alert.alert(
        "Error",
        error?.code || error?.text || error?.message || "Failed to submit. Please try again."
      );
    } finally {
      setSaving(false);
      setUploadProgress("");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1abc9c" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* ── Top Dark Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/Tabs/home")}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>TIN Registration</Text>
            <Text style={styles.headerSubtitle}>
              Submit your TIN application and our team will process it shortly
            </Text>
          </View>

          {/* ── Bottom White Section ── */}
          <View style={styles.bottomSection}>

            {/* ── Info Banner ── */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoIcon}>📋</Text>
              <Text style={styles.infoText}>
                Please upload your NIC document or take a photo, and confirm your WhatsApp number before submitting.
                Our team will contact you via WhatsApp to complete the process.
              </Text>
            </View>

            {/* ── Form ── */}
            <View style={styles.card}>

              <Text style={styles.fieldLabel}>NIC Document</Text>
              <Text style={styles.fieldHint}>Upload a photo or scan of your NIC</Text>

              <View style={styles.uploadRow}>
                <TouchableOpacity style={styles.uploadBtn} onPress={handleCamera}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadBtnText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadBtn} onPress={handleDocumentPick}>
                  <Text style={styles.uploadIcon}>📁</Text>
                  <Text style={styles.uploadBtnText}>Upload File</Text>
                </TouchableOpacity>
              </View>

              {/* Selected file preview */}
              {document ? (
                <View style={styles.filePreview}>
                  <Text style={styles.fileIcon}>✅</Text>
                  <Text style={styles.fileName} numberOfLines={1}>{document.name}</Text>
                  <TouchableOpacity onPress={() => setDocument(null)}>
                    <Text style={styles.fileRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.filePlaceholder}>
                  <Text style={styles.filePlaceholderText}>No file selected</Text>
                </View>
              )}

              <Text style={styles.fieldLabel}>WhatsApp Number</Text>
              <TextInput
                value={whatsapp}
                onChangeText={setWhatsapp}
                style={styles.input}
                placeholder="Enter WhatsApp number"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
              />

              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.readOnlyBox}>
                <Text style={styles.readOnlyText}>
                  {user?.email || "Not available"}
                </Text>
              </View>
              <Text style={styles.readOnlyHint}>
                This is your registered email and cannot be changed here.
              </Text>

            </View>

            {/* ── Notice ── */}
            <View style={styles.noticeBanner}>
              <Text style={styles.noticeIcon}>⏱️</Text>
              <Text style={styles.noticeText}>
                TIN applications are typically processed within 3-5 working days.
              </Text>
            </View>

            {/* ── Submit Button ── */}
            <TouchableOpacity
              style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
              onPress={applyTin}
              disabled={saving}
            >
              {saving ? (
                <View style={styles.savingRow}>
                  <ActivityIndicator color="#fff" />
                  {uploadProgress ? (
                    <Text style={styles.uploadProgressText}>{uploadProgress}</Text>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.submitText}>Submit TIN Application</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: "#f5f6fa",
  },
  header: {
    backgroundColor: "#0d1f3c",
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  bottomSection: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e8faf5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#1abc9c",
    gap: 10,
  },
  infoIcon: { fontSize: 20 },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#2d6a4f",
    lineHeight: 20,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
    marginTop: 8,
  },
  fieldHint: {
    fontSize: 11,
    color: "#aaa",
    marginBottom: 10,
    fontStyle: "italic",
  },
  uploadRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d0d4e0",
    borderStyle: "dashed",
    gap: 6,
  },
  uploadIcon: { fontSize: 24 },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0d1f3c",
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8faf5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  fileIcon: { fontSize: 16 },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: "#2d6a4f",
    fontWeight: "500",
  },
  fileRemove: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  filePlaceholder: {
    backgroundColor: "#f7f8fc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filePlaceholderText: {
    fontSize: 12,
    color: "#bbb",
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "#f0f2f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  readOnlyBox: {
    backgroundColor: "#f7f8fc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  readOnlyText: {
    fontSize: 14,
    color: "#888",
  },
  readOnlyHint: {
    fontSize: 11,
    color: "#aaa",
    marginBottom: 8,
    fontStyle: "italic",
  },
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
    gap: 10,
  },
  noticeIcon: { fontSize: 20 },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: "#7a6000",
    fontWeight: "500",
  },
  submitBtn: {
    backgroundColor: "#0d1f3c",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  submitBtnDisabled: {
    backgroundColor: "#aaa",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  uploadProgressText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});
