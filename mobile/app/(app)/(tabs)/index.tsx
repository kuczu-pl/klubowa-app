// ═══════════════════════════════════════════════════════════════════
// DASHBOARD TAB — Quick stats, last news, upcoming events, top ideas
// Full implementation in Phase 2
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/utils/theme';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { useSettingsStore } from '../../../src/stores/useSettingsStore';
import { useDataStore } from '../../../src/stores/useDataStore';

export default function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const { users, news, events, ideas } = useDataStore();

  const upcomingEvents = events
    .filter((e) => e.date >= new Date().toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const latestNews = [...news].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header with drawer toggle */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{settings.orgName || 'Aplikacja Koła'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome banner */}
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme.primary,
              ...theme.shadow,
            },
          ]}
        >
          <Text style={styles.bannerTitle}>
            Witaj, {user?.name?.split(' ')[0]}!
          </Text>
          <Text style={styles.bannerSub}>
            {settings.orgName || 'Aplikacja Koła'}
          </Text>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Członkowie', value: users.length, icon: 'people' as const },
            { label: 'Wydarzenia', value: events.length, icon: 'calendar' as const },
            { label: 'Aktualności', value: news.length, icon: 'newspaper' as const },
            { label: 'Pomysły', value: ideas.length, icon: 'bulb' as const },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, theme.shadow]}>
              <Ionicons name={s.icon} size={20} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text || '#1a1a1a' }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textM || '#666' }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text || '#1a1a1a' }]}>
              Nadchodzące wydarzenia
            </Text>
            {upcomingEvents.map((ev) => (
              <View key={ev.id} style={[styles.card, theme.shadow]}>
                <Text style={[styles.cardTitle, { color: theme.text || '#1a1a1a' }]}>
                  {ev.title}
                </Text>
                <Text style={[styles.cardMeta, { color: theme.textM || '#666' }]}>
                  {ev.date} {ev.time ? `o ${ev.time}` : ''} {ev.place ? `• ${ev.place}` : ''}
                </Text>
                <Text style={[styles.cardMeta, { color: theme.primary }]}>
                  {ev.attendees?.length || 0} uczestników
                  {ev.limit ? ` / ${ev.limit}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Latest news */}
        {latestNews.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text || '#1a1a1a' }]}>
              Ostatnie aktualności
            </Text>
            {latestNews.map((n) => (
              <View key={n.id} style={[styles.card, theme.shadow]}>
                <Text style={[styles.cardTitle, { color: theme.text || '#1a1a1a' }]}>
                  {n.title}
                </Text>
                <Text style={[styles.cardMeta, { color: theme.textM || '#666' }]}>
                  {n.date} {n.category ? `• ${n.category}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  content: { padding: 16 },
  banner: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  statLabel: { fontSize: 11, marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 13, marginTop: 4 },
});
