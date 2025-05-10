// import React from "react";
// import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import Login from "./screens/Login";
// import Register from "./screens/Register";
// import Chat from "./screens/Chat";
// import ChatDetail from "./screens/ChatDetail"; 
// import ForgotAndResetPass from "./screens/ForgotAndResetPass";
// import NewChat from "./screens/NewChat";
// import Account from "./screens/Account";
// import { AuthProvider, useAuth } from "./context/AuthContext";

// const Stack = createNativeStackNavigator();

// const AppTheme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     primary: '#2563EB',       // Màu chính xanh dương
//     background: '#F8FAFC',    // Nền sáng xám nhạt
//     card: '#FFFFFF',          // Nền header/card
//     text: '#1E293B',         // Màu chữ chính
//     border: '#E2E8F0',       // Màu viền
//     notification: '#F97316', // Màu thông báo (cam)
//   },
// };
// // Bọc phần điều hướng trong một component con để dùng hook
// function MainNavigator() {
//   const { token, setToken } = useAuth(); // Lấy token từ context

//   return (
//     <Stack.Navigator initialRouteName={token ? "Trang chủ" : "Đăng nhập"}
//     screenOptions={{
//       headerStyle: {
//         backgroundColor: AppTheme.colors.card,
//       },
//       headerTintColor: AppTheme.colors.primary,
//       headerTitleStyle: {
//         fontWeight: '600',
//       },
//       headerShadowVisible: true,
//       contentStyle: {
//         backgroundColor: AppTheme.colors.background,
//       },
//       animation: 'slide_from_right',
//     }}>
//       {token ? (
//         <>
     
//           <Stack.Screen name="Trang chủ" component={Chat} />
//           <Stack.Screen name="Tài khoản" component={Account} />
//           <Stack.Screen name="Tìm kiếm" component={NewChat} />
//           <Stack.Screen name="Trong cuộc trò chuyện" component={ChatDetail} />
//         </>
//       ) : (
//         <>
//           <Stack.Screen name="Đăng nhập" component={Login} />
//           <Stack.Screen name="Quên mật khẩu" component={ForgotAndResetPass} />
//           <Stack.Screen name="Đăng ký" component={Register} />
//         </>
//       )}
//     </Stack.Navigator>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <NavigationContainer  theme={AppTheme}>
//         <MainNavigator />
//       </NavigationContainer>
//     </AuthProvider>
//   );
// }


import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Chat from "./screens/Chat";
import ChatDetail from "./screens/ChatDetail";
import ForgotAndResetPass from "./screens/ForgotAndResetPass";
import NewChat from "./screens/NewChat";
import Account from "./screens/Account";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createNativeStackNavigator();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4A6FA5',       // Màu chính xanh dương nhạt 
    background: '#F5F7FA',    // Nền sáng xám nhạt mềm mại
    card: '#FFFFFF',          // Nền header/card
    text: '#2D3748',         // Màu chữ chính (xám đậm)
    border: '#E2E8F0',       // Màu viền nhẹ
  
  },
};

function MainNavigator() {
  const { token } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={token ? "Trang chủ" : "Đăng nhập"}
      screenOptions={{
        headerStyle: {
          backgroundColor: AppTheme.colors.card,
          elevation: 0,       // Bỏ shadow trên Android
          shadowOpacity: 0,   // Bỏ shadow trên iOS
        },
        headerTintColor: AppTheme.colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: AppTheme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      {token ? (
        <>
          <Stack.Screen 
            name="Trang chủ" 
            component={Chat} 
            options={{ title: 'Trang chủ' }}
          />
          <Stack.Screen 
            name="Tài khoản" 
            component={Account} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="Tìm kiếm" 
            component={NewChat} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="Trong cuộc trò chuyện" 
            component={ChatDetail} 
            options={({ route }) => ({ 
              title: route.params.receiverName || 'Chat',
              headerBackTitle: 'Quay lại',
            })}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Đăng nhập" 
            component={Login} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Quên mật khẩu" 
            component={ForgotAndResetPass} 
            options={{ title: '' }}
          />
          <Stack.Screen 
            name="Đăng ký" 
            component={Register} 
            options={{ title: '' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={AppTheme.colors.background} 
      />
      <NavigationContainer theme={AppTheme}>
        <MainNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}