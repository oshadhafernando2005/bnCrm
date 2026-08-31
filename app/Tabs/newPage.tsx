import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

const PLAY_STORE_LINK =
  "https://play.google.com/store/apps/details?id=com.brisca.filemytax";

export default function ReferralPage() {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [discountEarned, setDiscountEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  

  // ✅ useFocusEffect refreshes every time page is opened
  useFocusEffect(
  useCallback(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();

          // ✅ Generate code if missing
          if (!data.referralCode) {
            const newCode = Math.floor(
              1000 + Math.random() * 9000
            ).toString();

            await updateDoc(userRef, {
              referralCode: newCode,
              referralCount: 0,
              discountPercent: 0,
            });

            setReferralCode(newCode);
            setReferralCount(0);
            setDiscountEarned(0);
          } else {
            setReferralCode(data.referralCode || "");
            setReferralCount(data.referralCount || 0);

            // ✅ Find all friends who used this referral code
            const friendsQuery = query(
              collection(db, "users"),
              where("referredBy", "==", data.referralCode)
            );
            const friendsSnap = await getDocs(friendsQuery);

            // ✅ Sum up 10% of each friend's finalTaxAmount
            let totalDiscount = 0;
            friendsSnap.forEach((friendDoc) => {
              const friendData = friendDoc.data();
              const friendTax = friendData.finalTaxAmount || 0;
              totalDiscount += friendTax * 0.1; // 👈 10% of each friend's tax
            });

            setDiscountEarned(totalDiscount);
          }
        }
      } catch (err) {
        console.log("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])
);

  // ✅ Share via WhatsApp
  const shareViaWhatsApp = () => {
    const message =
      `Hey! 👋 I'm using *FileMytax* to file my taxes easily and hassle-free.\n\n` +
      `📲 Download the app here:\n${PLAY_STORE_LINK}\n\n` +
      `🎁 Use my referral code *${referralCode}* when you register to get a *10% discount!*\n\n` +
      `— Powered by Brisca`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            "WhatsApp not found",
            "Please install WhatsApp to share your referral code."
          );
        }
      })
      .catch((err) => console.log(err));
  };

  // ✅ Copy code
  const copyCode = () => {
    Alert.alert("Copied!", `Referral code ${referralCode} copied.`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1abc9c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      


      {/* ── Top Dark Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >

          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <Text style={styles.headerSubtitle}>
          Share FileMytax with friends and earn Rewards
        </Text>
        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{referralCount}</Text>
            <Text style={styles.statLabel}>Friends Referred</Text>
          </View>
          <View style={styles.statCard}>
          <Text style={styles.statValue}>
            LKR {discountEarned.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Discount Earned</Text>
        </View>
        </View>
        
      </View>

      <ScrollView
        style={styles.bottomSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionLabel}>How It Works</Text>

        {/* ── How it works ── */}
        <View style={styles.stepsRow}>
          <View style={styles.stepBox}>
            <Text style={styles.stepIcon}>⬆️</Text>
            <Text style={styles.stepText}>Share your code</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#ccc" />
          <View style={styles.stepBox}>
            <Text style={styles.stepIcon}>👤</Text>
            <Text style={styles.stepText}>Friend registers</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#ccc" />
          <View style={styles.stepBox}>
            <Text style={styles.stepIcon}>🎉</Text>
            <Text style={styles.stepText}>Receive cash</Text>
          </View>
        </View>

        {/* ── Referral Code Box ── */}
        <Text style={styles.sectionLabel}>Your Referral Code</Text>
        <View style={styles.codeCard}>
          <Text style={styles.codeText}>{referralCode}</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
            <Ionicons name="copy-outline" size={18} color="#1abc9c" />
            <Text style={styles.copyBtnText}>Copy</Text>
          </TouchableOpacity>
        </View>

        {/* ── Share Button ── */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={shareViaWhatsApp}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          <Text style={styles.shareBtnText}>Share via WhatsApp</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
    paddingBottom: 28,
  },
  backButton: {
    marginBottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
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
  },
  scrollContent: {
    padding: 20,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  stepBox: {
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  stepIcon: {
    fontSize: 24,
    color:"#000949"
  },
  stepText: {
    fontSize: 11,
    color: "#555",
    textAlign: "center",
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#888",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  codeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#1abc9c",
    borderStyle: "dashed",
    elevation: 2,
  },
  codeText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0d1f3c",
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e8faf5",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  copyBtnText: {
    color: "#1abc9c",
    fontWeight: "600",
    fontSize: 13,
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
  marginBottom: 20,
},
statCard: {
  alignItems: "center",
  gap: 4,
  flex: 1,
},
statDivider: {
  width: 1,
  height: 40,
  backgroundColor: "#2a3f5f",
},
statValue: {
  fontSize: 22,
  fontWeight: "800",
  color: "#1abc9c",
},
statLabel: {
  fontSize: 11,
  color: "#aaa",
  fontWeight: "600",
  textAlign: "center",
},
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 12,
    backgroundColor: "#1abc9c",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  milestonesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    gap: 14,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  milestoneDot: {
    width: 32,
    alignItems: "center",
  },
  milestoneTextBox: {
    flex: 1,
  },
  milestoneLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A2555",
  },
  milestoneDiscount: {
    fontSize: 12,
    color: "#1abc9c",
    fontWeight: "600",
  },
  shareBtn: {
    backgroundColor: "#25D366",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 4,
  },
  shareBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  statBox: {
    alignItems: "center",
    gap: 4,
    flex: 1,
    
  }
  
});