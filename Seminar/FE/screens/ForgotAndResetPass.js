import React, { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { forgotPassword, resetPassword } from '../services/api';

export default function ForgotAndResetPass({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const detectVia = (input) => {
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^[0-9]{9,15}$/;
    if (emailRegex.test(input.trim())) return 'email';
    if (phoneRegex.test(input.trim())) return 'phone';
    return null;
  };

  const requestOTP = async () => {
    const method = detectVia(identifier);
    if (!method) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng định dạng email hoặc số điện thoại.');
      return;
    }

    try {
      const response = await forgotPassword(identifier, method);
      if (response.otp) {
        Alert.alert('Thành công', `Mã OTP đã được gửi: ${response.otp}`);
      }
      setOtpSent(true);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không gửi được mã OTP');
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(identifier, otp, newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được cập nhật');
      navigation.navigate('Đăng nhập');
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không thể đặt lại mật khẩu');
    }
  };

  return (
    <View style={styles.container}>
      {!otpSent ? (
        <>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.label}>Nhập email hoặc số điện thoại:</Text>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            style={styles.input}
            placeholder="Email hoặc số điện thoại"
          />
          <TouchableOpacity style={styles.button} onPress={requestOTP}>
            <Text style={styles.buttonText}>Gửi mã OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.label}>Mã OTP</Text>
          <TextInput
            value={otp}
            keyboardType="number-pad"
            onChangeText={setOtp}
            style={styles.input}
            placeholder="Mã OTP"
          />
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
            placeholder="Mật khẩu mới"
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Màu nền sáng và nhẹ nhàng
    padding: 80, // Thêm padding để các phần tử không quá sát nhau
  },
  title: {
    fontSize: 28, // Tăng kích thước chữ để nổi bật hơn
    fontWeight: '700', // Font-weight mạnh hơn để tạo cảm giác chắc chắn
    marginBottom: 20, // Giảm khoảng cách dưới tiêu đề
    textAlign: 'center',
    color: '#1D4ED8', // Màu xanh đậm dễ nhìn hơn
  },
  label: {
    fontSize: 16, // Tăng kích thước chữ để dễ đọc
    marginBottom: 8, // Thêm khoảng cách giữa label và input
    color: '#333',
    fontWeight: '600', // Làm chữ đậm hơn để dễ nhìn
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#E0E0E0', // Màu border nhạt hơn, nhẹ nhàng hơn
    borderWidth: 1.5, // Tăng độ dày của border để dễ nhìn
    paddingVertical: 12, // Tăng chiều cao của input để thoải mái nhập liệu
    paddingHorizontal: 16,
    borderRadius: 12, // Góc bo tròn nhẹ nhàng
    marginBottom: 20, // Thêm khoảng cách giữa các input
    fontSize: 16, // Tăng kích thước chữ trong input
  },
  button: {
    backgroundColor: '#1D4ED8', // Màu xanh đậm phù hợp với tiêu đề
    paddingVertical: 14,
    borderRadius: 12, // Góc bo tròn của button
    alignItems: 'center',
    marginTop: 12, // Thêm khoảng cách trên button
    shadowColor: '#1D4ED8', 
    shadowOffset: { width: 0, height: 4 }, // Tăng độ đổ bóng để tạo chiều sâu
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5, // Thêm độ nổi bật
  },
  buttonText: {
    color: '#fff',
    fontSize: 18, // Tăng kích thước chữ của button
    fontWeight: '600', // Làm chữ đậm hơn để dễ nhìn
  },
});
