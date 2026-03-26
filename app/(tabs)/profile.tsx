import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Modal } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { theme } from '@/constants/theme'

const { width, height } = Dimensions.get('window')

type ProfileTab = 'posts' | 'memories' | 'want'

const mockPosts = [
  { id: 1, emoji: '🍜', rating: 5, restaurant: 'Ichiran', time: '2d ago', image: null },
  { id: 2, emoji: '🍣', rating: 4, restaurant: 'Sushi Saito', time: '5d ago', image: null },
  { id: 3, emoji: '🥘', rating: 5, restaurant: 'Gwangjang', time: '1w ago', image: null },
  { id: 4, emoji: '🍱', rating: 4, restaurant: 'Hanamaru', time: '2w ago', image: null },
  { id: 5, emoji: '☕', rating: 5, restaurant: 'Blue Bottle', time: '3w ago', image: null },
  { id: 6, emoji: '🍜', rating: 5, restaurant: 'Afuri', time: '1mo ago', image: null },
]

const mockWantList = [
  { id: 1, emoji: '🍣', restaurant: 'Sukiyabashi Jiro', cuisine: 'Sushi', location: 'Ginza, Tokyo', priority: 'high' },
  { id: 2, emoji: '🍜', restaurant: 'Ichiran Shibuya', cuisine: 'Ramen', location: 'Shibuya, Tokyo', priority: 'medium' },
  { id: 3, emoji: '🥐', restaurant: 'Gontran Cherrier', cuisine: 'Bakery', location: 'Harajuku, Tokyo', priority: 'medium' },
  { id: 4, emoji: '🍺', restaurant: 'Golden Gai', cuisine: 'Izakaya', location: 'Shinjuku, Tokyo', priority: 'low' },
]

const memoriesData = [
  { date: '2026-03-15', emoji: '🍜', restaurant: 'Ichiran' },
  { date: '2026-03-10', emoji: '🍣', restaurant: 'Sushi Saito' },
  { date: '2026-03-05', emoji: '🥘', restaurant: 'Gwangjang' },
  { date: '2026-02-28', emoji: '🍱', restaurant: 'Hanamaru' },
  { date: '2026-02-20', emoji: '☕', restaurant: 'Blue Bottle' },
  { date: '2026-02-14', emoji: '🍜', restaurant: 'Afuri' },
  { date: '2026-02-10', emoji: '🥐', restaurant: 'Le Pain Quotidien' },
  { date: '2026-02-05', emoji: '🍺', restaurant: 'Golden Gai' },
]

