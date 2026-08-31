import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SECTIONS = [
  {
    id: 1,
    title: "1. Acceptance of Terms",
    content:
      "By downloading, registering, or using this application (\"App\"), you agree to be bound by these Terms and Conditions (\"Terms\"). If you do not agree, you must not use the App.\n\nThese Terms apply to all users, including individuals, businesses, and tax agents.",
  },
  {
    id: 2,
    title: "2. Description of Service",
    content:
      "The App provides digital tax-related services including but not limited to:\n\n• Tax calculation and estimation tools\n• Tax return preparation assistance\n• Document upload and storage\n• Tax advisory support (automated and/or human-assisted)\n• Compliance reminders and reporting tools\n\nThe App acts as a support tool and does not replace official government tax systems or legal tax authority decisions.",
  },
  {
    id: 3,
    title: "3. No Legal or Tax Authority Representation",
    content:
      "The App is not a government authority and does not represent the Sri Lanka Inland Revenue Department or any other tax authority.\n\nFinal tax assessment, approval, penalties, or refunds are determined solely by the relevant tax authority.",
  },
  {
    id: 4,
    title: "4. User Responsibilities",
    content:
      "You agree that:\n\n• All information provided is true, accurate, and complete\n• You will update information when necessary\n• You are fully responsible for submissions made through your account\n• You will comply with applicable tax laws and regulations\n• You will not use the App for fraudulent or illegal purposes",
  },
  {
    id: 5,
    title: "5. Account Registration & Security",
    content:
      "• You must provide valid information during registration\n• You are responsible for maintaining confidentiality of login credentials\n• Any activity under your account is your responsibility\n• You must notify us immediately of unauthorized access\n\nWe are not liable for losses due to unauthorized account usage caused by user negligence.",
  },
  {
    id: 6,
    title: "6. Data Privacy & Processing",
    content:
      "• Your personal, financial, and tax-related data is stored securely\n• Data is processed only for tax-related services and compliance purposes\n• We may use encrypted storage and security controls aligned with industry standards\n• We do not sell personal data to third parties\n\nFor full details, refer to our Privacy Policy.",
  },
  {
    id: 7,
    title: "7. Document Uploads",
    content:
      "• You may upload financial documents such as payslips, invoices, and statements\n• You are responsible for ensuring uploaded content is lawful and accurate\n• We reserve the right to remove or restrict access to any illegal or inappropriate content",
  },
  {
    id: 8,
    title: "8. Service Accuracy Disclaimer",
    content:
      "While we aim to provide accurate tax calculations and guidance:\n\n• Results are estimates only\n• Errors may occur due to incorrect user input or regulatory changes\n• We do not guarantee tax authority acceptance or outcomes",
  },
  {
    id: 9,
    title: "9. Fees & Payments",
    content:
      "• Some features may be free, while others require subscription or one-time payment\n• All payments are non-refundable unless explicitly stated\n• Subscription plans will be billed according to selected terms\n• Failure to pay may result in service restriction",
  },
  {
    id: 10,
    title: "10. Third-Party Services",
    content:
      "The App may integrate with:\n\n• Government tax portals\n• Payment gateways\n• Cloud storage providers\n• Identity verification services\n\nWe are not responsible for the availability, performance, or policies of third-party services.",
  },
  {
    id: 11,
    title: "11. Intellectual Property",
    content:
      "All content, software, design, and branding within the App are owned by us or licensed to us.\n\nYou may not:\n• Copy, modify, or distribute App content without permission\n• Reverse engineer or attempt to extract source code",
  },
  {
    id: 12,
    title: "12. Prohibited Activities",
    content:
      "You agree not to:\n\n• Provide false or misleading tax information\n• Attempt unauthorized access to the system\n• Interfere with App security or functionality\n• Use the App for unlawful purposes\n• Upload malicious files or code",
  },
  {
    id: 13,
    title: "13. Service Availability",
    content:
      "We aim to provide uninterrupted service but do not guarantee:\n\n• Continuous availability\n• Error-free operation\n• Compatibility with all devices or systems\n\nWe may suspend or modify services for maintenance or updates.",
  },
  {
    id: 14,
    title: "14. Limitation of Liability",
    content:
      "To the maximum extent permitted by law:\n\n• We are not liable for any tax penalties, fines, losses, or damages arising from use of the App\n• We are not responsible for decisions made by tax authorities\n• We are not liable for data loss due to external factors beyond our control",
  },
  {
    id: 15,
    title: "15. Account Suspension or Termination",
    content:
      "We may suspend or terminate your account if:\n\n• You violate these Terms\n• Fraud or misuse is detected\n• Required by law or regulatory authorities\n\nYou may also delete your account at any time.",
  },
  {
    id: 16,
    title: "16. Changes to Terms",
    content:
      "We may update these Terms from time to time. Users will be notified through the App or email. Continued use of the App constitutes acceptance of updated Terms.",
  },
  {
    id: 17,
    title: "17. Governing Law",
    content:
      "These Terms shall be governed by the laws of Sri Lanka. Any disputes shall be subject to the jurisdiction of Sri Lankan courts.",
  },
  {
    id: 18,
    title: "18. Contact Information",
    content:
      "For questions regarding these Terms, contact:\n\n📧 tax@brisca.lk\n🌐 www.brisca.lk",
  },
];

export default function TermsAndConditions() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const toggleSection = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <Text style={styles.headerSubtitle}>
          FileMytax by Brisca · Est. 2015
        </Text>

        <View style={styles.effectiveBadge}>
          <Ionicons name="calendar-outline" size={14} color="#1abc9c" />
          <Text style={styles.effectiveText}>Effective: 1st May 2026</Text>
        </View>
      </View>

      {/* ── Bottom White Section ── */}
      <ScrollView
        style={styles.bottomSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro Banner */}
        <View style={styles.introText}>
          <Text style={styles.introContent}>
            Please read these Terms and Conditions carefully before using
            FileMytax. By using the app you agree to be bound by these terms.
          </Text>
        </View>

        {/* ── Accordion Sections ── */}
        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Ionicons
                name={
                  expandedId === section.id
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={18}
                color="#1abc9c"
              />
            </TouchableOpacity>

            {expandedId === section.id && (
              <View style={styles.sectionContent}>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionText}>{section.content}</Text>
              </View>
            )}
          </View>
        ))}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color="#1abc9c"
          />
          <Text style={styles.footerText}>
            FileMytax by Brisca · All rights reserved
          </Text>
          <Text style={styles.footerEmail}>tax@brisca.lk</Text>
          <Text style={styles.footerEmail}>www.brisca.lk</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1f3c",
  },

  // ── Header ──
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
    marginBottom: 14,
  },
  effectiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(26,188,156,0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  effectiveText: {
    fontSize: 12,
    color: "#1abc9c",
    fontWeight: "600",
  },

  // ── Bottom Section ──
  bottomSection: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    padding: 20,
  },
  introText: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1abc9c",
  },
  introContent: {
    fontSize: 13,
    color: "#555",
    lineHeight: 22,
  },

  // ── Accordion ──
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A2555",
    flex: 1,
    paddingRight: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionContent: {
    paddingBottom: 16,
  },
  sectionText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  // ── Footer ──
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
  },
  footerEmail: {
    fontSize: 12,
    color: "#1abc9c",
  },
});