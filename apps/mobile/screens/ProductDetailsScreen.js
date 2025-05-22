import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import TopBackBar from '../components/TopBackBar';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProductDetailsScreen({ navigation, route }) {
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleContinue = () => {
    if (price && category && length && width && height && weight) {
      navigation.navigate('QuoteResults', {
        product: {
          price,
          category,
          dimensions: { length, width, height },
          weight,
        },
      });
    }
  };

  return (
    <LinearGradient
    colors={['#e6f3ff', '#739ccf']}
  style={{ flex: 1 }}
    >
      <TopBackBar />
      <ScrollView contentContainerStyle={[styles.container, { marginTop: 20, paddingBottom: 60 }]}>
        <Text style={styles.header}>Product Details</Text>

        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          placeholder="$ Enter price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Furniture"
          value={category}
          onChangeText={setCategory}
        />

        <Text style={styles.label}>Dimensions (cm)</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.dimInput}
            placeholder="Length"
            keyboardType="numeric"
            value={length}
            onChangeText={setLength}
          />
          <TextInput
            style={styles.dimInput}
            placeholder="Width"
            keyboardType="numeric"
            value={width}
            onChangeText={setWidth}
          />
          <TextInput
            style={styles.dimInput}
            placeholder="Height"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
        </View>

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter weight"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <TouchableOpacity
          style={[
            styles.button,
            !(price && category && length && width && height && weight) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!(price && category && length && width && height && weight)}
        >
          <Text style={styles.buttonText}>Get Quotes</Text>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/TABLE.jpeg')}
            style={styles.bottomImage}
            resizeMode="cover"
          />
          <Text style={styles.imageCaption}>Oak table combined with iron</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dimInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  imageContainer: {
    marginTop: 32,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 30,
  },
  bottomImage: {
    width: '100%',
    height: 180,
    borderRadius: 4,
  },
  imageCaption: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
});
