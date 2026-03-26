import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'

const mockNotifications = [
  { id: 1, type: 'like', user: 'yuji_ramen', message: 'liked your post', time: '2m ago', avatarIndex: 0 },
  { id: 2, type: 'follow', user: 'seoulmunchies', message: 'started following you', time: '15m ago', avatarIndex: 1 },
  { id: 3, type: 'comment', user: 'osaka.eats', message: 'commented: "Looks amazing! 😍"', time: '1h ago', avatarIndex: 2 },
  { id: 4, type: 'like', user: 'ramen.king', message: 'liked your post', time: '2h ago', avatarIndex: 3 },
  { id: 5, type: 'mention', user: 'tokyo.foodie', message: 'mentioned you in a post', time: '3h ago', avatarIndex: 4 },
  { id: 6, type: 'follow', user: 'korean.eats', message: 'started following you', time: '5h ago', avatarIndex: 5 },
]

const avatarColors = [
  'linear-gradient(135deg,#8B3A0F,#E8892D)',
  'linear-gradient(135deg,#1A3A2A,#4A9E6B)',
  'linear-gradient(135deg,#4A1828,#C45A6A)',
  'linear-gradient(135deg,#2A2A4A,#5A6AC4)',
  'linear-gradient(135deg,#3A2A0A,#C4962D)',
  'linear-gradient(135deg,#0A2A3A,#2D9EC4)',
]

export default function NotificationsScreen() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️'
      case 'follow': return '👤'
      case 'comment': return '💬'
      case 'mention': return '@'
      default: return '🔔'
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {mockNotifications.map((notif, index) => (
          <View key={notif.id} style={styles.notificationItem}>
            <View style={[
              styles.avatar,
              { backgroundColor: avatarColors[notif.avatarIndex % avatarColors.length] }
            ]}>
              <Text style={styles.avatarText}>
                {notif.user.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.text}>
                <Text style={styles.username}>@{notif.user}</Text>
                {' '}{notif.message}
              </Text>
              <Text style={styles.time}>{notif.time}</Text>
            </View>
            <View style={styles.iconContainer}>
              {notif.type === 'like' && <Text style={styles.icon}>❤️</Text>}
              {notif.type === 'follow' && <View style={styles.followIcon}><Text style={styles.followIconText}>+</Text></View>}
              {notif.type === 'comment' && <Text style={styles.icon}>💬</Text>}
              {notif.type === 'mention' && <Text style={styles.icon}>@</Text>}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.cream,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: theme.cream,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  text: {
    color: theme.textSub,
    fontSize: 14,
    lineHeight: 20,
  },
  username: {
    color: theme.text,
    fontWeight: '600',
  },
  time: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  followIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followIconText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
})
