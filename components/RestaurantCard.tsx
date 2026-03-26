import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'

interface RestaurantCardProps {
  name: string
  type: string
  rating: number
  distance: string
  price: string
  isOpen: boolean
  friendCount: number
  tags: string[]
  onPress?: () => void
}

const getRatingColor = (rating: number) => {
  if (rating >= 4.7) return theme.accent
  if (rating >= 4.3) return theme.gold
  if (rating >= 3.8) return theme.green
  return theme.muted
}

const getRatingLabel = (rating: number) => {
  if (rating >= 4.7) return '🔥 Must try'
  if (rating >= 4.3) return '⭐ Highly rated'
  return '👍 Good pick'
}

export function RestaurantCard({
  name,
  type,
  rating,
  distance,
  price,
  isOpen,
  friendCount,
  tags,
  onPress,
}: RestaurantCardProps) {
  const ratingColor = getRatingColor(rating)

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Text style={styles.emoji}>
          {type.includes('Ramen') ? '🍜' :
           type.includes('Sushi') ? '🍣' :
           type.includes('Korean') ? '🥘' :
           type.includes('Udon') ? '🍱' :
           type.includes('Café') ? '☕' : '🍽️'}
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.meta}>{type} · {distance} · {price}</Text>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: ratingColor }]}>
            <Text style={styles.ratingText}>★ {rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <Text style={[
              styles.status,
              { color: isOpen ? theme.green : theme.muted }
            ]}>
              {isOpen ? '● Open now' : '○ Closed'}
            </Text>
            {friendCount > 0 && (
              <Text style={styles.friends}>👥 {friendCount}</Text>
            )}
          </View>
          <Text style={styles.tags} numberOfLines={1}>
            {tags[0]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  imageContainer: {
    width: 86,
    height: 86,
    backgroundColor: '#2A2020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 34,
  },
  content: {
    flex: 1,
    padding: 11,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    color: theme.cream,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 3,
  },
  meta: {
    color: theme.muted,
    fontSize: 11,
  },
  ratingBadge: {
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  ratingText: {
    color: theme.cream,
    fontWeight: '800',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
  },
  friends: {
    color: theme.green,
    fontSize: 11,
    fontWeight: '600',
  },
  tags: {
    color: theme.gold,
    fontSize: 11,
  },
})
