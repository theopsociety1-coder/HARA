import { View, Text, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { theme } from '@/constants/theme'

export default function SplashScreen() {
  const router = useRouter()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(1400),
    ]).start(() => {
      router.replace('/onboarding')
    })
  }, [fadeAnim, router])

  return (
    <View style={styles.container}>
      <View style={styles.gradient} />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.logoKanji}>腹</Text>
        <Text style={styles.logoText}>HARA</Text>
        <Text style={styles.tagline}>食の瞬間を共有する</Text>
      </Animated.View>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === 0 && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(232, 69, 44, 0.15)',
  },
  content: {
    alignItems: 'center',
  },
  logoKanji: {
    fontSize: 72,
    fontWeight: '800',
    color: theme.cream,
    lineHeight: 1,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.accent,
    letterSpacing: 16,
  },
  tagline: {
    marginTop: 12,
    color: theme.muted,
    fontSize: 13,
    letterSpacing: 0.12,
  },
  dots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.border,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.accent,
  },
})
