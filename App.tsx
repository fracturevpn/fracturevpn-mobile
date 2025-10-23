import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { ethers } from 'ethers';

const TIERS_CONTRACT = "0xYourTiersContract";
const FVPN_CONTRACT = "0xF4c7...";
const ABI = [/* Paste full ABI from Remix */];

export default function App() {
  const [tier, setTier] = useState<'Free' | 'Pro' | 'Ultimate'>('Free');
  const [wallet, setWallet] = useState('');

  useEffect(() => {
    if (wallet) loadTier();
  }, [wallet]);

  const loadTier = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(TIERS_CONTRACT, ABI, provider);
    const t = await contract.getTier(wallet);
    setTier(t);
  };

  const upgrade = async (plan: 'pro' | 'ultimate') => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(TIERS_CONTRACT, ABI, signer);

    try {
      const tx = plan === 'pro' 
        ? await contract.upgradeToPro()
        : await contract.upgradeToUltimate();
      await tx.wait();
      Alert.alert("Success", `${plan.toUpperCase()} activated!`);
      setTier(plan === 'pro' ? 'Pro' : 'Ultimate');
    } catch (e) {
      Alert.alert("Error", "Payment failed");
    }
  };

  const shards = tier === 'Free' ? 3 : tier === 'Pro' ? 5 : 7;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FractureVPN</Text>
      <Text style={styles.tier}>Tier: {tier} ({shards} shards)</Text>

      <TouchableOpacity style={styles.connectBtn} onPress={() => Alert.alert("Connected", "Auto-optimized")}>
        <Text style={styles.btnText}>Connect</Text>
      </TouchableOpacity>

      <View style={styles.upgradeRow}>
        <TouchableOpacity style={styles.upgradeBtn} onPress={() => upgrade('pro')}>
          <Text style={styles.upgradeText}>Pro — $0.10</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.upgradeBtn} onPress={() => upgrade('ultimate')}>
          <Text style={styles.upgradeText}>Ultimate — $0.50</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.info}>Auto-node switching: ON</Text>
      <Text style={styles.info}>Streaming: Auto-optimized</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 36, color: '#ef4444', fontWeight: 'bold' },
  tier: { fontSize: 20, color: '#f3f4f6', marginVertical: 20 },
  connectBtn: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, width: '80%', alignItems: 'center', marginBottom: 30 },
  btnText: { color: 'white', fontWeight: '600' },
  upgradeRow: { flexDirection: 'row', gap: 10, width: '80%' },
  upgradeBtn: { backgroundColor: '#1e293b', padding: 14, borderRadius: 12, flex: 1, alignItems: 'center' },
  upgradeText: { color: '#ef4444', fontWeight: '600' },
  info: { fontSize: 14, color: '#6b7280', marginTop: 10 }
});
