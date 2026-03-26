import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

interface LocationCoords {
  latitude: number
  longitude: number
}

export function useLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    requestLocation()
  }, [])

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        setLoading(false)
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      })
      
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      })
      setErrorMsg(null)
    } catch (error) {
      setErrorMsg('Failed to get location')
      // Default to Tokyo if location fails
      setLocation({
        latitude: 35.6762,
        longitude: 139.6503
      })
    } finally {
      setLoading(false)
    }
  }

  return { location, errorMsg, loading, requestLocation }
}
