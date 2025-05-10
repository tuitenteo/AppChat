import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registerUser } from '../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Register() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!username || !phone || !password || !email) {
      Alert.alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await registerUser({ username, phone, password, email });
      Alert.alert('Đăng ký thành công! Mời bạn đăng nhập');
      navigation.navigate('Đăng nhập');
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert(
        'Lỗi đăng ký',
        err.response?.data?.error || 'Không thể đăng ký'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Tên đăng nhập"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="call" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Số điện thoại"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
          style={styles.input}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#555" style={styles.icon} />
        <TextInput
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF', // Màu nền xanh nhạt rất nhẹ
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748', // Màu chữ xám đậm
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7', // Viền nhẹ
  },
  icon: {
    marginRight: 12,
    color: '#718096', // Màu icon xám trung bình
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A202C', // Màu chữ đen nhẹ
    paddingVertical: 2,
    fontFamily: 'System', // Sử dụng font hệ thống mặc định
  },
  button: {
    backgroundColor: '#4C6EF5', // Màu xanh dương đậm
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4C6EF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerText: {
    textAlign: 'center',
    color: '#4A5568',
    marginTop: 24,
    fontSize: 15,
  },
  loginLink: {
    color: '#4C6EF5',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