export default function ProfileScreen() {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date(2026, 2, 1)) // March 2026

  const stats = [
    { value: mockPosts.length.toString(), label: 'Posts' },
    { value: '2.4K', label: 'Followers' },
    { value: '892', label: 'Following' },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.accent
      case 'medium': return theme.gold
      case 'low': return theme.muted
      default: return theme.muted
    }
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatar}>
              <Text style={styles.editAvatarText}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.displayName}>
            {profile?.display_name || profile?.username || 'User'}
          </Text>
          <Text style={styles.username}>@{profile?.username || 'username'}</Text>
          <Text style={styles.city}>📍 {profile?.city || 'Tokyo'}</Text>

          {/* Stats */}
          <View style={styles.stats}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'memories' && styles.tabActive]}
            onPress={() => {
              setActiveTab('memories')
              setShowCalendar(true)
            }}
          >
            <Text style={[styles.tabText, activeTab === 'memories' && styles.tabTextActive]}>
              Memories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'want' && styles.tabActive]}
            onPress={() => setActiveTab('want')}
          >
            <Text style={[styles.tabText, activeTab === 'want' && styles.tabTextActive]}>
              Want to Try
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <View style={styles.postsGrid}>
            {mockPosts.map((post) => (
              <View key={post.id} style={styles.postItem}>
                <View style={[
                  styles.postImage,
                  { backgroundColor: post.rating >= 5 ? theme.accent : theme.gold }
                ]}>
                  <Text style={styles.postEmoji}>{post.emoji}</Text>
                </View>
                <View style={styles.postOverlay}>
                  <Text style={styles.postRating}>★ {post.rating}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'want' && (
          <View style={styles.wantList}>
            {mockWantList.map((item) => (
              <View key={item.id} style={styles.wantItem}>
                <View style={[styles.wantEmoji, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.wantItemEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.wantInfo}>
                  <Text style={styles.wantRestaurant}>{item.restaurant}</Text>
                  <Text style={styles.wantCuisine}>{item.cuisine} · {item.location}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addWantButton}>
              <Text style={styles.addWantText}>+ Add to Want List</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'memories' && (
          <View style={styles.memoriesSection}>
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={styles.calendarButtonText}>📅 View Calendar</Text>
            </TouchableOpacity>
            
            <Text style={styles.memoriesTitle}>Recent Memories</Text>
            {memoriesData.slice(0, 6).map((memory, index) => (
              <View key={index} style={styles.memoryItem}>
                <View style={styles.memoryDate}>
                  <Text style={styles.memoryDay}>{new Date(memory.date).getDate()}</Text>
                  <Text style={styles.memoryMonth}>
                    {new Date(memory.date).toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </View>
                <View style={[styles.memoryImage, { backgroundColor: theme.accent }]}>
                  <Text style={styles.memoryEmoji}>{memory.emoji}</Text>
                </View>
                <View style={styles.memoryInfo}>
                  <Text style={styles.memoryRestaurant}>{memory.restaurant}</Text>
                  <Text style={styles.memoryTimeText}>{memory.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Memories</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={styles.calendarClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarNav}>
              <TouchableOpacity onPress={() => {
                const newDate = new Date(selectedMonth)
                newDate.setMonth(newDate.getMonth() - 1)
                setSelectedMonth(newDate)
              }}>
                <Text style={styles.calendarNavText}>← Prev</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthText}>{getMonthName(selectedMonth)}</Text>
              <TouchableOpacity onPress={() => {
                const newDate = new Date(selectedMonth)
                newDate.setMonth(newDate.getMonth() + 1)
                setSelectedMonth(newDate)
              }}>
                <Text style={styles.calendarNavText}>Next →</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarGrid}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <View key={i} style={styles.calendarDayHeader}>
                  <Text style={styles.calendarDayHeaderText}>{day}</Text>
                </View>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const currentDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1 - new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay())
                const dateStr = currentDate.toISOString().split('T')[0]
                const memory = memoriesData.find(m => m.date === dateStr)
                const isCurrentMonth = currentDate.getMonth() === selectedMonth.getMonth()
                
                return (
                  <View 
                    key={i} 
                    style={[
                      styles.calendarDay,
                      memory && styles.calendarDayHasMemory,
                      !isCurrentMonth && styles.calendarDayOtherMonth
                    ]}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      memory && styles.calendarDayTextActive,
                      !isCurrentMonth && styles.calendarDayTextOther
                    ]}>
                      {currentDate.getDate()}
                    </Text>
                    {memory && <Text style={styles.calendarEmoji}>{memory.emoji}</Text>}
                  </View>
                )
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.cream,
  },
  settingsIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    color: theme.cream,
    fontWeight: '700',
  },
  editAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarText: {
    fontSize: 14,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.cream,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: theme.textSub,
    marginBottom: 4,
  },
  city: {
    fontSize: 14,
    color: theme.muted,
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.cream,
  },
  statLabel: {
    fontSize: 12,
    color: theme.muted,
  },
  editButton: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  editButtonText: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.accent,
  },
  tabText: {
    color: theme.muted,
    fontWeight: '500',
    fontSize: 14,
  },
  tabTextActive: {
    color: theme.accent,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
  },
  postItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1,
  },
  postImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postEmoji: {
    fontSize: 36,
  },
  postOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  postRating: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  
  // Want List styles
  wantList: {
    padding: 16,
  },
  wantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  wantEmoji: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wantItemEmoji: {
    fontSize: 24,
  },
  wantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  wantRestaurant: {
    color: theme.cream,
    fontSize: 15,
    fontWeight: '600',
  },
  wantCuisine: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  addWantButton: {
    backgroundColor: theme.accent,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addWantText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Memories styles
  memoriesSection: {
    padding: 16,
  },
  calendarButton: {
    backgroundColor: theme.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarButtonText: {
    color: theme.cream,
    fontSize: 15,
    fontWeight: '600',
  },
  memoriesTitle: {
    color: theme.cream,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  memoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memoryDate: {
    width: 50,
    alignItems: 'center',
  },
  memoryDay: {
    color: theme.cream,
    fontSize: 20,
    fontWeight: '700',
  },
  memoryMonth: {
    color: theme.muted,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  memoryImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  memoryEmoji: {
    fontSize: 24,
  },
  memoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memoryRestaurant: {
    color: theme.cream,
    fontSize: 15,
    fontWeight: '600',
  },
  memoryTimeText: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 2,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  calendarModal: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    color: theme.cream,
    fontSize: 20,
    fontWeight: '700',
  },
  calendarClose: {
    color: theme.muted,
    fontSize: 20,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavText: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  calendarMonthText: {
    color: theme.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayHeader: {
    width: width / 7 - 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarDayHeaderText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  calendarDay: {
    width: width / 7 - 8,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarDayHasMemory: {
    backgroundColor: 'rgba(232, 69, 44, 0.2)',
    borderRadius: 8,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayText: {
    color: theme.textSub,
    fontSize: 14,
  },
  calendarDayTextActive: {
    color: theme.accent,
    fontWeight: '600',
  },
  calendarDayTextOther: {
    color: theme.muted,
  },
  calendarEmoji: {
    fontSize: 16,
    marginTop: 2,
  },
})
