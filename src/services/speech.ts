import * as Speech from 'expo-speech';

export const speak = async (text: string, language: string = 'English'): Promise<void> => {
  try {
    const languageCode = getLanguageCode(language);
    
    // Check if speech is available
    const availableVoices = await Speech.getAvailableVoicesAsync();
    console.log('Available voices:', availableVoices.length);
    
    // Find a compatible voice or fallback to default
    let voiceOptions: any = {
      rate: 0.8,
      pitch: 1.0,
    };
    
    // Try to find the best quality voice for the language
    // Prefer newer, more natural sounding voices
    const preferredVoiceNames = ['Siri', 'Nova', 'Allison', 'Samantha', 'Alex', 'Victoria'];
    
    let compatibleVoice = availableVoices.find(voice => 
      voice.language.startsWith(languageCode.split('-')[0]) && 
      preferredVoiceNames.some(preferred => voice.name?.includes(preferred))
    );
    
    // If no preferred voice found, use any compatible voice
    if (!compatibleVoice) {
      compatibleVoice = availableVoices.find(voice => 
        voice.language.startsWith(languageCode.split('-')[0])
      );
    }
    
    if (compatibleVoice) {
      voiceOptions.voice = compatibleVoice.identifier;
      console.log('Using voice:', compatibleVoice.name, compatibleVoice.language);
    } else {
      // Fallback: try with just language code, no specific voice
      voiceOptions.language = languageCode;
      console.log('Using language fallback:', languageCode);
    }
    
    // If no compatible voice found, use default system voice
    if (!compatibleVoice && availableVoices.length > 0) {
      console.log('Using default system voice');
      delete voiceOptions.language; // Let system choose
    }
    
    await Speech.speak(text, voiceOptions);
    
  } catch (error) {
    console.error('Speech error:', error);
    
    // Fallback: try with minimal options
    try {
      await Speech.speak(text, { rate: 0.8 });
      console.log('Fallback speech succeeded');
    } catch (fallbackError) {
      console.error('Fallback speech failed:', fallbackError);
      throw new Error('Speech service unavailable');
    }
  }
};

export const stopSpeaking = (): void => {
  try {
    Speech.stop();
    console.log('Speech stopped successfully');
  } catch (error) {
    console.error('Failed to stop speech:', error);
  }
};

export const getAvailableLanguages = (): Promise<Speech.Voice[]> => {
  return Speech.getAvailableVoicesAsync();
};

const getLanguageCode = (language: string): string => {
  const codes: Record<string, string> = {
    'English': 'en-US',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Italian': 'it-IT',
    'Portuguese': 'pt-BR',
    'Japanese': 'ja-JP',
    'Chinese': 'zh-CN',
    'Korean': 'ko-KR',
    'Russian': 'ru-RU',
    'Arabic': 'ar-SA',
    'Hindi': 'hi-IN',
    'Dutch': 'nl-NL',
    'Swedish': 'sv-SE',
    'Norwegian': 'no-NO',
    'Danish': 'da-DK'
  };
  return codes[language] || 'en-US';
};

export const getSupportedLanguages = (): string[] => {
  return [
    'Spanish',
    'French', 
    'German',
    'Italian',
    'Portuguese',
    'Japanese',
    'Chinese',
    'Korean',
    'Russian',
    'Arabic',
    'Hindi',
    'Dutch',
    'Swedish',
    'Norwegian',
    'Danish'
  ];
};