import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView, Image, ActivityIndicator, Dimensions, StatusBar } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { Video, Audio, ResizeMode } from 'expo-av'
import { theme } from '@/constants/theme'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const { width, height } = Dimensions.get('window')

type ScreenState = 'camera' | 'preview' | 'rate' | 'details'

interface Restaurant {
  id: string
  name: string
  name_ja: string
  cuisine_type: string
}

interface CaptureMetadata {
  retakes: number
  captureTime: Date
  isLate: boolean
  btsVideoUri: string | null
}

export default function CreateScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const cameraRef = useRef<CameraView>(null)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [micPermission, requestMicPermission] = useMicrophonePermissions()
  
  const [screen, setScreen] = useState<ScreenState>('camera')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedFrontImage, setCapturedFrontImage] = useState<string | null>(null)
  const [btsVideoUri, setBtsVideoUri] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [restaurantSearch, setRestaurantSearch] = useState('')
  const [showRestaurantList, setShowRestaurantList] = useState(false)
  
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [facing, setFacing] = useState<CameraType>('back')
  const [saving, setSaving] = useState(false)
  
  // Rating: 0-5 with 0.5 increments
  const [rating, setRating] = useState(0)
  
  // BeReal capture flow: food -> selfie -> preview
  const [captureStep, setCaptureStep] = useState<'food' | 'selfie' | 'preview'>('food')
  
  // Public/Private toggle
  const [isPublic, setIsPublic] = useState(true)
  
  // BeReal-like features
  const [dualMode, setDualMode] = useState(true) // Dual capture enabled by default
  const [btsMode, setBtsMode] = useState(true) // Behind The Scenes enabled by default
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [captureMetadata, setCaptureMetadata] = useState<CaptureMetadata>({
    retakes: 0,
    captureTime: new Date(),
    isLate: false,
    btsVideoUri: null,
  })
  
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const btsBufferRef = useRef<Video | null>(null)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  const fetchRestaurants = async () => {
    const { data } = await supabase
      .from('restaurants')
      .select('id, name, name_ja, cuisine_type')
      .limit(20)
    if (data) setRestaurants(data)
  }

  const startBtsRecording = async () => {
    if (!btsMode || !cameraRef.current) return
    
    try {
      setIsRecording(true)
      setRecordingDuration(0)
      
      // Start recording video for BTS (max 5 seconds)
      const video = await cameraRef.current.recordAsync({
        maxDuration: 5,
      })
      
      if (video?.uri) {
        setBtsVideoUri(video.uri)
      }
      
      // Timer to track recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        stopBtsRecording()
      }, 5000)
      
    } catch (error) {
      console.log('BTS recording error:', error)
      setIsRecording(false)
    }
  }

  const stopBtsRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    setIsRecording(false)
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return
    
    // Stop BTS recording if active
    if (isRecording) {
      await stopBtsRecording()
      await cameraRef.current.stopRecording()
    }
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: true, // No filters - raw buffer
      })
      
      if (photo?.uri) {
        // Update metadata
        setCaptureMetadata(prev => ({
          ...prev,
          captureTime: new Date(),
          retakes: prev.retakes + 1,
        }))
        
        // BeReal flow: food -> selfie -> preview
        if (captureStep === 'food') {
          // Food photo captured, now switch to front camera for selfie
          setCapturedImage(photo.uri)
          setFacing('front')
          setCaptureStep('selfie')
          
          // Show brief instruction
          Alert.alert(
            'Take Your Selfie!',
            'Point the camera at yourself for the BeReal-style overlay',
            [{ text: 'OK' }]
          )
        } else if (captureStep === 'selfie') {
          // Selfie captured, now show preview
          setCapturedFrontImage(photo.uri)
          setCaptureStep('preview')
          setScreen('preview')
        }
      }
    } catch (error) {
      console.error('Capture error:', error)
    }
  }

  const handleCountdownCapture = () => {
    // Skip countdown for selfie - capture immediately
    if (captureStep === 'selfie') {
      handleCapture()
      return
    }
    
    // 3-second countdown for food capture
    let count = 3
    setCountdown(count)
    
    // Start BTS recording when countdown begins (only for food capture)
    if (btsMode && captureStep === 'food') {
      startBtsRecording()
    }
    
    const interval = setInterval(() => {
      count--
      if (count === 0) {
        clearInterval(interval)
        setCountdown(null)
        handleCapture()
      } else {
        setCountdown(count)
      }
    }, 1000)
  }

  const handleRetake = () => {
    // Reset capture flow - go back to food capture
    setCaptureStep('food')
    setFacing('back')
    setCapturedImage(null)
    setCapturedFrontImage(null)
    setBtsVideoUri(null)
    setScreen('camera')
    setRating(0)
    setCaption('')
    setSelectedRestaurant(null)
  }

  const handlePickImage = async () => {
    // BeReal-style: Disable gallery access during capture window
    // But allow if explicitly requested (for importing old photos)
    Alert.alert(
      'Import Photo',
      'BeReal-style cameras are closed loops. You can only capture with the camera.',
      [{ text: 'OK' }]
    )
    return
    
    // The code below is disabled to enforce BeReal-like constraints
    // const result = await ImagePicker.launchImageLibraryAsync({ ... })
  }

  const handleSavePost = async () => {
    if (!user || !capturedImage) return
    
    setSaving(true)
    try {
      // Upload main image
      const imageName = `${user.id}/${Date.now()}.jpg`
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(imageName, blob, {
          contentType: 'image/jpeg',
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(imageName)

      // Upload front image if exists
      let frontImageUrl = null
      if (capturedFrontImage) {
        const frontImageName = `${user.id}/${Date.now()}_front.jpg`
        const frontResponse = await fetch(capturedFrontImage)
        const frontBlob = await frontResponse.blob()
        
        const { data: frontUploadData, error: frontUploadError } = await supabase.storage
          .from('posts')
          .upload(frontImageName, frontBlob, {
            contentType: 'image/jpeg',
          })
        
        if (!frontUploadError) {
          const { data: { publicUrl: frontUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(frontImageName)
          frontImageUrl = frontUrl
        }
      }

      // Prepare metadata (BeReal-style)
      const postMetadata = {
        retakes: captureMetadata.retakes,
        captureTime: captureMetadata.captureTime.toISOString(),
        isLate: captureMetadata.isLate,
        hasBts: !!btsVideoUri,
      }

      // Insert post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          front_image_url: frontImageUrl,
          bts_video_url: null,
          caption: caption,
          rating: rating,
          dish_name: caption,
          metadata: postMetadata,
          is_public: isPublic,
        })

      if (postError) throw postError

      Alert.alert('Success', 'Your HARA has been shared!')
      router.push('/(tabs)')
      
    } catch (error) {
      console.error('Save error:', error)
      Alert.alert('Error', 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const toggleDualMode = () => {
    setDualMode(!dualMode)
    if (!dualMode) {
      // Switching to dual mode
      setFacing('back')
    }
  }

  const toggleBtsMode = () => {
    setBtsMode(!btsMode)
  }

  // Permission handling
  if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            HARA needs camera access to capture your food moments.
            Microphone is needed for BTS audio.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.permissionButton} onPress={requestMicPermission}>
            <Text style={styles.permissionButtonText}>Grant Mic Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Camera Screen
  if (screen === 'camera') {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        {/* Camera View */}
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash ? 'on' : 'off'}
        >
          {/* Top Controls */}
          <View style={styles.topControls}>
            {/* Flash */}
            <TouchableOpacity 
              style={[styles.controlButton, flash && styles.controlButtonActive]}
              onPress={() => setFlash(!flash)}
            >
              <Text style={styles.controlEmoji}>⚡</Text>
            </TouchableOpacity>
            
            {/* BTS Mode Indicator */}
            {btsMode && (
              <View style={styles.btsIndicator}>
                <Text style={styles.btsText}>REC {isRecording ? `●` : '○'}</Text>
              </View>
            )}
            
            {/* Dual Mode */}
            <TouchableOpacity 
              style={[styles.controlButton, dualMode && styles.controlButtonActive]}
              onPress={toggleDualMode}
            >
              <Text style={styles.controlEmoji}>↻</Text>
            </TouchableOpacity>
          </View>

          {/* Countdown Overlay */}
          {countdown && (
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          {/* Instruction based on capture step */}
          <View style={styles.instructionOverlay}>
            {captureStep === 'food' ? (
              <View style={styles.instructionBadge}>
                <Text style={styles.instructionText}>Tap to capture</Text>
              </View>
            ) : (
              <View style={[styles.instructionBadge, styles.instructionBadgeSelfie]}>
                <Text style={styles.instructionText}>Now take your selfie</Text>
              </View>
            )}
          </View>

          {/* Captured Food Preview (shown during selfie mode) */}
          {captureStep === 'selfie' && capturedImage && (
            <View style={styles.foodPreviewContainer}>
              <Image source={{ uri: capturedImage }} style={styles.foodPreviewImage} />
              <Text style={styles.foodPreviewLabel}>Food captured!</Text>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Side Buttons - only show during food capture */}
            {captureStep === 'food' && (
              <TouchableOpacity 
                style={[styles.sideButton, btsMode && styles.sideButtonActive]}
                onPress={toggleBtsMode}
              >
                <Text style={styles.sideButtonEmoji}>●</Text>
                <Text style={styles.sideButtonText}>BTS</Text>
              </TouchableOpacity>
            )}

            {/* Placeholder for alignment */}
            {captureStep === 'selfie' && <View style={styles.sideButton} />}

            {/* Capture Button */}
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={handleCountdownCapture}
            >
              <View style={styles.captureButtonOuter}>
                <View style={[
                  styles.captureButtonInner,
                  captureStep === 'selfie' && styles.captureButtonInnerSelfie
                ]} />
              </View>
            </TouchableOpacity>

            {/* Flip Camera - only show during food capture */}
            {captureStep === 'food' ? (
              <TouchableOpacity 
                style={styles.sideButton}
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              >
                <Text style={styles.sideButtonEmoji}>↻</Text>
                <Text style={styles.sideButtonText}>Flip</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.sideButton} />
            )}
          </View>

          {/* Metadata Display */}
          <View style={styles.metadataDisplay}>
            <Text style={styles.metadataText}>
              {captureMetadata.retakes > 0 && `${captureMetadata.retakes} retake${captureMetadata.retakes > 1 ? 's' : ''} · `}
              {new Date().toLocaleTimeString()}
            </Text>
          </View>
        </CameraView>

        {/* Filter-Free Notice */}
        <View style={styles.filterNotice}>
          <Text style={styles.filterNoticeText}>No filters · Raw capture</Text>
        </View>
      </View>
    )
  }

  // Preview Screen
  if (screen === 'preview') {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <ScrollView style={styles.previewScroll} contentContainerStyle={styles.previewContent}>
          {/* Main Image (Back Camera) */}
          {capturedImage && (
            <View style={styles.previewImageContainer}>
              <Image source={{ uri: capturedImage }} style={styles.previewImage} />
              
              {/* Front Camera Overlay (Picture-in-Picture) */}
              {capturedFrontImage && (
                <View style={styles.pipOverlay}>
                  <Image source={{ uri: capturedFrontImage }} style={styles.pipImage} />
                </View>
              )}
            </View>
          )}

          {/* BTS Video Preview */}
          {btsVideoUri && (
            <View style={styles.btsPreview}>
              <Text style={styles.btsPreviewLabel}>BTS</Text>
              <Video
                source={{ uri: btsVideoUri }}
                style={styles.btsVideo}
                shouldPlay
                isLooping
                resizeMode={ResizeMode.COVER}
              />
            </View>
          )}

          {/* Metadata Display */}
          <View style={styles.previewMetadata}>
            <Text style={styles.previewMetadataText}>
              {captureMetadata.retakes} retake{captureMetadata.retakes !== 1 ? 's' : ''}
              {btsVideoUri && ' · Has BTS'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={() => setScreen('rate')}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }

  // Rate Screen
  if (screen === 'rate') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.rateContent}>
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.rateImage} />
          )}
          
          <Text style={styles.rateTitle}>Rate this dish</Text>
          
          {/* Star Rating - Interactive Full Width */}
          <View style={styles.ratingSliderContainer}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => {
                const fillPercent = Math.min(100, Math.max(0, (rating - star + 1) * 100))
                return (
                  <TouchableOpacity 
                    key={star} 
                    style={styles.starButton}
                    onPress={() => setRating(star)}
                    onLongPress={() => {
                      const halfRating = star - 0.5
                      if (halfRating >= 0) setRating(halfRating)
                    }}
                  >
                    <Text style={[
                      styles.starIcon,
                      fillPercent >= 100 && styles.starFilled,
                      fillPercent > 0 && fillPercent < 100 && styles.starHalfFilled,
                      fillPercent === 0 && styles.starEmpty
                    ]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <Text style={styles.ratingValue}>{rating.toFixed(1)} / 5.0</Text>
            <Text style={styles.ratingHint}>Tap: full star • Hold: half star</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.continueButton, { marginTop: 30 }]} 
            onPress={() => setScreen('details')}
          >
            <Text style={styles.continueButtonText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  // Details Screen
  if (screen === 'details') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.detailsContent}>
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.detailsImage} />
          )}
          
          <Text style={styles.detailsTitle}>Add details</Text>
          
          {/* Restaurant Search */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Restaurant</Text>
            <TextInput
              style={styles.input}
              placeholder="Search restaurant..."
              placeholderTextColor={theme.muted}
              value={restaurantSearch}
              onChangeText={(text) => {
                setRestaurantSearch(text)
                setShowRestaurantList(text.length > 0)
              }}
              onFocus={() => setShowRestaurantList(true)}
            />
            
            {showRestaurantList && restaurantSearch.length > 0 && (
              <ScrollView style={styles.restaurantList} nestedScrollEnabled>
                {restaurants
                  .filter(r => r.name.toLowerCase().includes(restaurantSearch.toLowerCase()))
                  .map((restaurant) => (
                    <TouchableOpacity
                      key={restaurant.id}
                      style={styles.restaurantItem}
                      onPress={() => {
                        setSelectedRestaurant(restaurant)
                        setRestaurantSearch(restaurant.name)
                        setShowRestaurantList(false)
                      }}
                    >
                      <Text style={styles.restaurantName}>{restaurant.name}</Text>
                      <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            )}
          </View>
          
          {/* Caption / Dish Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Dish / Caption</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What are you eating?"
              placeholderTextColor={theme.muted}
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Public / Private Toggle */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Who can see this?</Text>
            <View style={styles.privacyToggle}>
              <TouchableOpacity 
                style={[
                  styles.privacyOption,
                  isPublic && styles.privacyOptionActive
                ]}
                onPress={() => setIsPublic(true)}
              >
                <View style={[styles.privacyIndicator, isPublic && styles.privacyIndicatorActive]} />
                <Text style={[
                  styles.privacyText,
                  isPublic && styles.privacyTextActive
                ]}>Public</Text>
                <Text style={styles.privacySubtext}>Anyone can discover</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.privacyOption,
                  !isPublic && styles.privacyOptionActive
                ]}
                onPress={() => setIsPublic(false)}
              >
                <View style={[styles.privacyIndicator, !isPublic && styles.privacyIndicatorActive]} />
                <Text style={[
                  styles.privacyText,
                  !isPublic && styles.privacyTextActive
                ]}>Friends Only</Text>
                <Text style={styles.privacySubtext}>Only followers see</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSavePost}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Share HARA</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: theme.accent,
  },
  controlEmoji: {
    fontSize: 20,
  },
  btsIndicator: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  btsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pipContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
  },
  pipPreview: {
    width: 80,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  pipText: {
    color: '#FFF',
    fontSize: 12,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '200',
    color: '#FFF',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  sideButton: {
    alignItems: 'center',
    gap: 4,
  },
  sideButtonActive: {
    // Active state
  },
  sideButtonEmoji: {
    fontSize: 24,
  },
  sideButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  captureButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  metadataDisplay: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  metadataText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  filterNotice: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
  },
  filterNoticeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  
  // Instruction overlay
  instructionOverlay: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
  },
  instructionBadgeSelfie: {
    backgroundColor: theme.accent,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Food preview during selfie mode
  foodPreviewContainer: {
    position: 'absolute',
    top: 200,
    left: 20,
    alignItems: 'center',
  },
  foodPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  foodPreviewLabel: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  // Selfie capture button style
  captureButtonInnerSelfie: {
    backgroundColor: theme.accent,
  },
  
  // Preview styles
  previewScroll: {
    flex: 1,
  },
  previewContent: {
    padding: 20,
  },
  previewImageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 20,
  },
  pipOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  pipImage: {
    width: '100%',
    height: '100%',
  },
  btsPreview: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.card,
  },
  btsPreviewLabel: {
    color: theme.cream,
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
  },
  btsVideo: {
    width: '100%',
    height: 200,
  },
  previewMetadata: {
    marginTop: 16,
    alignItems: 'center',
  },
  previewMetadataText: {
    color: theme.muted,
    fontSize: 13,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: theme.card,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: theme.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: theme.accent,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Rate styles
  rateContent: {
    padding: 20,
    alignItems: 'center',
  },
  rateImage: {
    width: width - 40,
    height: 300,
    borderRadius: 20,
  },
  rateTitle: {
    color: theme.cream,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingSliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  ratingHint: {
    color: theme.muted,
    fontSize: 14,
    marginTop: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  starButton: {
    padding: 8,
  },
  starIcon: {
    fontSize: 48,
  },
  starFilled: {
    color: theme.gold,
  },
  starHalfFilled: {
    color: theme.gold,
  },
  starEmpty: {
    color: theme.border,
  },
  ratingValue: {
    color: theme.cream,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  star: {
    fontSize: 48,
    color: theme.border,
  },
  starActive: {
    color: theme.gold,
  },
  
  // Details styles
  detailsContent: {
    padding: 20,
  },
  detailsImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  detailsTitle: {
    color: theme.cream,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: theme.textSub,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    color: theme.cream,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  restaurantList: {
    maxHeight: 200,
    backgroundColor: theme.card,
    borderRadius: 12,
    marginTop: 4,
  },
  restaurantItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  restaurantName: {
    color: theme.cream,
    fontSize: 14,
    fontWeight: '600',
  },
  restaurantCuisine: {
    color: theme.muted,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: theme.accent,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Privacy toggle styles
  privacyToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  privacyOption: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyOptionActive: {
    borderColor: theme.accent,
    backgroundColor: 'rgba(232, 69, 44, 0.1)',
  },
  privacyIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.muted,
    marginBottom: 8,
  },
  privacyIndicatorActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  privacyEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  privacyText: {
    color: theme.textSub,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyTextActive: {
    color: theme.accent,
  },
  privacySubtext: {
    color: theme.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  
  // Permission styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  permissionTitle: {
    color: theme.cream,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    color: theme.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: theme.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
