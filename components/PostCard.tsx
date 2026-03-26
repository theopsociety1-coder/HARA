import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native'
import { useState, useRef } from 'react'
import { theme } from '@/constants/theme'

interface PostCardProps {
  user: string
  username: string
  time: string
  restaurant: string
  dish: string
  rating: number
  location: string
  likes: number
  comments: number
  imageUrl?: string
  frontImageUrl?: string
  avatarIndex?: number
  isLiked?: boolean
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onRestaurantPress?: () => void
}

const avatarColors = [
  'linear-gradient(135deg,#8B3A0F,#E8892D)',
  'linear-gradient(135deg,#1A3A2A,#4A9E6B)',
  'linear-gradient(135deg,#4A1828,#C45A6A)',
  'linear-gradient(135deg,#2A2A4A,#5A6AC4)',
  'linear-gradient(135deg,#3A2A0A,#C4962D)',
  'linear-gradient(135deg,#0A2A3A,#2D9EC4)',
]

const dishEmojis = ['🍜', '🍱', '🍣', '🍙', '🥘', '🍲', '🍛', '🍤', '🥢']

export function PostCard({
  user,
  username,
  time,
  restaurant,
  dish,
  rating,
  location,
  likes,
  comments,
  imageUrl,
  frontImageUrl,
  avatarIndex = 0,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  onRestaurantPress,
}: PostCardProps) {
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)
  const lastTapRef = useRef<number>(0)
  
  const avatarColor = avatarColors[avatarIndex % avatarColors.length]
  const dishEmoji = dishEmojis[avatarIndex % dishEmojis.length]
  
  const handleImagePress = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!isLiked) {
        onLike?.()
        setShowLikeAnimation(true)
        setTimeout(() => setShowLikeAnimation(false), 800)
      }
      lastTapRef.current = 0
    } else {
      // First tap - wait for potential second tap
      lastTapRef.current = now
      setTimeout(() => {
        if (lastTapRef.current !== 0 && Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          // Single tap after timeout - could open detail view
          lastTapRef.current = 0
        }
      }, DOUBLE_TAP_DELAY + 50)
    }
  }

  const renderStars = () => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text 
            key={star} 
            style={[
              styles.star, 
              star <= rating ? styles.starFilled : styles.starEmpty
            ]}
          >
            ⭐
          </Text>
        ))}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarEmoji}>
            {user.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.location}>{location} · {time}</Text>
        </View>
        <View style={styles.haraTag}>
          <Text style={styles.haraTagText}>HARA'd</Text>
        </View>
      </View>

      {/* Image - BeReal Style with Double-Tap to Like */}
      <TouchableOpacity 
        style={styles.imageContainer}
        activeOpacity={0.95}
        onPress={handleImagePress}
        onLongPress={() => {
          // Long press shows detail
          onComment?.()
        }}
        delayLongPress={500}
      >
        {/* Main Food Image */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.dishImageReal} resizeMode="cover" />
        ) : (
          <View style={[styles.dishImage, { backgroundColor: avatarColor }]}>
            <Text style={styles.dishEmoji}>{dishEmoji}</Text>
          </View>
        )}
        
        {/* Like Animation Overlay */}
        {showLikeAnimation && (
          <View style={styles.likeAnimationContainer}>
            <Text style={styles.likeAnimationHeart}>♥</Text>
          </View>
        )}
        
        {/* Selfie Overlay - BeReal Style (Top Left) */}
        <View style={styles.selfieBadge}>
          {frontImageUrl ? (
            <Image source={{ uri: frontImageUrl }} style={styles.selfieImageReal} resizeMode="cover" />
          ) : (
            <Text style={styles.selfieEmoji}>●</Text>
          )}
        </View>
        
        {/* Rating Badge (Bottom Right) */}
        <View style={styles.ratingBadge}>
          {renderStars()}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.dish}>{dish}</Text>
          <Text style={styles.dot}>·</Text>
          <TouchableOpacity onPress={onRestaurantPress}>
            <Text style={styles.restaurant}>{restaurant} →</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <Text style={[styles.actionIcon, isLiked && styles.likedIcon]}>
              {isLiked ? '♥' : '♡'}
            </Text>
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {likes + (isLiked ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onComment}>
            <Text style={styles.actionIcon}>○</Text>
            <Text style={styles.actionText}>{comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Text style={styles.actionIcon}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
    color: theme.cream,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 14,
  },
  location: {
    color: theme.muted,
    fontSize: 11,
  },
  haraTag: {
    backgroundColor: 'rgba(212, 168, 83, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  haraTagText: {
    color: theme.gold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.04,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
  },
  dishImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishImageReal: {
    width: '100%',
    height: '100%',
  },
  dishEmoji: {
    fontSize: 80,
  },
  selfieBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#2A2020',
    borderWidth: 3,
    borderColor: theme.cream,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selfieImageReal: {
    width: '100%',
    height: '100%',
  },
  selfieEmoji: {
    fontSize: 32,
  },
  likeAnimationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeAnimationHeart: {
    fontSize: 80,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 12,
  },
  starFilled: {
    opacity: 1,
  },
  starEmpty: {
    opacity: 0.3,
  },
  content: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  dish: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 14,
  },
  dot: {
    color: theme.border,
    marginHorizontal: 8,
  },
  restaurant: {
    color: theme.accentSoft,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 16,
  },
  likedIcon: {
    color: theme.accent,
  },
  actionText: {
    color: theme.muted,
    fontSize: 13,
  },
  likedText: {
    color: theme.accent,
  },
})
