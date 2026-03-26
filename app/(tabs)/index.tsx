import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Modal, Image, Dimensions, FlatList, ActivityIndicator, Alert } from 'react-native'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { PostCard } from '@/components/PostCard'
import { HaraLogo } from '@/components/HaraLogo'
import { theme } from '@/constants/theme'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useLocation } from '@/hooks/useLocation'
import { searchNearbyRestaurants, GooglePlace } from '@/lib/googlePlaces'

const { width, height } = Dimensions.get('window')

type FeedMode = 'discover' | 'friends' | 'friendsWant' | 'messages'

interface Post {
  id: number
  user: string
  username: string
  time: string
  restaurant: string
  dish: string
  rating: number
  location: string
  likes: number
  comments: number
  avatarIndex: number
  imageUrl?: string
  frontImageUrl?: string
  isPublic?: boolean
}

interface RestaurantPost extends GooglePlace {
  postTime?: string
  userRating?: number
  post?: any
  hasPublicPost?: boolean
}

interface Message {
  id: number
  friend: string
  friendUsername: string
  avatarIndex: number
  restaurant: string
  dish: string
  rating: number
  time: string
  message: string
  reactions: { emoji: string; count: number }[]
}

const mockPosts: Post[] = [
  {
    id: 1,
    user: 'yuji_ramen',
    username: 'yuji_ramen',
    time: '2m ago',
    restaurant: 'Ichiran 一蘭',
    dish: 'Tonkotsu Ramen 豚骨',
    rating: 5,
    location: 'Shinjuku, Tokyo',
    likes: 84,
    comments: 12,
    avatarIndex: 0,
    isPublic: true,
  },
  {
    id: 2,
    user: 'seoulmunchies',
    username: 'seoulmunchies',
    time: '18m ago',
    restaurant: 'Gwangjang Market 광장시장',
    dish: 'Bindaetteok 빈대떡',
    rating: 4,
    location: 'Jongno, Seoul',
    likes: 211,
    comments: 34,
    avatarIndex: 2,
    isPublic: true,
  },
  {
    id: 3,
    user: 'osaka.eats',
    username: 'osaka.eats',
    time: '1h ago',
    restaurant: 'Dotonbori Diner',
    dish: 'Takoyaki 蛸焼き',
    rating: 5,
    location: 'Dotonbori, Osaka',
    likes: 156,
    comments: 21,
    avatarIndex: 4,
    isPublic: false,
  },
]

interface Comment {
  id: number
  username: string
  text: string
  time: string
  avatarIndex: number
}

const mockComments: { [postId: number]: Comment[] } = {
  1: [
    { id: 1, username: 'foodie_japan', text: 'This looks amazing! Where is this?', time: '1m ago', avatarIndex: 1 },
    { id: 2, username: 'ramen_lover', text: 'Ichiran is the best!', time: '2m ago', avatarIndex: 3 },
    { id: 3, username: 'tokyo_eats', text: 'Want to go here tomorrow!', time: '5m ago', avatarIndex: 2 },
  ],
  2: [
    { id: 1, username: 'korean_food', text: 'Been there! So good', time: '5m ago', avatarIndex: 4 },
    { id: 2, username: 'seoul_traveler', text: 'Is it crowded on weekends?', time: '10m ago', avatarIndex: 5 },
  ],
  3: [
    { id: 1, username: 'osaka_visitor', text: 'Takoyaki on point! 🎯', time: '30m ago', avatarIndex: 1 },
  ],
}

const mockMessages: Message[] = [
  {
    id: 1,
    friend: 'Yuji',
    friendUsername: 'yuji_ramen',
    avatarIndex: 0,
    restaurant: 'Ichiran 一蘭',
    dish: 'Tonkotsu Ramen 豚骨',
    rating: 5,
    time: '2m ago',
    message: 'This ramen is amazing! You have to try it',
    reactions: [{ emoji: '♥', count: 3 }, { emoji: '•', count: 2 }],
  },
  {
    id: 2,
    friend: 'SeoulMunchies',
    friendUsername: 'seoulmunchies',
    avatarIndex: 2,
    restaurant: 'Gwangjang Market',
    dish: 'Bindaetteok',
    rating: 4,
    time: '18m ago',
    message: 'Best Korean pancake in Seoul!',
    reactions: [{ emoji: '♥', count: 5 }, { emoji: '•', count: 1 }],
  },
  {
    id: 3,
    friend: 'OsakaEats',
    friendUsername: 'osaka.eats',
    avatarIndex: 4,
    restaurant: 'Dotonbori Diner',
    dish: 'Takoyaki',
    rating: 5,
    time: '1h ago',
    message: 'Perfect takoyaki! Want to come here next time?',
    reactions: [{ emoji: '♥', count: 2 }, { emoji: '•', count: 4 }],
  },
  {
    id: 4,
    friend: 'TokyoNights',
    friendUsername: 'tokyo_nights',
    avatarIndex: 5,
    restaurant: 'Shibuya Yatai',
    dish: 'Yakitori',
    rating: 4,
    time: '3h ago',
    message: 'Great place for late night drinks and skewers!',
    reactions: [{ emoji: '♥', count: 1 }],
  },
]

