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
      <View style={[styles.homeRoof, { borderBottomColor: color }]} />
      <View style={[styles.homeBody, { borderColor: color }]} />
    </View>
  )
}

function MapIcon({ active }: { active: boolean }) {
  const color = active ? theme.cream : theme.muted
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.mapPin, { borderColor: color }]}>
        <View style={[styles.mapPinDot, { backgroundColor: color }]} />
      </View>
    </View>
  )
}

function CameraIcon() {
  return (
    <View style={styles.cameraContainer}>
      <View style={styles.cameraCircle}>
        <View style={styles.cameraPlus} />
        <View style={[styles.cameraPlus, styles.cameraPlusVert]} />
      </View>
    </View>
  )
}

function BellIcon({ active }: { active: boolean }) {
  const color = active ? theme.cream : theme.muted
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.bellBody, { borderColor: color }]} />
      <View style={[styles.bellTop, { borderColor: color }]} />
      <View style={[styles.bellClapper, { backgroundColor: color }]} />
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
  
  // Home - Minimalist house outline
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
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
  
  // Map - Minimalist pin outline
  mapPin: {
    width: 16,
    height: 20,
    borderWidth: 2,
    borderRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'relative',
  },
  mapPinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 5,
    left: 3,
  },
  
  // Camera - Circle with plus outline
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonWrapper: {
    marginTop: -8,
  },
  cameraCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.cream,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cameraPlus: {
    width: 18,
    height: 2,
    backgroundColor: theme.cream,
    position: 'absolute',
  },
  cameraPlusVert: {
    transform: [{ rotate: '90deg' }],
  },
  
  // Bell - Minimalist outline
  bellBody: {
    width: 14,
    height: 16,
    borderWidth: 2,
    borderRadius: 7,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    position: 'absolute',
    bottom: 2,
  },
  bellTop: {
    width: 8,
    height: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    top: 2,
    left: 6,
  },
  bellClapper: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  
  // User - Minimalist outline
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
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    position: 'absolute',
    bottom: 2,
  },
})
