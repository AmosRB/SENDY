// AutoProductDetailsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Image } from 'react-native';
import TopBackBar from '../components/TopBackBar';
import { LinearGradient } from 'expo-linear-gradient';

export default function AutoProductDetailsScreen({ navigation, route }) {
  const { link } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:4135/extract?url=${encodeURIComponent(link)}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [link]);

  return (
    <LinearGradient colors={["#e6f3ff", "#739ccf"]} style={{ flex: 1 }}>
      <TopBackBar />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Product Analysis</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : error ? (
          <Text style={styles.error}>❌ {error}</Text>
        ) : (
          <View style={styles.detailsBox}>
            <Detail label="Name" value={data.name} />
            <Detail label="Manufacturer" value={data.manufacturer} />
            <Detail label="Weight" value={data.weight} />
            <Detail label="Dimensions" value={data.dimensions} />
            <Detail label="CBM" value={data.cbm} />
            <Detail label="Shipping Origin" value={data.origin} />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const Detail = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 60,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  detailRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
