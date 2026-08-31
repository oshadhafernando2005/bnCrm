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
    title: "1. Introduction",
    content:
      "Welcome to FileMytax, a mobile application developed and operated by Brisca. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our application.\n\nBy using FileMytax, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of the application immediately.",
  },
  {
    id: 2,
    title: "2. Information We Collect",
    content:
      "We collect the following personal information when you register:\n\n• Full name and initials as per NIC\n• National Identity Card (NIC) number\n• Tax Identification Number (TIN)\n• Email address and mobile phone number\n• Residential and business address\n• WhatsApp contact number\n\nWe also collect financial information including employment income, business documents, investment income, assets, liabilities, and bank statements.\n\nDocuments you upload (PDFs, photos, images) are stored securely in Firebase Cloud Storage under your personal account folder.",
  },
  {
    id: 3,
    title: "3. How We Use Your Information",
    content:
      "We use the information we collect for the following purposes:\n\n• To create and manage your user account\n• To assist with the preparation and filing of your annual tax returns\n• To store and organise your financial documents and records\n• To communicate with you regarding your tax submissions\n• To provide customer support and respond to your enquiries\n• To improve and maintain the application\n• To comply with applicable laws and regulations",
  },
  {
    id: 4,
    title: "4. Data Storage & Security",
    content:
      "Your data is stored securely using Google Firebase, which provides industry-standard encryption and security measures. Your personal information, financial data, and uploaded documents are stored under your unique user account and are accessible only to you and authorised Brisca personnel.\n\nYour uploaded documents are stored in Firebase Cloud Storage in a folder structure organised by your full name as per your NIC.",
  },
  {
    id: 5,
    title: "5. Sharing of Information",
    content:
      "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:\n\n• With your explicit consent\n• With authorised Brisca staff\n• With the Inland Revenue Department of Sri Lanka as required for tax filing\n• With service providers such as Google Firebase\n• When required by law or government authority",
  },
  {
    id: 6,
    title: "6. Your Rights",
    content:
      "You have the following rights regarding your personal information:\n\n• Access: Request a copy of your personal information\n• Correction: Update or correct your information through the app\n• Deletion: Request deletion of your account and associated data\n• Withdrawal of Consent: Withdraw consent to data processing at any time\n• Data Portability: Request your data in a portable format\n\nTo exercise any of these rights, please contact us at support@filemytax.com",
  },
  {
    id: 7,
    title: "7. Camera & Storage Permissions",
    content:
      "FileMytax requests access to your device camera and media library solely for the purpose of allowing you to upload documents and photographs of your financial records. We do not access your camera or gallery without your explicit action within the application. You may revoke these permissions at any time through your device settings.",
  },
  {
    id: 8,
    title: "8. Retention of Data",
    content:
      "We retain your personal information and uploaded documents for as long as your account remains active or as required to provide our services. If you request deletion of your account, we will delete your data within 30 days, except where retention is required by law or regulatory obligation.",
  },
  {
    id: 9,
    title: "9. Contact Us",
    content:
      "If you have any questions or concerns regarding this Privacy Policy, please contact us:\n\n• Company: Brisca\n• Application: FileMytax\n• Email: tax@brisca.lk\n• Website: brisca.com.au\n• Established: 2015",
  },
  {
    id: 10,
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any significant changes through the application or by email. Your continued use of FileMytax after any changes indicates your acceptance of the updated policy.",
  },
];

export default function PrivacyPolicy() {
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

        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
        <Text style={styles.introText}>
          We are committed to protecting your privacy. Please read the
          sections below to understand how we handle your data.
        </Text>

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
          <Ionicons name="shield-checkmark-outline" size={24} color="#1abc9c" />
          <Text style={styles.footerText}>
            FileMytax by Brisca · All rights reserved
          </Text>
          
        </View>

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
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1abc9c",
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