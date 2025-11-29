import React from 'react';
import { StatusBar } from 'expo-status-bar';
import CameraScreen from './src/screens/CameraScreen';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <CameraScreen navigation={null as any} />
    </>
  );
}
