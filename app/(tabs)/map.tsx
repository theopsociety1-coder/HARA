import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, RefreshControl, Image, Platform, Linking } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { WebView } from 'react-native-webview'
import { theme } from '@/constants/theme'
import { useLocation } from '@/hooks/useLocation'
import { useAuth } from '@/contexts/AuthContext'
import { searchNearbyRestaurants, getPlaceDetails, GooglePlace } from '@/lib/googlePlaces'

const { width, height } = Dimensions.get('window')

const categories = [
  { key: 'all', label: 'All', emoji: '●' },
  { key: 'cafe', label: 'Cafe', emoji: '○' },
  { key: 'ramen', label: 'Ramen', emoji: '○' },
  { key: 'sushi', label: 'Sushi', emoji: '○' },
  { key: 'korean', label: 'Korean', emoji: '○' },
  { key: 'japanese', label: 'Japanese', emoji: '○' },
  { key: 'bar', label: 'Bar', emoji: '○' },
]

const generateMapHTML = (lat: number, lng: number, markers: any[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet.locatecontrol@0.79.0/dist/L.Control.Locate.min.css" />
  <script src="https://unpkg.com/leaflet.locatecontrol@0.79.0/dist/L.Control.Locate.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .leaflet-control-zoom { display: none; }
    .custom-marker { background: none; border: none; }
    .marker-pin {
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      animation: pulse 2s infinite;
      transition: transform 0.2s;
    }
    .marker-pin:hover { transform: scale(1.2); }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
      100% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
    }
    .marker-pin.selected {
      transform: scale(1.3);
      z-index: 1000 !important;
      animation: bounce 0.5s;
    }
    @keyframes bounce {
      0%, 100% { transform: scale(1.3); }
      50% { transform: scale(1.5); }
    }
    .popup-content {
      min-width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .popup-header {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .popup-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
    }
    .popup-stars { color: #D69E2E; font-size: 14px; }
    .popup-reviews { color: #718096; font-size: 12px; }
    .popup-category {
      display: inline-block;
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      color: #666;
      margin-bottom: 8px;
    }
    .popup-address {
      font-size: 12px;
      color: #888;
      margin-bottom: 8px;
    }
    .popup-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
    }
    .popup-status.open { color: #38A169; }
    .popup-status.closed { color: #E53E3E; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { 
      zoomControl: false,
      animation: true
    }).setView([${lat}, ${lng}], 16);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);
    
    // Animated user location
    var userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div style="width:20px;height:20px;background:#3B82F6;border-radius:50%;border:4px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    const emojiMap = {'ramen':'🍜','sushi':'🍣','korean':'🥘','cafe':'☕','japanese':'🍱','default':'🍽️'};
    function getEmoji(types) {
      if (!types) return emojiMap.default;
      const t = types.join(' ');
      if (t.includes('ramen')) return emojiMap.ramen;
      if (t.includes('sushi')) return emojiMap.sushi;
      if (t.includes('korean')) return emojiMap.korean;
      if (t.includes('cafe') || t.includes('coffee')) return emojiMap.cafe;
      if (t.includes('japanese')) return emojiMap.japanese;
      return emojiMap.default;
    }
    function getColor(rating) {
      if (rating >= 4.5) return '#E53E3E';
      if (rating >= 4.0) return '#D69E2E';
      if (rating >= 3.5) return '#38A169';
      return '#718096';
    }
    function getCategory(types) {
      if (!types) return 'Restaurant';
      const t = types.join(' ');
      if (t.includes('cafe') || t.includes('coffee')) return 'Cafe';
      if (t.includes('ramen')) return 'Ramen';
      if (t.includes('sushi') || t.includes('sushi_bar')) return 'Sushi';
      if (t.includes('korean')) return 'Korean';
      if (t.includes('japanese')) return 'Japanese';
      if (t.includes('bar')) return 'Bar';
      if (t.includes('bakery')) return 'Bakery';
      return 'Restaurant';
    }
    const markers = ${JSON.stringify(markers)};
    markers.forEach(function(m) {
      var icon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pin" style="background:' + getColor(m.rating) + '">' + m.emoji + '</div>',
        iconSize: [44, 44], iconAnchor: [22, 44], popupAnchor: [0, -44]
      });
      var marker = L.marker([m.lat, m.lng], { icon: icon, bounceOnAdd: true }).addTo(map);
      
      var stars = '★'.repeat(Math.floor(m.rating)) + (m.rating % 1 >= 0.5 ? '½' : '');
      var status = m.open_now ? 'open' : 'closed';
      var statusText = m.open_now ? '● Open now' : '○ Closed';
      
      marker.bindPopup('<div class="popup-content">' +
        '<div class="popup-header">' + m.name + '</div>' +
        '<div class="popup-rating">' +
          '<span class="popup-stars">' + stars + '</span>' +
          '<span class="popup-reviews">(' + m.reviews + ')</span>' +
        '</div>' +
        '<div class="popup-category">' + getCategory(m.types) + '</div>' +
        '<div class="popup-address">' + (m.address || '') + '</div>' +
        '<div class="popup-status ' + status + '">' + statusText + '</div>' +
      '</div>');
      
      marker.on('click', function() {
        document.querySelectorAll('.marker-pin').forEach(el => el.classList.remove('selected'));
        this.getElement().querySelector('.marker-pin').classList.add('selected');
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'markerClick', 
          place_id: m.place_id,
          name: m.name,
          rating: m.rating,
          reviews: m.reviews,
          category: getCategory(m.types),
          address: m.address,
          open_now: m.open_now,
          lat: m.lat,
          lng: m.lng
        }));
      });
    });
    
    // Smooth zoom to user location
    map.on('locationfound', function(e) {
      var radius = e.accuracy / 2;
      L.circle(e.latlng, {radius: radius, color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1}).addTo(map);
    });
    
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
  </script>
