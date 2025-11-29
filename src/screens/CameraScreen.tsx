import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { analyzeScene, initVisionModel } from '../services/visionService';
import { speak, stopSpeaking } from '../services/speech';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isInitialized, setIsInitialized] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [description, setDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    initializeApp();
    
    // Cleanup function to stop audio when component unmounts
    return () => {
      if (isSpeaking) {
        stopSpeaking();
        console.log('Audio stopped due to component cleanup');
      }
    };
  }, []);

  // Effect to handle audio state changes
  useEffect(() => {
    return () => {
      // Additional cleanup for audio state changes
      if (isSpeaking) {
        stopSpeaking();
      }
    };
  }, [isSpeaking]);

  const initializeApp = async () => {
    try {
      console.log('Initializing SeeForMe Vision...');
      await initVisionModel();
      setIsInitialized(true);
      console.log('SeeForMe Vision initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize AI vision model. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleScan = async () => {
    if (!cameraRef.current || !isInitialized || isAnalyzing) {
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setHasScanned(false);
      
      // Stop any currently playing audio before starting new scan
      if (isSpeaking) {
        stopSpeaking();
        setIsSpeaking(false);
        console.log('Stopped previous audio for new scan');
      }
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      });
      
      if (!photo?.uri) {
        console.warn('No photo captured');
        return;
      }

      const result = await analyzeScene(photo.uri);
      
      if (isInitialized) {
        setDescription(result.description);
        setHasScanned(true);
        console.log('New description ready, previous audio stopped');
        console.log('hasScanned:', true);
        console.log('description:', result.description.substring(0, 50) + '...');
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      if (isInitialized) {
        setDescription('Unable to analyze the scene. Please try again.');
        setHasScanned(true);
      }
    } finally {
      if (isInitialized) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSpeakAgain = async () => {
    if (!description) return;
    
    // If currently speaking, stop the audio
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      console.log('Audio stopped by user');
      return;
    }
    
    // Start speaking the description
    try {
      setIsSpeaking(true);
      console.log('Starting to speak description');
      await speak(description, 'English');
      console.log('Audio playback completed');
    } catch (error) {
      console.error('Speech error:', error);
      Alert.alert(
        'Speech Unavailable', 
        'Text-to-speech is not available on this device.',
        [{ text: 'OK' }]
      );
    } finally {
      // Always reset speaking state when done or error occurs
      setIsSpeaking(false);
    }
  };

  const handleNewScan = () => {
    // Stop any playing audio before starting new scan
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      console.log('Audio stopped for new scan');
    }
    
    setHasScanned(false);
    setDescription('');
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            SeeForMe needs camera access to describe what you're looking at.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>GRANT ACCESS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingTitle}>SeeForMe</Text>
          <Text style={styles.loadingText}>Initializing AI vision...</Text>
        </View>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      />
      
      {/* Camera Overlay */}
      <View style={styles.cameraOverlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SeeForMe</Text>
          <TouchableOpacity 
            style={styles.flipCameraButton}
            onPress={toggleCameraFacing}
          >
            <Text style={styles.flipCameraButtonText}>⟲</Text>
          </TouchableOpacity>
        </View>


        {/* Results Overlay - Show when description is available */}
        {description ? (
          <View style={styles.resultsOverlay}>
            {/* Description Card */}
            <ScrollView 
              style={styles.descriptionCard}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.descriptionScrollContent}
            >
              <Text style={styles.descriptionText}>
                {description || 'No description available'}
              </Text>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtonsOverlay}>
              <TouchableOpacity 
                style={[styles.primaryButtonOverlay, isSpeaking && styles.primaryButtonOverlayActive]}
                onPress={handleSpeakAgain}
              >
                <Text style={[styles.primaryButtonText, isSpeaking && styles.primaryButtonTextActive]}>
                  {isSpeaking ? 'PAUSE' : 'SPEAK AGAIN'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButtonOverlay}
                onPress={handleNewScan}
              >
                <Text style={styles.secondaryButtonText}>NEW SCAN</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Center Content - Show when no results */}
            <View style={styles.centerContent}>
              <Text style={styles.instructionText}>
                Point your camera at something and tap scan
              </Text>
            </View>

            {/* Bottom Controls - Show when no results */}
            <View style={styles.bottomControls}>
              <TouchableOpacity 
                style={[styles.scanButton, isAnalyzing && styles.scanButtonDisabled]}
                onPress={handleScan}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : null}
                <Text style={styles.scanButtonText}>
                  {isAnalyzing ? 'Scanning...' : 'SCAN'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  flipCameraButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipCameraButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  instructionText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    paddingHorizontal: 40,
  },
  bottomControls: {
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 160,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  scanButtonDisabled: {
    backgroundColor: '#E5E5EA',
    opacity: 0.6,
  },
  scanButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  scanButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  resultsOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    maxHeight: height * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  descriptionScroll: {
    maxHeight: height * 0.3,
  },
  descriptionScrollContent: {
    paddingVertical: 10,
  },
  descriptionText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1D1D1F',
    textAlign: 'left',
    fontWeight: '400',
  },
  actionButtonsOverlay: {
    gap: 14,
  },
  primaryButtonOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonOverlayActive: {
    backgroundColor: 'rgba(28, 28, 30, 0.98)',
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  primaryButtonTextActive: {
    color: '#fff',
  },
  secondaryButtonOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  secondaryButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  permissionContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
    letterSpacing: -0.5,
  },
  permissionText: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 40,
    color: '#6C6C70',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    color: '#000',
    letterSpacing: -0.5,
  },
  loadingText: {
    fontSize: 17,
    color: '#6C6C70',
    textAlign: 'center',
  },
});