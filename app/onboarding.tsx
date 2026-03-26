import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { theme } from '@/constants/theme'

const { width } = Dimensions.get('window')

interface Slide {
  emoji: string
  kanji: string
  title: string
  subtitle: string
  desc: string
  color: string
}

const slides: Slide[] = [
  {
    emoji: '📸',
    kanji: '今',
    title: 'Capture this moment',
    subtitle: '지금 먹는 걸 공유해 • Share right now',
    desc: 'HARA randomly notifies you to capture your meal — front and back camera, unfiltered, real.',
    color: '#E8452C',
  },
  {
    emoji: '⭐',
    kanji: '味',
    title: 'Rate every bite',
    subtitle: '맛있는 걸 기록해 • Build your flavor memory',
    desc: 'Score dishes, save restaurants, and build a personal taste map across Japan & Korea.',
    color: '#D4A853',
  },
  {
    emoji: '🗺️',
    kanji: '地',
    title: 'Find food around you',
    subtitle: '내 주변 맛집 찾기 • Discover nearby spots',
    desc: 'See HARA ratings live on a map. Filter by cuisine, city, and spots your friends already love.',
    color: '#4A9E6B',
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentSlide = slides[currentIndex]

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      router.replace('/(auth)/sign-in')
    }
  }

  const handleSkip = () => {
    router.replace('/(auth)/sign-in')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <View style={[styles.emojiBackground, { backgroundColor: `${currentSlide.color}22` }]}>
            <Text style={[styles.kanjiBackground, { color: currentSlide.color }]}>
              {currentSlide.kanji}
            </Text>
          </View>
          <Text style={styles.emoji}>{currentSlide.emoji}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.subtitle, { color: currentSlide.color }]}>
            {currentSlide.subtitle}
          </Text>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.desc}</Text>
        </View>

        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.paginationDot,
                i === currentIndex && styles.paginationDotActive,
                i === currentIndex && { backgroundColor: currentSlide.color },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: currentSlide.color }]}
          onPress={handleNext}
        >
          <Text style={styles.primaryButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emojiContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kanjiBackground: {
    fontSize: 120,
    fontWeight: '800',
    opacity: 0.15,
    position: 'absolute',
    lineHeight: 1,
  },
  emoji: {
    fontSize: 72,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 0.04,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.cream,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: theme.textSub,
    lineHeight: 1.7,
    textAlign: 'center',
    maxWidth: 280,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.border,
  },
  paginationDotActive: {
    width: 24,
  },
  buttons: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.cream,
    fontSize: 15,
    fontWeight: '600',
  },
  skipButton: {
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  skipButtonText: {
    color: theme.textSub,
    fontSize: 15,
    fontWeight: '500',
  },
})