</body>
</html>
`

export default function MapScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { user } = useAuth()
  const { location, loading: locationLoading } = useLocation()
  const webviewRef = useRef<WebView>(null)
  
  const [restaurants, setRestaurants] = useState<GooglePlace[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [view, setView] = useState<'map' | 'list'>('map')
  const [selectedRestaurant, setSelectedRestaurant] = useState<GooglePlace | null>(null)
  const [restaurantDetails, setRestaurantDetails] = useState<GooglePlace | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  
  const [navigatedRestaurant, setNavigatedRestaurant] = useState<{
    name: string; lat: number; lng: number; rating: number; friendsWant: number; friendsBeen: number
  } | null>(null)

  useEffect(() => {
    if (params.restaurant) {
      setNavigatedRestaurant({
        name: params.restaurant as string,
        lat: parseFloat(params.lat as string) || 35.6762,
        lng: parseFloat(params.lng as string) || 139.6503,
        rating: parseFloat(params.rating as string) || 4,
        friendsWant: parseInt(params.friendsWant as string) || 0,
        friendsBeen: parseInt(params.friendsBeen as string) || 0,
      })
      setView('list')
    }
  }, [params])

  useEffect(() => {
    if (location) fetchRestaurants()
  }, [location])

  const fetchRestaurants = async () => {
    if (!location) return
    setLoading(true)
    try {
      const results = await searchNearbyRestaurants(location.latitude, location.longitude, 3000)
      const detailedResults = await Promise.all(
        results.slice(0, 20).map(async (place) => {
          const details = await getPlaceDetails(place.place_id)
          return details || place
        })
      )
      setRestaurants(detailedResults)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = selectedCategory === 'all'
    ? restaurants
    : restaurants.filter(r => {
        const types = r.types?.join(' ') || ''
        if (selectedCategory === 'cafe') return types.includes('cafe') || types.includes('coffee')
        if (selectedCategory === 'ramen') return types.includes('ramen')
        if (selectedCategory === 'sushi') return types.includes('sushi') || types.includes('sushi_bar')
        if (selectedCategory === 'korean') return types.includes('korean')
        if (selectedCategory === 'japanese') return types.includes('japanese')
        if (selectedCategory === 'bar') return types.includes('bar') || types.includes('night_club')
        return true
      })

  const getCategoryEmoji = (types: string[]): string => {
    const typeStr = types?.join(' ') || ''
    if (typeStr.includes('ramen')) return '🍜'
    if (typeStr.includes('sushi') || typeStr.includes('sushi_bar')) return '🍣'
    if (typeStr.includes('korean')) return '🥘'
    if (typeStr.includes('cafe') || typeStr.includes('coffee')) return '☕'
    if (typeStr.includes('japanese')) return '🍱'
    return '🍽️'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return theme.accent
    if (rating >= 4.0) return theme.gold
    if (rating >= 3.5) return theme.green
    return theme.muted
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchRestaurants()
    setRefreshing(false)
  }

  const handleMarkerPress = async (markerId: string) => {
    const restaurant = restaurants.find(r => r.place_id === markerId)
    if (restaurant) {
      setSelectedRestaurant(restaurant)
      const details = await getPlaceDetails(restaurant.place_id)
      if (details) setRestaurantDetails(details)
    }
  }

  const onWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'markerClick') {
        // Find full restaurant data from the clicked marker
        const restaurant = restaurants.find(r => r.place_id === data.place_id)
        if (restaurant) {
          setSelectedRestaurant(restaurant)
          getPlaceDetails(restaurant.place_id).then(details => {
            if (details) setRestaurantDetails(details)
          })
        }
      } else if (data.type === 'mapReady') {
        setMapReady(true)
      }
    } catch (e) {
      console.log('WebView message:', event.nativeEvent.data)
    }
  }

  const mapHTML = location ? generateMapHTML(location.latitude, location.longitude, filteredRestaurants.map(r => ({
    lat: r.latitude, lng: r.longitude, name: r.name, rating: r.rating,
    reviews: r.user_ratings_total, emoji: getCategoryEmoji(r.types), place_id: r.place_id,
    types: r.types, address: r.formatted_address, open_now: r.opening_hours?.open_now
  }))) : ''

  if (locationLoading || loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Finding restaurants near you...</Text>
        <Text style={styles.loadingSubtext}>Using OpenStreetMap</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {view === 'map' && (
        <WebView ref={webviewRef} style={styles.map} source={{ html: mapHTML }} originWhitelist={['*']}
          mixedContentMode="always" onMessage={onWebViewMessage} javaScriptEnabled={true}
          scrollEnabled={true} bounces={true} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} />
      )}

      <View style={styles.topControls}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchText}>{location ? 'Restaurants near you' : 'Finding location...'}</Text>
          </View>
          <TouchableOpacity style={[styles.viewButton, view === 'list' && styles.viewButtonActive]}
            onPress={() => setView(view === 'map' ? 'list' : 'map')}>
            <Text style={styles.viewIcon}>{view === 'map' ? '📝' : '🗺️'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.key} style={[styles.categoryButton, selectedCategory === cat.key && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(cat.key)}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryText, selectedCategory === cat.key && styles.categoryTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.statsPill}>
          <Text style={styles.statsText}>{filteredRestaurants.length} restaurants</Text>
          <Text style={styles.statsDot}>·</Text>
          <Text style={styles.statsLocation}>📍 {location ? 'Your location' : 'Tokyo'}</Text>
        </View>
      </View>

      {view === 'list' && (
        <ScrollView style={styles.listView} contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}>
          
          {navigatedRestaurant && (
            <View style={styles.wantedRestaurantCard}>
              <View style={styles.wantedCardHeader}>
                <Text style={styles.wantedCardTitle}>📍 Selected from Want List</Text>
                <TouchableOpacity onPress={() => { setNavigatedRestaurant(null); setView('map') }}>
                  <Text style={styles.wantedCardClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.wantedCardContent}>
                <View style={[styles.wantedCardImage, { backgroundColor: getRatingColor(navigatedRestaurant.rating) }]}>
                  <Text style={styles.wantedCardEmoji}>🍽️</Text>
                </View>
                <View style={styles.wantedCardInfo}>
                  <Text style={styles.wantedCardName}>{navigatedRestaurant.name}</Text>
                  <View style={styles.wantedCardStats}>
                    <View style={styles.wantedCardStat}>
                      <Text style={styles.wantedCardStatEmoji}>👀</Text>
                      <Text style={styles.wantedCardStatText}>{navigatedRestaurant.friendsWant} friends want to go</Text>
                    </View>
                    <View style={styles.wantedCardStat}>
                      <Text style={styles.wantedCardStatEmoji}>✓</Text>
                      <Text style={styles.wantedCardStatText}>{navigatedRestaurant.friendsBeen} friends have been</Text>
                    </View>
                  </View>
                  <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(navigatedRestaurant.rating), marginTop: 8 }]}>
                    <Text style={styles.ratingText}>★ {navigatedRestaurant.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.wantedCardActions}>
              <TouchableOpacity style={[styles.wantedCardAction, { backgroundColor: theme.accent }]}
                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${navigatedRestaurant.lat},${navigatedRestaurant.lng}`)}>
                <Text style={styles.wantedCardActionText}>Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.wantedCardAction} onPress={() => router.push('/create')}>
                <Text style={styles.wantedCardActionText}>Share</Text>
              </TouchableOpacity>
              </View>
            </View>
          )}

          {filteredRestaurants.map(restaurant => (
            <TouchableOpacity key={restaurant.place_id} style={styles.listItem} onPress={() => handleMarkerPress(restaurant.place_id)}>
              {restaurant.photos?.[0] && <Image source={{ uri: restaurant.photos[0] }} style={styles.listImage} />}
              <View style={styles.listInfo}>
                <Text style={styles.listName} numberOfLines={1}>{restaurant.name}</Text>
                <Text style={styles.listAddress} numberOfLines={1}>{restaurant.formatted_address}</Text>
                <View style={styles.listMeta}>
                  <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(restaurant.rating) }]}>
                    <Text style={styles.ratingText}>★ {restaurant.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.reviews}>({restaurant.user_ratings_total})</Text>
                  <Text style={[styles.openStatus, { color: restaurant.opening_hours?.open_now ? theme.green : theme.muted }]}>
                    {restaurant.opening_hours?.open_now ? '● Open' : '○ Closed'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedRestaurant && (
        <View style={styles.detailSheet}>
          <View style={styles.sheetHandle} />
          {selectedRestaurant.photos?.[0] && <Image source={{ uri: selectedRestaurant.photos[0] }} style={styles.detailImage} />}
          <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.detailContent}>
              {/* Category Badge */}
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {getCategoryEmoji(selectedRestaurant.types)} {selectedRestaurant.types?.[0] || 'Restaurant'}
                </Text>
              </View>
              
              <View style={styles.detailHeader}>
                <View style={styles.detailTitle}>
                  <Text style={styles.detailName}>{selectedRestaurant.name}</Text>
                  <Text style={styles.detailAddress}>{selectedRestaurant.formatted_address}</Text>
                </View>
                <View style={[styles.detailRating, { backgroundColor: getRatingColor(selectedRestaurant.rating) }]}>
                  <Text style={styles.detailRatingText}>★ {selectedRestaurant.rating.toFixed(1)}</Text>
                  <Text style={styles.detailReviews}>({selectedRestaurant.user_ratings_total} reviews)</Text>
                </View>
              </View>
              
              {/* Status */}
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: selectedRestaurant.opening_hours?.open_now ? 'rgba(56,161,105,0.2)' : 'rgba(229,62,62,0.2)' }]}>
                  <Text style={[styles.statusText, { color: selectedRestaurant.opening_hours?.open_now ? theme.green : theme.accent }]}>
                    {selectedRestaurant.opening_hours?.open_now ? '● Open now' : '○ Closed'}
                  </Text>
                </View>
                {selectedRestaurant.price_level && (
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{'$'.repeat(selectedRestaurant.price_level)}</Text>
                  </View>
                )}
              </View>
              
              {/* Hours - Full Week */}
              {selectedRestaurant.opening_hours?.weekday_text && (
                <View style={styles.hoursSection}>
                  <Text style={styles.hoursTitle}>Hours</Text>
                  {selectedRestaurant.opening_hours.weekday_text.map((day: string, i: number) => (
                    <Text key={i} style={styles.hoursText}>{day}</Text>
                  ))}
                </View>
              )}
              
              {/* Contact Info */}
              {(selectedRestaurant.formatted_phone_number || selectedRestaurant.website) && (
                <View style={styles.contactSection}>
                  <Text style={styles.contactTitle}>Contact</Text>
                  {selectedRestaurant.formatted_phone_number && (
                    <Text style={styles.contactText}>📞 {selectedRestaurant.formatted_phone_number}</Text>
                  )}
                  {selectedRestaurant.website && (
                    <Text style={styles.contactText}>🌐 {selectedRestaurant.website?.replace('https://', '').replace('www.', '')}</Text>
                  )}
                </View>
              )}
              
              {/* Reviews */}
              {restaurantDetails?.reviews && restaurantDetails.reviews.length > 0 && (
                <View style={styles.reviewsSection}>
                  <Text style={styles.reviewsTitle}>Recent Reviews</Text>
                  {restaurantDetails.reviews.slice(0, 3).map((review: any, i: number) => (
                    <View key={i} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewAuthor}>{review.author_name}</Text>
                        <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
                      </View>
                      <Text style={styles.reviewText} numberOfLines={3}>{review.text}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.detailActions}>
                <TouchableOpacity style={[styles.detailAction, { backgroundColor: theme.accent }]}
                  onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${selectedRestaurant.latitude},${selectedRestaurant.longitude}`)}>
                  <Text style={styles.detailActionText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailAction} onPress={() => router.push('/create')}>
                  <Text style={styles.detailActionTextAlt}>+ Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: theme.cream, marginTop: 16, fontSize: 16, fontWeight: '600' },
  loadingSubtext: { color: theme.muted, marginTop: 8, fontSize: 14 },
  map: { flex: 1 },
  topControls: { position: 'absolute', top: 52, left: 0, right: 0, zIndex: 50, paddingHorizontal: 14 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(18,14,12,0.95)', borderRadius: 16, padding: 12 },
  searchIcon: { fontSize: 16 },
  searchText: { color: theme.cream, fontSize: 14 },
  viewButton: { backgroundColor: 'rgba(18,14,12,0.95)', borderRadius: 16, padding: 12 },
  viewButtonActive: { backgroundColor: theme.accent },
  viewIcon: { fontSize: 18 },
  categories: { marginBottom: 10 },
  categoryButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, backgroundColor: 'rgba(18,14,12,0.95)', marginRight: 8 },
  categoryButtonActive: { backgroundColor: theme.accent },
  categoryEmoji: { fontSize: 14 },
  categoryText: { color: theme.textSub, fontSize: 12, fontWeight: '500' },
  categoryTextActive: { color: '#FFF' },
  statsPill: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(18,14,12,0.95)', borderRadius: 100, paddingVertical: 8, paddingHorizontal: 16, gap: 8 },
  statsText: { color: theme.cream, fontSize: 12, fontWeight: '600' },
  statsDot: { color: theme.border },
  statsLocation: { color: theme.green, fontSize: 12, fontWeight: '600' },
  listView: { flex: 1, marginTop: 200, backgroundColor: theme.bg },
  listContent: { padding: 14, paddingBottom: 100 },
  listItem: { flexDirection: 'row', backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  listImage: { width: 100, height: 100 },
  listInfo: { flex: 1, padding: 12 },
  listName: { color: theme.cream, fontWeight: '600', fontSize: 15, marginBottom: 4 },
  listAddress: { color: theme.muted, fontSize: 12, marginBottom: 8 },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  ratingText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  reviews: { color: theme.muted, fontSize: 11 },
  openStatus: { fontSize: 11, fontWeight: '600' },
  detailSheet: { position: 'absolute', bottom: 100, left: 0, right: 0, backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.65 },
  sheetHandle: { width: 36, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  detailScroll: { maxHeight: height * 0.55 },
  detailImage: { width: '100%', height: 180 },
  categoryBadge: { marginBottom: 12 },
  categoryBadgeText: { color: theme.textSub, fontSize: 13, fontWeight: '500' },
  detailContent: { padding: 16 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: '600' },
  priceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.card },
  priceText: { color: theme.cream, fontSize: 13, fontWeight: '600' },
  contactSection: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  contactTitle: { color: theme.textSub, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  contactText: { color: theme.cream, fontSize: 13, marginBottom: 4 },
  reviewRating: { color: theme.gold, fontSize: 12 },
  detailActionTextAlt: { color: theme.cream, fontWeight: '600', fontSize: 14 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailTitle: { flex: 1 },
  detailName: { color: theme.cream, fontWeight: '700', fontSize: 18, marginBottom: 4 },
  detailAddress: { color: theme.muted, fontSize: 12 },
  detailRating: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center' },
  detailRatingText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  detailReviews: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center' },
  hoursSection: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  hoursTitle: { color: theme.textSub, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  hoursText: { color: theme.cream, fontSize: 12 },
  reviewsSection: { marginBottom: 12 },
  reviewsTitle: { color: theme.textSub, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  reviewItem: { backgroundColor: theme.card, borderRadius: 12, padding: 12, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewAuthor: { color: theme.cream, fontWeight: '600', fontSize: 13 },
  reviewText: { color: theme.textSub, fontSize: 12, lineHeight: 18 },
  detailActions: { flexDirection: 'row', gap: 8 },
  detailAction: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  detailActionText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  detailIconButton: { width: 46, height: 46, borderRadius: 14, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center' },
  wantedRestaurantCard: { backgroundColor: theme.surface, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: theme.accent },
  wantedCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  wantedCardTitle: { color: theme.accent, fontSize: 14, fontWeight: '600' },
  wantedCardClose: { color: theme.muted, fontSize: 20 },
  wantedCardContent: { flexDirection: 'row', gap: 16 },
  wantedCardImage: { width: 80, height: 80, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  wantedCardEmoji: { fontSize: 36 },
  wantedCardInfo: { flex: 1 },
  wantedCardName: { color: theme.cream, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  wantedCardStats: { gap: 6 },
  wantedCardStat: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wantedCardStatEmoji: { fontSize: 14 },
  wantedCardStatText: { color: theme.textSub, fontSize: 13 },
  wantedCardActions: { flexDirection: 'row', gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.border },
  wantedCardAction: { flex: 1, backgroundColor: theme.card, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  wantedCardActionText: { color: theme.cream, fontSize: 14, fontWeight: '600' },
})
