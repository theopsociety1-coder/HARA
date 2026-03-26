import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { theme } from '@/constants/theme'

const cities = [
  { name: 'Tokyo', label: 'Tokyo 東京' },
  { name: 'Seoul', label: 'Seoul 서울' },
  { name: 'Osaka', label: 'Osaka 大阪' },
  { name: 'Busan', label: 'Busan 부산' },
  { name: 'Kyoto', label: 'Kyoto 京都' },
]

export default function SignUpScreen() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)

  const steps = ['Create Account', 'Pick your city', 'Follow friends']

  const handleNext = async () => {
    if (step === 0) {
      if (!name || !username || !email || !password) {
        Alert.alert('Error', 'Please fill in all fields')
        return
      }
      setStep(1)
    } else if (step === 1) {
      if (!city) {
        Alert.alert('Error', 'Please select a city')
        return
      }
      setStep(2)
    } else {
      router.replace('/(tabs)')
    }
  }

  const handleSignUp = async () => {
    try {
      setLoading(true)
      await signUp(email, password, username, city)
      Alert.alert('Success', 'Account created! Please check your email to verify.')
      router.replace('/(tabs)')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const suggestedUsers = [
    { username: 'yuji_tokyo', city: 'Tokyo' },
    { username: 'seoulmunchies', city: 'Seoul' },
    { username: 'ramen.records', city: 'Osaka' },
    { username: 'kimchi.diary', city: 'Busan' },
  ]

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={theme.muted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="@username"
              placeholderTextColor={theme.muted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        )
      case 1:
        return (
          <View style={styles.cityGrid}>
            {cities.map((c) => (
              <TouchableOpacity
                key={c.name}
                style={[
                  styles.cityButton,
                  city === c.name && styles.cityButtonActive,
                ]}
                onPress={() => setCity(c.name)}
              >
                <Text
                  style={[
                    styles.cityButtonText,
                    city === c.name && styles.cityButtonTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )
      case 2:
        return (
          <View style={styles.suggestedList}>
            {suggestedUsers.map((user, index) => (
              <View key={index} style={styles.suggestedUser}>
                <View style={styles.suggestedAvatar}>
                  <Text style={styles.suggestedEmoji}>
                    {user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.suggestedInfo}>
                  <Text style={styles.suggestedUsername}>@{user.username}</Text>
                  <Text style={styles.suggestedCity}>{user.city}</Text>
                </View>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progress}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= step && styles.progressDotActive]}
            />
          ))}
        </View>

        <View style={styles.header}>
          <Text style={styles.stepLabel}>Step {step + 1} of 3</Text>
          <Text style={styles.title}>{steps[step]}</Text>
        </View>

        {renderStep()}

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={step === 2 ? handleSignUp : handleNext}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : step === 2 ? 'Enter HARA →' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 28,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 32,
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.border,
  },
  progressDotActive: {
    backgroundColor: theme.accent,
  },
  header: {
    marginBottom: 24,
  },
  stepLabel: {
    fontSize: 11,
    color: theme.accent,
    letterSpacing: 0.12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.cream,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
    color: theme.text,
    fontSize: 16,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cityButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  cityButtonActive: {
    borderColor: theme.accent,
    backgroundColor: 'rgba(232, 69, 44, 0.12)',
  },
  cityButtonText: {
    color: theme.textSub,
    fontSize: 14,
  },
  cityButtonTextActive: {
    color: theme.accentSoft,
  },
  suggestedList: {
    gap: 12,
  },
  suggestedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  suggestedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedEmoji: {
    fontSize: 18,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedUsername: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 14,
  },
  suggestedCity: {
    color: theme.muted,
    fontSize: 12,
  },
  followButton: {
    backgroundColor: theme.accent,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followButtonText: {
    color: theme.cream,
    fontSize: 12,
    fontWeight: '600',
  },
  buttons: {
    marginTop: 32,
  },
  button: {
    backgroundColor: theme.accent,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.cream,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: theme.textSub,
  },
  footerLink: {
    color: theme.accent,
    fontWeight: '600',
  },
})
