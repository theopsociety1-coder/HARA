import { View, StyleSheet } from 'react-native'

interface HaraLogoProps {
  size?: number
}

export function HaraLogo({ size = 40 }: HaraLogoProps) {
  const tongueHeight = size * 0.5
  const tongueWidth = size * 0.4
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Smile - White arc */}
      <View 
        style={[
          styles.smile, 
          { 
            width: size * 0.8,
            borderRadius: size * 0.4,
            borderWidth: size * 0.04,
          }
        ]} 
      />
      
      {/* Tongue - Orange U shape */}
      <View 
        style={[
          styles.tongue,
          {
            width: tongueWidth,
            height: tongueHeight,
            borderRadius: tongueHeight / 2,
            left: (size - tongueWidth) / 2,
            top: size * 0.35,
          }
        ]}
      >
        {/* Median sulcus (midline slit) */}
        <View 
          style={[
            styles.tongueLine,
            {
              width: size * 0.03,
              height: tongueHeight * 0.6,
            }
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  smile: {
    position: 'absolute',
    top: '25%',
    borderColor: '#FFFFFF',
    borderTopWidth: 0,
  },
  tongue: {
    position: 'absolute',
    backgroundColor: '#FF8C00',
  },
  tongueLine: {
    position: 'absolute',
    backgroundColor: '#CC7000',
    left: '50%',
    marginLeft: -1,
    borderRadius: 2,
  },
})
