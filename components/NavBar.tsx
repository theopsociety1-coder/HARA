import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'

interface TabBarProps {
  activeTab: string
  onTabPress: (tab: string) => void
}

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? theme.cream : theme.muted
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.iconOuter, { borderColor: color }]} />
      <View style={[styles.homeRoof, { borderBottomColor: color, borderLeftColor: 'transparent', borderRightColor: 'transparent' }]} />
      <View style={[styles.homeBody, { borderColor: color }]} />
    </View>
  )
}

function MapIcon({ active }: { active: boolean }) {
  const color = active ? theme.cream : theme.muted
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.mapPin, { borderColor: color }]} />
      <View style={[styles.mapPinDot, { borderColor: color }]} />
    </View>
  )
}

function CameraIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.cameraOuter, { borderColor: theme.cream }]} />
      <View style={[styles.cameraDot, { borderColor: theme.cream }]} />
    </View>
  )
}

function BellIcon({ active }: { active: boolean }) {
  const color = active ? theme.cream : theme.muted
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.bellBody, { borderColor: color }]} />
      <View style={[styles.bellTop, { borderColor: color }]} />
    </View>
  )
}

function UserIcon({ active }: { active: boolean }) {
  const color = active ? theme.cream : theme.muted
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.userHead, { borderColor: color }]} />
      <View style={[styles.userBody, { borderColor: color }]} />
    </View>
  )
}

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  const tabs = [
    { key: 'feed', label: 'Home' },
    { key: 'map', label: 'Search' },
    { key: 'camera', label: '', isCamera: true },
    { key: 'alerts', label: 'Notifications' },
    { key: 'profile', label: 'Profile' },
  ]

  const renderIcon = (tab: typeof tabs[0]) => {
    if (tab.key === 'camera') return <CameraIcon />
    if (tab.key === 'feed') return <HomeIcon active={activeTab === tab.key} />
    if (tab.key === 'map') return <MapIcon active={activeTab === tab.key} />
    if (tab.key === 'alerts') return <BellIcon active={activeTab === tab.key} />
    if (tab.key === 'profile') return <UserIcon active={activeTab === tab.key} />
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.navItem,
              tab.isCamera && styles.cameraButtonWrapper,
              activeTab === tab.key && !tab.isCamera && styles.activeTab
            ]}
            onPress={() => onTabPress(tab.key)}
          >
            {renderIcon(tab)}
            {!tab.isCamera && (
              <Text style={[
                styles.label,
                activeTab === tab.key && styles.activeLabel
              ]}>
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: 'rgba(22, 20, 18, 0.95)',
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.muted,
    letterSpacing: 0.04,
    marginTop: 4,
  },
  activeLabel: {
    color: theme.cream,
  },
  
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOuter: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 11,
    position: 'absolute',
  },
  
  // Home - House outline
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: 2,
  },
  homeBody: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 2,
  },
  
  // Map - Pin outline
  mapPin: {
    width: 16,
    height: 18,
    borderWidth: 2,
    borderRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'absolute',
  },
  mapPinDot: {
    width: 4,
    height: 4,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    top: 7,
    left: 4,
  },
  
  // Camera - Circle outline with dot
  cameraOuter: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 11,
    position: 'absolute',
  },
  cameraDot: {
    width: 6,
    height: 6,
    borderWidth: 2,
    borderRadius: 3,
    position: 'absolute',
  },
  
  // Bell - Outline
  bellBody: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderRadius: 7,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    position: 'absolute',
    bottom: 2,
  },
  bellTop: {
    width: 8,
    height: 6,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    top: 4,
    left: 6,
  },
  
  // User - Outline
  userHead: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 6,
    position: 'absolute',
    top: 2,
  },
  userBody: {
    width: 18,
    height: 8,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    position: 'absolute',
    bottom: 2,
  },
  
  // Camera button wrapper
  cameraButtonWrapper: {
    marginTop: -8,
  },
})