// Custom minimalist icons for feed tabs
const DishIcon = ({ active }: { active: boolean }) => (
  <View style={styles.filterIcon}>
    <View style={[styles.dishBowl, { borderColor: active ? theme.cream : theme.muted }]} />
    <View style={[styles.dishLine, { backgroundColor: active ? theme.cream : theme.muted }]} />
  </View>
)

const UserIcon = ({ active }: { active: boolean }) => (
  <View style={styles.filterIcon}>
    <View style={[styles.userHead, { borderColor: active ? theme.cream : theme.muted }]} />
    <View style={[styles.userBody, { borderColor: active ? theme.cream : theme.muted }]} />
  </View>
)

const SpoonIcon = ({ active }: { active: boolean }) => (
  <View style={styles.filterIcon}>
    <View style={[styles.spoonShape, { borderColor: active ? theme.cream : theme.muted }]} />
  </View>
)

const MailIcon = ({ active }: { active: boolean }) => (
  <View style={styles.filterIcon}>
    <View style={[styles.mailBody, { borderColor: active ? theme.cream : theme.muted }]} />
    <View style={[styles.mailFlap, { borderColor: active ? theme.cream : theme.muted }]} />
  </View>
)

const filters = [
  { key: 'discover', icon: 'dish' },
  { key: 'friends', icon: 'user' },
  { key: 'friendsWant', icon: 'spoon' },
  { key: 'messages', icon: 'mail' },
]

