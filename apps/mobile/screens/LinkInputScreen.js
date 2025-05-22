import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LinkInputScreen({ navigation }) {
  const [link, setLink] = useState('');

  const handleContinue = () => {
    if (link.trim()) {
      navigation.navigate('ProductDetails', { link });
    }
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#6c9fcf']}
  locations={[0, 0.66, 1]}
  style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image source={require('../assets/SENDYicon.png')} style={styles.logo} />
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Get a Shipping Quote</Text>
        <Text style={styles.subtitle}>Enter the product link</Text>

        <TextInput
          style={styles.input}
          placeholder="https://example.com/product"
          value={link}
          onChangeText={setLink}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, !link && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!link}
        >
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    flex: 0.35, // רבע עליון בערך
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
logo: {
  width: 208,
  height: 208,
  resizeMode: 'contain',
},

  form: {
    flex: 0.65,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
