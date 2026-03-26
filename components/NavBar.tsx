import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'

interface TabBarProps {
  activeTab: string
  onTabPress: (tab: string) => void
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.homeLine, styles.homeRoof, { borderBottomColor: active ? theme.cream : theme.muted }]} />
      <View style={[styles.homeLine, styles.homeBase, { borderColor: active ? theme.cream : theme.muted }]} />
    </View>
  )
}

function MapIcon({ active }: { active: boolean }) {
  const color = active ? theme.cream : theme.muted
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.mapPinOuter, { borderColor: color }]}>
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
      </View>
    </View>
  )
}

function HeartIcon({ active }: { active: boolean }) {
  const color = active ? theme.cream : theme.muted
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.heartShape, { borderColor: color }]}>
        <View style={[styles.heartDimple, { borderBottomColor: color }]} />
      </View>
    </View>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? theme.cream : theme.muted
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.profileCircle, { borderColor: color }]} />
      <View style={[styles.profileShoulders, { borderColor: color }]} />
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
    if (tab.key === 'alerts') return <HeartIcon active={activeTab === tab.key} />
    if (tab.key === 'profile') return <ProfileIcon active={activeTab === tab.key} />
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
  homeLine: {
    position: 'absolute',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    top: 2,
  },
  homeBase: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    bottom: 2,
  },
  
  // Map - Minimalist pin
  mapPinOuter: {
    width: 18,
    height: 20,
    borderWidth: 2,
    borderRadius: 9,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    position: 'relative',
  },
  mapPinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 5,
    left: 4,
  },
  
  // Camera - Instagram Plus style
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
    backgroundColor: theme.cream,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.bg,
  },
  cameraPlus: {
    width: 20,
    height: 2,
    backgroundColor: theme.bg,
    position: 'absolute',
  },
  cameraPlusVertical: {
    width: 2,
    height: 20,
    backgroundColor: theme.bg,
    position: 'absolute',
  },
  
  // Heart - Minimalist outline
  heartShape: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  heartDimple: {
    position: 'absolute',
    bottom: 4,
    left: 3,
    width: 14,
    height: 14,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  
  // Profile - Minimalist user
  profileCircle: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 6,
    position: 'absolute',
    top: 2,
  },
  profileShoulders: {
    width: 20,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    position: 'absolute',
    bottom: 2,
  },
})
