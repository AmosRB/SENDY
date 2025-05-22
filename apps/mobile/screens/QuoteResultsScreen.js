import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import TopBackBar from '../components/TopBackBar';

const mockQuotes = [
  {
    id: '1',
    company: 'GlobalFreight Ltd.',
    price: 145.00,
    eta: '5-7 days',
    contact: 'contact@globalfreight.com',
  },
  {
    id: '2',
    company: 'QuickShip Express',
    price: 168.50,
    eta: '3-5 days',
    contact: 'support@quickship.com',
  },
  {
    id: '3',
    company: 'BlueOcean Logistics',
    price: 132.75,
    eta: '7-10 days',
    contact: 'info@blueocean.com',
  },
  {
    id: '4',
    company: 'ArrowCargo Intl.',
    price: 159.00,
    eta: '4-6 days',
    contact: 'hello@arrowcargo.com',
  },
];

export default function QuoteResultsScreen({ navigation, route }) {
  const { product } = route.params || {};

  const renderItem = ({ item }) => {
    // Override email address for specific items
    let email = item.contact;
    if (item.id === '1') {
      email = 'amosbahar@gmail.com';
    } else if (item.id === '4') {
      email = 'oferahrek@gmail.com';
    }

    return (
      <View style={styles.card}>
        <Text style={styles.company}>{item.company}</Text>
        <Text style={styles.detail}>💵 ${item.price.toFixed(2)} | 📦 ETA: {item.eta}</Text>
        <Text style={styles.contact}>📧 {email}</Text>
       <TouchableOpacity
  style={styles.button}
  onPress={() => {
    const subject = encodeURIComponent('מאשר את הצעת המחיר');
    const body = encodeURIComponent(
      `שלום,\n\nאני מאשר את הצעת המחיר הבאה:\n\n` +
      `חברה: ${item.company}\n` +
      `מחיר: $${item.price.toFixed(2)}\n` +
      `זמן אספקה: ${item.eta}\n\nתודה.`
    );
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  }}
>
  <Text style={styles.buttonText}>Contact</Text>
</TouchableOpacity>

      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ebebeb' }}>
      <TopBackBar />
      <View style={styles.innerContainer}>
        <Text style={styles.header}>Available Quotes</Text>
        <FlatList
          data={mockQuotes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 60, marginTop: 12 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    padding: 20,
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  company: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  detail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  contact: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
