import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { updateUser, getUserInfo, deleteUser } from '../services/api';



export default function Account() {
  const { token, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Bắt đầu gọi API getUserInfo...');
        const userData = await getUserInfo(token);
        console.log('Dữ liệu user nhận được:', userData);
        setUser(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          password: '', // Để trống, nếu user nhấn vào chỉnh sửa và nhập lại 
        });
      } catch (error) {
        console.error('Lỗi khi load data:', error);
        Alert.alert('Lỗi', error.message || 'Không tải được thông tin');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateUser(token, formData);
      setIsEditing(false);
      Alert.alert('Thông báo', 'Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      Alert.alert('Lỗi', 'Cập nhật thông tin thất bại. Vui lòng thử lại.');
    }
  };
 
  const handleDeleteAccount = () => {

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tài khoản không? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await deleteUser(token);
              Alert.alert('Thông báo', 'Tài khoản đã được xóa.');
              logout();  // xóa xong đi lun
            } catch (error) {
              console.error('Lỗi khi xóa tài khoản:', error);
              Alert.alert('Lỗi', 'Không thể xóa tài khoản. Vui lòng thử lại.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) return <Text style={{ padding: 20 }}>Đang tải dữ liệu...</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tài khoản</Text>
        {isEditing ? (
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Lưu</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Ionicons name="pencil-outline" size={24} color="#4A6FA5" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Tên người dùng</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
            />
          ) : (
            <Text style={styles.value}>{formData.username}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.value}>{formData.email}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Số điện thoại</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.phone}
              keyboardType="phone-pad"
              onChangeText={(text) => handleChange('phone', text)}
            />
          ) : (
            <Text style={styles.value}>{formData.phone}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mật khẩu</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.password}
              secureTextEntry={true}
              onChangeText={(text) => handleChange('password', text)}
            />
          ) : (
            <Text style={styles.value}>******</Text>
          )}
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
  <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
</TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F4F8', // nền nhẹ nhàng
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A6FA5', // màu chủ đạo
  },
  saveButton: {
    color: '#4A6FA5',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
