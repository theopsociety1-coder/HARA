import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'

interface TabBarProps {
  activeTab: string
  onTabPress: (tab: string) => void
}

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? '#FFFFFF' : '#888888'
  return (
    <View style={styles.iconContainer}>
      <View style={styles.iconWrapper}>
        <View style={[styles.houseRoof, { borderBottomColor: color }]} />
        <View style={[styles.houseBody, { borderColor: color }]} />
      </View>
    </View>
  )
}

function MapIcon({ active }: { active: boolean }) {
  const color = active ? '#FFFFFF' : '#888888'
  return (
    <View style={styles.iconContainer}>
      <View style={styles.iconWrapper}>
        <View style={[styles.pinOuter, { borderColor: color }]}>
          <View style={[styles.pinDot, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  )
}

function CameraIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.iconWrapper}>
        <View style={[styles.cameraOuter, { borderColor: '#FFFFFF' }]} />
        <View style={[styles.cameraInner, { borderColor: '#FFFFFF' }]} />
      </View>
    </View>
  )
}

function BellIcon({ active }: { active: boolean }) {
  const color = active ? '#FFFFFF' : '#888888'
  return (
    <View style={styles.iconContainer}>
      <View style={styles.iconWrapper}>
        <View style={[styles.bellOuter, { borderColor: color }]} />
      </View>
    </View>
  )
}

function UserIcon({ active }: { active: boolean }) {
  const color = active ? '#FFFFFF' : '#888888'
  return (
    <View style={styles.iconContainer}>
      <View style={styles.iconWrapper}>
        <View style={[styles.userHead, { borderColor: color }]} />
        <View style={[styles.userBody, { borderColor: color }]} />
      </View>
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
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: 'rgba(22, 20, 18, 0.95)',
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeTab: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.muted,
    marginTop: 6,
  },
  activeLabel: {
    color: '#FFFFFF',
  },
  
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // House
  houseRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: 0,
  },
  houseBody: {
    width: 16,
    height: 12,
    borderWidth: 2.5,
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 2,
    borderRadius: 2,
  },
  
  // Map Pin
  pinOuter: {
    width: 14,
    height: 20,
    borderWidth: 2.5,
    borderRadius: 7,
    position: 'relative',
  },
  pinDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    top: 7,
    left: 3,
  },
  
  // Camera - circle outline
  cameraOuter: {
    width: 22,
    height: 22,
    borderWidth: 2.5,
    borderRadius: 11,
    position: 'relative',
  },
  cameraInner: {
    width: 8,
    height: 8,
    borderWidth: 2,
    borderRadius: 4,
    position: 'absolute',
  },
  
  // Bell
  bellOuter: {
    width: 14,
    height: 18,
    borderWidth: 2.5,
    borderRadius: 7,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    position: 'relative',
  },
  
  // User
  userHead: {
    width: 12,
    height: 12,
    borderWidth: 2.5,
    borderRadius: 6,
    position: 'absolute',
    top: 2,
  },
  userBody: {
    width: 18,
    height: 10,
    borderWidth: 2.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    position: 'absolute',
    bottom: 1,
  },
  
  cameraButtonWrapper: {
    marginTop: -10,
  },
})
