import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // bộ nhớ vinhx viễn của thiết bị, nên có thể lưu token vào đây ngay cả khi user đóng ứng dụng
const AuthContext = createContext(); // context api để quản lý trạng thái đăng nhập toàn ứng dụng
export const AuthProvider = ({ children }) => { // AuthProvider là 1 component để bọc các component khác trong ứng dụng, cung cấp giá trị cho context ( đã bọc app.js ) để các component con khác biết đc là ai đang truy cập 
  const [authState, setAuthState] = useState({
    token: null, //user đã đăng nhập hay chưa
    isLoading: true
  });
  // Load token từ AsyncStorage khi mở app
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token'); // khi mở app lên thì sẽ load token (đã đc lưu từ trc nếu có) từ AsyncStorage để app k bắt đăng nhập lại
        setAuthState({
          token: storedToken,
          isLoading: false
        });
      } catch (err) {
        console.error("Lỗi khi load token:", err);
        setAuthState({
          token: null,
          isLoading: false
        });
      }
    };
    loadToken();
  }, []);

  const login = async (newToken) => {
    await AsyncStorage.setItem('token', newToken); // khi đnăg nhập lưu token vào AsyncStorage để khi lần sau mở app lên không cần đăng nhập lại
    setAuthState({
      token: newToken,
      isLoading: false
    });
  };
  const logout = async () => {
    await AsyncStorage.removeItem('token'); // và khi đăng xuất thì sẽ xóa token khỏi ÁsyncStorage\
    setAuthState({
      token: null,
      isLoading: false
    });
  };
  return (
    //AuthProvider là phát dữ liệu đó cho các component con trong ứng dụng
    //authcontext là context chính chứa dữ liệu muốn share
    <AuthContext.Provider value={{
      token: authState.token,
      isLoading: authState.isLoading,
      login,
      logout
    }}>
      {/* component nào nằm trong children đều có thể truy cập dữ liệu mà value đang chia sẻ -- token, logout, login */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


