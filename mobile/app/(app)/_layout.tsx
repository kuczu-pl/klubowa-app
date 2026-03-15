// ═══════════════════════════════════════════════════════════════════
// APP GROUP LAYOUT — Drawer navigator
// Mirrors App.jsx nav array (lines 1479-1523) with role-based items
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useDataStore } from '../../src/stores/useDataStore';
import { useTheme } from '../../src/utils/theme';
import { canSeeDues, canManage, isAdmin, ini } from '../../src/utils/helpers';

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const { settings } = useSettingsStore();
  const { dues, messages, users } = useDataStore();

  if (!user) return null;

  const myUnpaid = dues.filter((d) => d.userId === user.id && !d.paid).length;
  const allUnpaid = dues.filter((d) => !d.paid).length;
  const dueBadge = canSeeDues(user.role) ? allUnpaid : myUnpaid;
  const msgBadge = messages.filter(
    (m) => m.to === user.id && m.from !== user.id && !m.read && users.some((u) => u.id === m.from)
  ).length;

  type NavItem = {
    route: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    badge?: number;
    show?: boolean;
  };

  const navItems: NavItem[] = [
    { route: '(tabs)', label: settings.labelDashboard || 'Strona główna', icon: 'home-outline' },
    { route: 'news', label: settings.labelNews || 'Aktualności', icon: 'newspaper-outline' },
    { route: 'members', label: settings.labelMembers || 'Członkowie', icon: 'people-outline' },
    {
      route: 'dues',
      label: settings.labelDues || 'Skarbnik',
      icon: 'wallet-outline',
      badge: dueBadge || undefined,
      show: settings.modDues !== false && canSeeDues(user.role),
    },
    { route: 'ideas', label: settings.labelIdeas || 'Pomysły', icon: 'bulb-outline', show: settings.modIdeas !== false },
    { route: 'polls', label: settings.labelPolls || 'Ankiety', icon: 'bar-chart-outline', show: settings.modPolls !== false },
    { route: 'recipes', label: settings.labelRecipes || 'Przepisy', icon: 'book-outline', show: settings.modRecipes !== false },
    { route: 'events', label: settings.labelEvents || 'Kalendarz', icon: 'calendar-outline', show: settings.modEvents !== false },
    { route: 'gallery', label: settings.labelGallery || 'Galeria', icon: 'images-outline', show: settings.modGallery !== false },
    {
      route: 'finances',
      label: settings.labelFinances || 'Budżet',
      icon: 'cash-outline',
      show: settings.modFinances !== false && canSeeDues(user.role),
    },
    { route: 'documents', label: settings.labelDocuments || 'Dokumenty', icon: 'document-outline', show: settings.modDocuments !== false },
    {
      route: 'messages',
      label: settings.labelMessages || 'Wiadomości',
      icon: 'chatbubbles-outline',
      badge: msgBadge || undefined,
      show: settings.modMessages !== false,
    },
    { route: 'mailing', label: 'Mailing', icon: 'mail-outline', show: canManage(user.role) },
    { route: 'admin', label: 'Admin', icon: 'shield-outline', show: isAdmin(user.role) },
    { route: 'settings', label: 'Ustawienia', icon: 'settings-outline', show: canManage(user.role) },
    { route: 'guide', label: 'Poradnik', icon: 'help-circle-outline' },
  ];

  const visibleItems = navItems.filter((item) => item.show !== false);

  return (
    <View style={[styles.drawerContainer, { backgroundColor: theme.side1 }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        {/* User header */}
        <View style={styles.drawerHeader}>
          {settings.orgLogoUrl ? (
            <Image source={{ uri: settings.orgLogoUrl }} style={styles.logo} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={styles.avatarText}>{ini(user.name)}</Text>
            </View>
          )}
          <Text style={[styles.userName, { color: theme.textSide }]}>{user.name}</Text>
          <Text style={[styles.orgName, { color: theme.textSide, opacity: 0.7 }]}>
            {settings.orgName || 'Aplikacja Koła'}
          </Text>
        </View>

        {/* Navigation items */}
        {visibleItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => {
              router.push(`/(app)/${item.route}` as any);
              props.navigation.closeDrawer();
            }}
          >
            <Ionicons name={item.icon} size={20} color={theme.textSide || '#fff'} />
            <Text style={[styles.navLabel, { color: theme.textSide || '#fff' }]}>
              {item.label}
            </Text>
            {item.badge ? (
              <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </DrawerContentScrollView>

      {/* Logout button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await logout();
        }}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.textSide || '#fff'} />
        <Text style={[styles.navLabel, { color: theme.textSide || '#fff' }]}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerType: 'front' }}
    >
      <Drawer.Screen name="(tabs)" />
      <Drawer.Screen name="news" />
      <Drawer.Screen name="members" />
      <Drawer.Screen name="dues" />
      <Drawer.Screen name="ideas" />
      <Drawer.Screen name="polls" />
      <Drawer.Screen name="recipes" />
      <Drawer.Screen name="events" />
      <Drawer.Screen name="gallery" />
      <Drawer.Screen name="finances" />
      <Drawer.Screen name="documents" />
      <Drawer.Screen name="messages" />
      <Drawer.Screen name="mailing" />
      <Drawer.Screen name="admin" />
      <Drawer.Screen name="settings" />
      <Drawer.Screen name="guide" />
      <Drawer.Screen name="tactics-board" />
      <Drawer.Screen name="rankings" />
      <Drawer.Screen name="match-history" />
      <Drawer.Screen name="profile" />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1 },
  drawerScroll: { paddingTop: 0 },
  drawerHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  logo: { width: 54, height: 54, borderRadius: 27, marginBottom: 8 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: { color: '#1a1a1a', fontSize: 18, fontWeight: '700' },
  userName: { fontSize: 16, fontWeight: '600' },
  orgName: { fontSize: 13, marginTop: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 18,
    gap: 12,
  },
  navLabel: { fontSize: 15, flex: 1 },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#1a1a1a', fontSize: 12, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
});