export default function FeedScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { location } = useLocation()
  const [feedMode, setFeedMode] = useState<FeedMode>('discover')
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({})
  const [refreshing, setRefreshing] = useState(false)
  const [nearbyRestaurants, setNearbyRestaurants] = useState<RestaurantPost[]>([])
  const [loadingRestaurants, setLoadingRestaurants] = useState(false)
  
  // Post detail modal
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPostDetail, setShowPostDetail] = useState(false)
  
  // Message chat modal
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (feedMode === 'discover' && location) {
      fetchNearbyRestaurants()
    }
  }, [feedMode, location])

  const fetchNearbyRestaurants = async () => {
    if (!location) return
    
    setLoadingRestaurants(true)
    try {
      // Fetch Google Places nearby restaurants
      const results = await searchNearbyRestaurants(
        location.latitude,
        location.longitude,
        3000
      )
      
      // Fetch public posts from Supabase (from nearby area)
      const { data: publicPosts } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          rating,
          created_at,
          user_id,
          profiles:user_id(username, avatar_url)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20)
      
      // Combine restaurant data with public posts
      // In a real app, you'd match posts to restaurants via restaurant_id
      // For now, we'll create combined cards
      const combinedData = results.map(place => {
        const matchingPost = publicPosts?.find(p => 
          p.caption?.toLowerCase().includes(place.name.toLowerCase())
        )
        return {
          ...place,
          post: matchingPost,
          hasPublicPost: !!matchingPost,
        }
      })
      
      setNearbyRestaurants(combinedData)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoadingRestaurants(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    if (feedMode === 'discover') {
      fetchNearbyRestaurants()
    }
    setTimeout(() => setRefreshing(false), 1000)
  }

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const getCategoryEmoji = (types: string[]): string => {
    const typeStr = types?.join(' ') || ''
    if (typeStr.includes('ramen')) return '🍜'
    if (typeStr.includes('sushi') || typeStr.includes('sushi_bar')) return '🍣'
    if (typeStr.includes('korean')) return '🥘'
    if (typeStr.includes('cafe') || typeStr.includes('coffee')) return '☕'
    if (typeStr.includes('japanese')) return '🍱'
    if (typeStr.includes('bar')) return '🍺'
    if (typeStr.includes('bakery')) return '🥐'
    return '🍽️'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return theme.accent
    if (rating >= 4.0) return theme.gold
    if (rating >= 3.5) return theme.green
    return theme.muted
  }

  // Discover Mode - Nearby Restaurants
  if (feedMode === 'discover') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <HaraLogo size={36} />
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍 {location ? 'Near you' : 'Tokyo'}</Text>
          </View>
        </View>

        {/* Mode Filters - Fixed 4 Section Tab Bar */}
        <View style={styles.modeFilters}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.modeFilterButton,
                feedMode === filter.key && styles.modeFilterButtonActive,
              ]}
              onPress={() => setFeedMode(filter.key as FeedMode)}
            >
              {filter.icon === 'dish' && <DishIcon active={feedMode === filter.key} />}
              {filter.icon === 'user' && <UserIcon active={feedMode === filter.key} />}
              {filter.icon === 'spoon' && <SpoonIcon active={feedMode === filter.key} />}
              {filter.icon === 'mail' && <MailIcon active={feedMode === filter.key} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Nearby Restaurants Feed */}
        <ScrollView 
          style={styles.feed}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
            />
          }
        >
          {/* Discover Header */}
          <View style={styles.discoverHeader}>
            <Text style={styles.discoverTitle}>Nearby Restaurants</Text>
            <Text style={styles.discoverSubtitle}>
              Discover great food around you
            </Text>
          </View>

          {loadingRestaurants ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={styles.loadingText}>Finding restaurants near you...</Text>
            </View>
          ) : (
            nearbyRestaurants.slice(0, 15).map((restaurant, index) => (
              <TouchableOpacity 
                key={restaurant.place_id || index}
                style={styles.restaurantCard}
                onPress={() => router.push('/create')}
              >
                {/* Image or Placeholder / Public Post */}
                <View style={[
                  styles.restaurantImage,
                  { backgroundColor: getRatingColor(restaurant.rating) }
                ]}>
                  {/* If there's a public post, show it */}
                  {restaurant.post?.image_url ? (
                    <Image 
                      source={{ uri: restaurant.post.image_url }} 
                      style={styles.restaurantImageContent}
                    />
                  ) : restaurant.photos?.[0] ? (
                    <Image 
                      source={{ uri: restaurant.photos[0] }} 
                      style={styles.restaurantImageContent}
                    />
                  ) : (
                    <Text style={styles.restaurantEmoji}>
                      {getCategoryEmoji(restaurant.types)}
                    </Text>
                  )}
                  
                  {/* Public post indicator */}
                  {restaurant.hasPublicPost && (
                    <View style={styles.publicPostBadge}>
                      <Text style={styles.publicPostBadgeText}>🌍 Public</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                  <Text style={styles.restaurantAddress} numberOfLines={1}>
                    {restaurant.formatted_address}
                  </Text>
                  
                  <View style={styles.restaurantMeta}>
                    <View style={[
                      styles.restaurantRating,
                      { backgroundColor: getRatingColor(restaurant.rating) }
                    ]}>
                      <Text style={styles.restaurantRatingText}>
                        ★ {restaurant.rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.restaurantReviews}>
                      ({restaurant.user_ratings_total})
                    </Text>
                    <Text style={[
                      styles.restaurantStatus,
                      { color: restaurant.opening_hours?.open_now ? theme.green : theme.muted }
                    ]}>
                      {restaurant.opening_hours?.open_now ? '● Open' : '○ Closed'}
                    </Text>
                  </View>
                  
                  {/* Show post preview if available */}
                  {restaurant.post && (
                    <View style={styles.postPreview}>
                      <Text style={styles.postPreviewText} numberOfLines={1}>
                        "{restaurant.post.caption}"
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action */}
                <View style={styles.restaurantAction}>
                  <Text style={styles.restaurantActionEmoji}>
                    {restaurant.hasPublicPost ? '●' : '○'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/create')}
            >
              <Text style={styles.quickActionText}>+ Share a HARA</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/map')}
            >
              <Text style={styles.quickActionText}>Map</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }

  // Friends Mode
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <HaraLogo size={36} />
      </View>

      {/* Mode Filters - Fixed 4 Section Tab Bar */}
      <View style={styles.modeFilters}>
        {filters.map((filter) => (
          <TouchableOpacity
              key={filter.key}
              style={[
                styles.modeFilterButton,
                feedMode === filter.key && styles.modeFilterButtonActive,
              ]}
              onPress={() => setFeedMode(filter.key as FeedMode)}
            >
              {filter.icon === 'dish' && <DishIcon active={feedMode === filter.key} />}
              {filter.icon === 'user' && <UserIcon active={feedMode === filter.key} />}
              {filter.icon === 'spoon' && <SpoonIcon active={feedMode === filter.key} />}
              {filter.icon === 'mail' && <MailIcon active={feedMode === filter.key} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      <ScrollView 
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
          />
        }
      >
        {feedMode === 'friends' ? (
          // Friends Posts
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Friends' HARAs</Text>
              <Text style={styles.sectionSubtitle}>Where your friends have been</Text>
            </View>
            {mockPosts.map((post) => (
              <TouchableOpacity 
                key={post.id} 
                onPress={() => {
                  setSelectedPost(post)
                  setShowPostDetail(true)
                }}
                activeOpacity={0.8}
              >
                <PostCard
                  key={post.id}
                  {...post}
                  isLiked={likedPosts[post.id] || false}
                  onLike={() => toggleLike(post.id)}
                  onComment={() => {
                    setSelectedPost(post)
                    setShowPostDetail(true)
                  }}
                  onShare={() => {}}
                  onRestaurantPress={() => {}}
                />
              </TouchableOpacity>
            ))}
          </>
        ) : feedMode === 'messages' ? (
          // Messages - Simplified
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Messages</Text>
              <Text style={styles.sectionSubtitle}>Friends sharing restaurant recommendations</Text>
            </View>
            {mockMessages.map((msg) => (
              <TouchableOpacity 
                key={msg.id} 
                style={styles.messageCard}
                onPress={() => {
                  setSelectedMessage(msg)
                  setShowChat(true)
                }}
              >
                {/* Friend Avatar */}
                <View style={styles.messageAvatar}>
                  <Text style={styles.messageAvatarText}>
                    {msg.friend.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                {/* Simplified Message Content */}
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageFriend}>@{msg.friendUsername}</Text>
                    <Text style={styles.messageTime}>{msg.time}</Text>
                  </View>
                  
                  {/* Restaurant */}
                  <View style={styles.messageRestaurant}>
                    <Text style={styles.messageRestaurantName}>{msg.restaurant}</Text>
                    <Text style={styles.messageRestaurantDish}>{msg.dish}</Text>
                  </View>
                  
                  {/* Message */}
                  <Text style={styles.messageText} numberOfLines={2}>"{msg.message}"</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          // Friends Want to Try
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Friends' Want to Try</Text>
              <Text style={styles.sectionSubtitle}>Places your friends want to visit</Text>
            </View>
            {mockPosts.slice(0, 2).map((post) => (
              <TouchableOpacity 
                key={post.id} 
                style={styles.wantCard}
                onPress={() => router.push({
                  pathname: '/map',
                  params: { 
                    restaurant: post.restaurant,
                    lat: '35.6762',
                    lng: '139.6503',
                    rating: post.rating.toString(),
                    friendsWant: '3',
                    friendsBeen: '5',
                  }
                })}
              >
                <View style={[
                  styles.wantCardImage,
                  { backgroundColor: getRatingColor(post.rating) }
                ]}>
                  <Text style={styles.wantCardEmoji}>🍽️</Text>
                </View>
                <View style={styles.wantCardInfo}>
                  <Text style={styles.wantCardName}>{post.restaurant}</Text>
                  <Text style={styles.wantCardDish}>{post.dish}</Text>
                  <View style={styles.wantCardMeta}>
                    <View style={styles.wantCardStats}>
                      <Text style={styles.wantCardFriends}>👀 {3} want to go</Text>
                      <Text style={styles.wantCardFriends}>✓ {5} have been</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.wantCardAction}>
                  <Text style={styles.wantCardActionText}>Go →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Post Detail Modal - Full Screen */}
      <Modal
        visible={showPostDetail}
        animationType="slide"
        onRequestClose={() => setShowPostDetail(false)}
      >
        <View style={styles.fullScreenModal}>
          {/* Sticky Header */}
          <View style={styles.stickyHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowPostDetail(false)}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.stickyHeaderTitle}>Post</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Scroll Hint */}
          <View style={styles.scrollHint}>
            <Text style={styles.scrollHintText}>↑ Scroll up to close</Text>
          </View>

          {selectedPost && (
            <ScrollView 
              style={styles.fullScreenScroll}
              contentContainerStyle={styles.fullScreenContent}
              showsVerticalScrollIndicator={false}
              onScroll={(event) => {
                const scrollY = event.nativeEvent.contentOffset.y
                // If scrolled up from top (negative), dismiss
                if (scrollY < -50) {
                  setShowPostDetail(false)
                }
              }}
              scrollEventThrottle={16}
            >
              {/* Full Image - BeReal Style (Food + Selfie) */}
              <TouchableOpacity 
                style={styles.fullScreenImage}
                activeOpacity={0.95}
                onPress={() => {
                  // Toggle like on single tap
                  toggleLike(selectedPost.id)
                }}
                onLongPress={() => {
                  // Double-tap heart animation would go here
                }}
                delayLongPress={300}
              >
                {/* Food Photo - Main Image */}
                {selectedPost.imageUrl ? (
                  <Image 
                    source={{ uri: selectedPost.imageUrl }} 
                    style={styles.fullScreenFoodImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[
                    styles.fullScreenImagePlaceholder,
                    { backgroundColor: getRatingColor(selectedPost.rating) }
                  ]}>
                    <Text style={styles.fullScreenImageEmoji}>
                      {selectedPost.rating >= 5 ? '🍜' : selectedPost.rating >= 4 ? '🍣' : '🍽️'}
                    </Text>
                  </View>
                )}
                
                {/* Like Animation Overlay (shows when double-tapped) */}
                {likedPosts[selectedPost.id] && (
                  <View style={styles.likeAnimationOverlay}>
                    <Text style={styles.likeAnimationEmoji}>❤️</Text>
                  </View>
                )}
                
                {/* Selfie Overlay - BeReal Style (Bottom Right) */}
                <View style={styles.selfieOverlay}>
                  <View style={styles.selfieImage}>
                    <Text style={styles.selfieEmoji}>😊</Text>
                  </View>
                </View>
                
                {/* Rating Badge */}
                <View style={styles.fullScreenRatingBadge}>
                  <Text style={styles.fullScreenRatingBadgeText}>
                    ★ {selectedPost.rating}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* User Info */}
              <View style={styles.fullScreenUserSection}>
                <View style={styles.fullScreenAvatar}>
                  <Text style={styles.fullScreenAvatarText}>
                    {selectedPost.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.fullScreenUserInfo}>
                  <Text style={styles.fullScreenUsername}>@{selectedPost.username}</Text>
                  <Text style={styles.fullScreenLocation}>{selectedPost.location} · {selectedPost.time}</Text>
                </View>
              </View>

              {/* Restaurant Info */}
              <View style={styles.fullScreenRestaurantSection}>
                <Text style={styles.fullScreenRestaurantName}>{selectedPost.restaurant}</Text>
                <Text style={styles.fullScreenDish}>{selectedPost.dish}</Text>
                <View style={styles.fullScreenRating}>
                  <Text style={styles.fullScreenRatingText}>
                    {'★'.repeat(selectedPost.rating)}{'☆'.repeat(5 - selectedPost.rating)}
                  </Text>
                </View>
              </View>

              {/* Caption */}
              {selectedPost.dish && (
                <View style={styles.fullScreenCaptionSection}>
                  <Text style={styles.fullScreenCaption}>{selectedPost.dish}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.fullScreenActions}>
                <TouchableOpacity 
                  style={styles.fullScreenAction}
                  onPress={() => toggleLike(selectedPost.id)}
                >
                  <Text style={styles.fullScreenActionEmoji}>
                    {likedPosts[selectedPost.id] ? '❤️' : '🤍'}
                  </Text>
                  <Text style={styles.fullScreenActionText}>
                    {likedPosts[selectedPost.id] ? selectedPost.likes + 1 : selectedPost.likes}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fullScreenAction}>
                  <Text style={styles.fullScreenActionEmoji}>💬</Text>
                  <Text style={styles.fullScreenActionText}>{selectedPost.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fullScreenAction}>
                  <Text style={styles.fullScreenActionEmoji}>📤</Text>
                  <Text style={styles.fullScreenActionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fullScreenAction}>
                  <Text style={styles.fullScreenActionEmoji}>🔖</Text>
                  <Text style={styles.fullScreenActionText}>Save</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.fullScreenDivider} />

              {/* Comments Section */}
              <View style={styles.fullScreenComments}>
                <Text style={styles.fullScreenCommentsTitle}>
                  Comments ({mockComments[selectedPost.id]?.length || 0})
                </Text>
                {mockComments[selectedPost.id]?.map((comment) => (
                  <View key={comment.id} style={styles.fullScreenCommentItem}>
                    <View style={styles.fullScreenCommentAvatar}>
                      <Text style={styles.fullScreenCommentAvatarText}>
                        {comment.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.fullScreenCommentContent}>
                      <View style={styles.fullScreenCommentHeader}>
                        <Text style={styles.fullScreenCommentUsername}>@{comment.username}</Text>
                        <Text style={styles.fullScreenCommentTime}>{comment.time}</Text>
                      </View>
                      <Text style={styles.fullScreenCommentText}>{comment.text}</Text>
                    </View>
                  </View>
                ))}
                {(!mockComments[selectedPost.id] || mockComments[selectedPost.id].length === 0) && (
                  <Text style={styles.fullScreenNoComments}>No comments yet. Be the first!</Text>
                )}
              </View>

              {/* Add Comment Input */}
              <View style={styles.fullScreenAddComment}>
                <TextInput
                  style={styles.fullScreenCommentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor={theme.muted}
                />
                <TouchableOpacity style={styles.fullScreenPostButton}>
                  <Text style={styles.fullScreenPostButtonText}>Post</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Spacing */}
              <View style={styles.bottomSpacer} />
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={showChat}
        animationType="slide"
        onRequestClose={() => setShowChat(false)}
      >
        <View style={styles.fullScreenModal}>
          {/* Sticky Header */}
          <View style={styles.stickyHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowChat(false)}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.stickyHeaderTitle}>Chat</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Scroll Hint */}
          <View style={styles.scrollHint}>
            <Text style={styles.scrollHintText}>↑ Scroll up to close</Text>
          </View>

          {selectedMessage && (
            <ScrollView 
              style={styles.fullScreenScroll}
              contentContainerStyle={styles.fullScreenContent}
              showsVerticalScrollIndicator={false}
              onScroll={(event) => {
                const scrollY = event.nativeEvent.contentOffset.y
                if (scrollY < -50) {
                  setShowChat(false)
                }
              }}
              scrollEventThrottle={16}
            >
              {/* User Info */}
              <View style={styles.chatUserSection}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>
                    {selectedMessage.friend.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.chatUserInfo}>
                  <Text style={styles.chatUsername}>@{selectedMessage.friendUsername}</Text>
                  <Text style={styles.chatTime}>{selectedMessage.time}</Text>
                </View>
              </View>

              {/* Restaurant - Clickable to view place */}
              <TouchableOpacity 
                style={styles.chatRestaurantCard}
                onPress={() => {
                  setShowChat(false)
                  // Navigate to map with restaurant info
                  setTimeout(() => {
                    router.push({
                      pathname: '/map',
                      params: { 
                        restaurant: selectedMessage.restaurant,
                        lat: '35.6762',
                        lng: '139.6503',
                        rating: selectedMessage.rating.toString(),
                        friendsWant: '3',
                        friendsBeen: '5',
                      }
                    })
                  }, 300)
                }}
              >
                <View style={[
                  styles.chatRestaurantImage,
                  { backgroundColor: getRatingColor(selectedMessage.rating) }
                ]}>
                  <Text style={styles.chatRestaurantEmoji}>🍽️</Text>
                </View>
                <View style={styles.chatRestaurantInfo}>
                  <Text style={styles.chatRestaurantName}>{selectedMessage.restaurant}</Text>
                  <Text style={styles.chatRestaurantDish}>{selectedMessage.dish}</Text>
                  <View style={styles.chatRestaurantRating}>
                    <Text style={styles.chatRatingText}>★ {selectedMessage.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Message - Double tap to react */}
              <TouchableOpacity 
                style={styles.chatMessageSection}
                onPress={() => {
                  // Show reaction picker (simplified - just react with heart)
                  Alert.alert('Reacted with ❤️')
                }}
              >
                <Text style={styles.chatMessageText}>"{selectedMessage.message}"</Text>
                <Text style={styles.chatDoubleTapHint}>Double tap to react</Text>
              </TouchableOpacity>

              {/* Reactions */}
              <View style={styles.chatReactions}>
                {selectedMessage.reactions.map((reaction, i) => (
                  <View key={i} style={styles.chatReactionBadge}>
                    <Text style={styles.chatReactionEmoji}>{reaction.emoji}</Text>
                    <Text style={styles.chatReactionCount}>{reaction.count}</Text>
                  </View>
                ))}
              </View>

              {/* Divider */}
              <View style={styles.fullScreenDivider} />

              {/* Reply Input */}
              <View style={styles.chatReplySection}>
                <TextInput
                  style={styles.chatReplyInput}
                  placeholder="Reply to message..."
                  placeholderTextColor={theme.muted}
                />
                <TouchableOpacity style={styles.chatReplyButton}>
                  <Text style={styles.chatReplyButtonText}>Send</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Spacer */}
              <View style={styles.bottomSpacer} />
            </ScrollView>
          )}
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
    paddingBottom: 8,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.cream,
  },
  logoAccent: {
    color: theme.accent,
  },
  locationBadge: {
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  locationText: {
    color: theme.cream,
    fontSize: 12,
    fontWeight: '500',
  },
  modeFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modeFilterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeFilterButtonActive: {
    backgroundColor: theme.accent,
  },
  modeFilterText: {
    fontSize: 28,
  },
  modeFilterTextActive: {
    color: '#FFF',
  },
  // Filter Icons - Minimalist white line style
  filterIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Dish/Bowl - bowl shape
  dishBowl: {
    width: 22,
    height: 12,
    borderWidth: 2,
    borderRadius: 0,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    position: 'absolute',
    bottom: 4,
  },
  dishLine: {
    width: 16,
    height: 2,
    position: 'absolute',
    bottom: 8,
  },
  // User - upper body silhouette
  userHead: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderRadius: 7,
    position: 'absolute',
    top: 2,
  },
  userBody: {
    width: 20,
    height: 10,
    borderWidth: 2,
    borderRadius: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 2,
  },
  // Spoon
  spoonShape: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 0,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  // Mail/Envelope
  mailBody: {
    width: 20,
    height: 14,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
  },
  mailFlap: {
    width: 18,
    height: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    position: 'absolute',
    top: 2,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: theme.muted,
    marginTop: 12,
    fontSize: 14,
  },
  
  // Discover styles
  discoverHeader: {
    marginBottom: 16,
  },
  discoverTitle: {
    color: theme.cream,
    fontSize: 22,
    fontWeight: '700',
  },
  discoverSubtitle: {
    color: theme.muted,
    fontSize: 14,
    marginTop: 4,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  restaurantImage: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantImageContent: {
    width: '100%',
    height: '100%',
  },
  restaurantEmoji: {
    fontSize: 40,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  restaurantName: {
    color: theme.cream,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantAddress: {
    color: theme.muted,
    fontSize: 11,
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restaurantRating: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  restaurantRatingText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  restaurantReviews: {
    color: theme.muted,
    fontSize: 11,
  },
  restaurantStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  restaurantAction: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  restaurantActionEmoji: {
    fontSize: 24,
  },
  publicPostBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  publicPostBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  postPreview: {
    marginTop: 6,
    backgroundColor: theme.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  postPreviewText: {
    color: theme.textSub,
    fontSize: 11,
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.card,
    paddingVertical: 16,
    borderRadius: 16,
  },
  quickActionEmoji: {
    fontSize: 20,
  },
  quickActionText: {
    color: theme.cream,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Section styles
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.cream,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 4,
  },
  
  // Want card styles
  wantCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    alignItems: 'center',
  },
  wantCardImage: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wantCardEmoji: {
    fontSize: 32,
  },
  wantCardInfo: {
    flex: 1,
    padding: 12,
  },
  wantCardName: {
    color: theme.cream,
    fontSize: 14,
    fontWeight: '600',
  },
  wantCardDish: {
    color: theme.textSub,
    fontSize: 12,
    marginTop: 2,
  },
  wantCardMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  wantCardStats: {
    flexDirection: 'row',
    gap: 12,
  },
  wantCardFriends: {
    color: theme.textSub,
    fontSize: 11,
  },
  wantCardUser: {
    color: theme.accent,
    fontSize: 11,
  },
  wantCardTime: {
    color: theme.muted,
    fontSize: 11,
  },
  wantCardAction: {
    paddingHorizontal: 16,
  },
  wantCardActionText: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Message styles
  messageCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  messageAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageFriend: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  messageTime: {
    color: theme.muted,
    fontSize: 12,
  },
  messageRestaurant: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  messageRestaurantImage: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageRestaurantEmoji: {
    fontSize: 28,
  },
  messageRestaurantInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  messageRestaurantName: {
    color: theme.cream,
    fontSize: 13,
    fontWeight: '600',
  },
  messageRestaurantDish: {
    color: theme.textSub,
    fontSize: 11,
    marginTop: 2,
  },
  messageRestaurantRating: {
    marginTop: 4,
  },
  messageRatingText: {
    color: theme.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  messageText: {
    color: theme.textSub,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  messageReactions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    color: theme.muted,
    fontSize: 12,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  messageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  messageActionEmoji: {
    fontSize: 16,
  },
  messageActionText: {
    color: theme.textSub,
    fontSize: 11,
    fontWeight: '500',
  },
  
  // Post Detail Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  postDetailModal: {
    backgroundColor: theme.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.95,
  },
  postDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  postDetailClose: {
    color: theme.cream,
    fontSize: 24,
  },
  postDetailTitle: {
    color: theme.cream,
    fontSize: 18,
    fontWeight: '700',
  },
  postDetailContent: {
    flex: 1,
  },
  postDetailImage: {
    width: '100%',
    aspectRatio: 1,
  },
  postDetailImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postDetailImageEmoji: {
    fontSize: 100,
  },
  postDetailUser: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  postDetailAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postDetailAvatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  postDetailUserInfo: {
    marginLeft: 12,
  },
  postDetailUsername: {
    color: theme.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  postDetailLocation: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 2,
  },
  postDetailRestaurant: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postDetailRestaurantName: {
    color: theme.cream,
    fontSize: 22,
    fontWeight: '700',
  },
  postDetailDish: {
    color: theme.textSub,
    fontSize: 15,
    marginTop: 4,
  },
  postDetailRating: {
    marginTop: 8,
  },
  postDetailRatingText: {
    color: theme.gold,
    fontSize: 18,
  },
  postDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  postDetailAction: {
    alignItems: 'center',
    gap: 4,
  },
  postDetailActionEmoji: {
    fontSize: 24,
  },
  postDetailActionText: {
    color: theme.cream,
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Comments
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    color: theme.cream,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: theme.cream,
    fontSize: 14,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUsername: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  commentTime: {
    color: theme.muted,
    fontSize: 11,
  },
  commentText: {
    color: theme.cream,
    fontSize: 14,
    lineHeight: 20,
  },
  noComments: {
    color: theme.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  
  // Add Comment
  addCommentSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  addCommentInput: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.cream,
    fontSize: 14,
  },
  addCommentButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addCommentButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Full Screen Modal Styles
  fullScreenModal: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: theme.bg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  stickyHeaderTitle: {
    color: theme.cream,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollHint: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: theme.surface,
  },
  scrollHintText: {
    color: theme.muted,
    fontSize: 12,
  },
  fullScreenScroll: {
    flex: 1,
  },
  fullScreenContent: {
    paddingBottom: 100,
  },
  fullScreenImageEmoji: {
    fontSize: 120,
  },
  fullScreenImage: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  fullScreenFoodImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeAnimationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  likeAnimationEmoji: {
    fontSize: 100,
  },
  selfieOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 100,
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selfieImage: {
    flex: 1,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfieEmoji: {
    fontSize: 50,
  },
  fullScreenRatingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fullScreenRatingBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fullScreenUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenAvatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  fullScreenUserInfo: {
    marginLeft: 14,
  },
  fullScreenUsername: {
    color: theme.cream,
    fontSize: 18,
    fontWeight: '700',
  },
  fullScreenLocation: {
    color: theme.muted,
    fontSize: 14,
    marginTop: 2,
  },
  fullScreenRestaurantSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fullScreenRestaurantName: {
    color: theme.cream,
    fontSize: 28,
    fontWeight: '800',
  },
  fullScreenDish: {
    color: theme.textSub,
    fontSize: 18,
    marginTop: 6,
  },
  fullScreenRating: {
    marginTop: 12,
  },
  fullScreenRatingText: {
    color: theme.gold,
    fontSize: 24,
  },
  fullScreenCaptionSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fullScreenCaption: {
    color: theme.cream,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  fullScreenActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
    marginHorizontal: 20,
  },
  fullScreenAction: {
    alignItems: 'center',
    gap: 6,
  },
  fullScreenActionEmoji: {
    fontSize: 26,
  },
  fullScreenActionText: {
    color: theme.cream,
    fontSize: 12,
    fontWeight: '500',
  },
  fullScreenDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  fullScreenComments: {
    paddingHorizontal: 20,
  },
  fullScreenCommentsTitle: {
    color: theme.cream,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  fullScreenCommentItem: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  fullScreenCommentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCommentAvatarText: {
    color: theme.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  fullScreenCommentContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: theme.card,
    padding: 14,
    borderRadius: 16,
  },
  fullScreenCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fullScreenCommentUsername: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenCommentTime: {
    color: theme.muted,
    fontSize: 12,
  },
  fullScreenCommentText: {
    color: theme.cream,
    fontSize: 15,
    lineHeight: 22,
  },
  fullScreenNoComments: {
    color: theme.muted,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 30,
  },
  fullScreenAddComment: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  fullScreenCommentInput: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: theme.cream,
    fontSize: 15,
  },
  fullScreenPostButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
  },
  fullScreenPostButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  bottomSpacer: {
    height: 40,
  },
  
  // Chat Modal Styles
  chatUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  chatAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatAvatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
  },
  chatUserInfo: {
    marginLeft: 16,
  },
  chatUsername: {
    color: theme.cream,
    fontSize: 20,
    fontWeight: '700',
  },
  chatTime: {
    color: theme.muted,
    fontSize: 14,
    marginTop: 4,
  },
  chatRestaurantCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chatRestaurantImage: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatRestaurantEmoji: {
    fontSize: 44,
  },
  chatRestaurantInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  chatRestaurantName: {
    color: theme.cream,
    fontSize: 18,
    fontWeight: '700',
  },
  chatRestaurantDish: {
    color: theme.textSub,
    fontSize: 14,
    marginTop: 4,
  },
  chatRestaurantRating: {
    marginTop: 8,
  },
  chatRatingText: {
    color: theme.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  chatMessageSection: {
    padding: 20,
  },
  chatMessageText: {
    color: theme.cream,
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  chatDoubleTapHint: {
    color: theme.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  chatReactions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  chatReactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  chatReactionEmoji: {
    fontSize: 18,
  },
  chatReactionCount: {
    color: theme.muted,
    fontSize: 14,
  },
  chatActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
    marginHorizontal: 20,
    marginTop: 20,
  },
  chatActionButton: {
    alignItems: 'center',
    gap: 6,
  },
  chatActionEmoji: {
    fontSize: 24,
  },
  chatActionText: {
    color: theme.cream,
    fontSize: 11,
    fontWeight: '500',
  },
  chatReplySection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  chatReplyInput: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: theme.cream,
    fontSize: 15,
  },
  chatReplyButton: {
    backgroundColor: theme.accent,
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
  },
  chatReplyButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
})
