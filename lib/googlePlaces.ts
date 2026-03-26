import { supabase } from './supabase'

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY

export interface GooglePlace {
  place_id: string
  name: string
  formatted_address: string
  latitude: number
  longitude: number
  rating: number
  user_ratings_total: number
  photos: string[]
  opening_hours: {
    open_now: boolean
    weekday_text: string[]
  }
  price_level: number
  types: string[]
  reviews: {
    author_name: string
    rating: number
    text: string
    relative_time_description: string
  }[]
  formatted_phone_number?: string
  website?: string
}

export async function searchNearbyRestaurants(
  latitude: number,
  longitude: number,
  radius: number = 3000
): Promise<GooglePlace[]> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status === 'OK') {
      return data.results.map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.vicinity || '',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        photos: place.photos 
          ? place.photos.map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            )
          : [],
        opening_hours: place.opening_hours || { open_now: false, weekday_text: [] },
        price_level: place.price_level || 1,
        types: place.types || [],
        reviews: []
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error searching places:', error)
    return []
  }
}

export async function getPlaceDetails(placeId: string): Promise<GooglePlace | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,user_ratings_total,photos,opening_hours,price_level,types,reviews&key=${GOOGLE_PLACES_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status === 'OK') {
      const place = data.result
      return {
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        photos: place.photos 
          ? place.photos.map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            )
          : [],
        opening_hours: place.opening_hours || { open_now: false, weekday_text: [] },
        price_level: place.price_level || 1,
        types: place.types || [],
        reviews: place.reviews ? place.reviews.slice(0, 5).map((review: any) => ({
          author_name: review.author_name,
          rating: review.rating,
          text: review.text,
          relative_time_description: review.relative_time_description
        })) : []
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting place details:', error)
    return null
  }
}

export async function searchRestaurantsByQuery(
  query: string,
  latitude: number,
  longitude: number
): Promise<GooglePlace[]> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${latitude},${longitude}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status === 'OK') {
      return data.results.map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        photos: place.photos 
          ? place.photos.map((photo: any) => 
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            )
          : [],
        opening_hours: place.opening_hours || { open_now: false, weekday_text: [] },
        price_level: place.price_level || 1,
        types: place.types || [],
        reviews: []
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error searching restaurants:', error)
    return []
  }
}

export function getCuisineType(types: string[]): string {
  const cuisineMap: Record<string, string> = {
    'ramen': 'Ramen',
    'sushi_bar': 'Sushi',
    'japanese_restaurant': 'Japanese',
    'korean_restaurant': 'Korean',
    'chinese_restaurant': 'Chinese',
    'thai_restaurant': 'Thai',
    'indian_restaurant': 'Indian',
    'italian_restaurant': 'Italian',
    'french_restaurant': 'French',
    'american_restaurant': 'American',
    'cafe': 'Café',
    'coffee_shop': 'Café',
    'bar': 'Bar',
    'fast_food': 'Fast Food',
    'meal_takeaway': 'Takeaway',
    'meal_delivery': 'Delivery'
  }
  
  for (const type of types) {
    if (cuisineMap[type]) return cuisineMap[type]
  }
  return 'Restaurant'
}

export function getPriceLevel(level: number): string {
  return '¥'.repeat(level || 1)
}
