import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getConversations } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function Chat({ navigation }) {
  const { token, logout, userId } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations(token);

      if (data && Array.isArray(data)) {
        const sorted = data.sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );
        setConversations(sorted);
      } else {
        console.log('Invalid data:', data);
      }
    } catch (err) {
      console.log('Error fetching data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchConversations();
  // }, []);

  //call fetch.. mỗi lần qlay màn hình
  useFocusEffect(
    React.useCallback(() => { // useCallback giữ nguyên function giữa các lần render
      //Dùng useCallback là để "ghi nhớ" function cũ, tránh tạo lại không cần thiết, từ đó tránh re-render thừa.
      fetchConversations();
    }, [])
  );

  const handleLogout = () => {
    setShowSettings(false);
    logout();
  };

  const renderItem = ({ item }) => {
    const displayName = item.partnername || 'Không rõ tên';
    const formattedTime = item.lastmessagetime
      ? new Date(item.lastmessagetime).toLocaleString()
      : '';

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Trong cuộc trò chuyện', {
            receiverId: item.id,
            receiverName: displayName, // hiển thị tên người dùng trong cuộc trò chuyện
          })
        }
      >
        <View style={styles.conversationItem}>
          <Text style={styles.conversationName}>{displayName}</Text>
          <Text numberOfLines={1} style={styles.conversationMessage}>
            {item.lastmessage || 'Chưa có tin nhắn'}
          </Text>
          <Text style={styles.conversationTime}>{formattedTime}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Tin nhắn gần đây</Text>
        <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
          <Ionicons name="settings-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {showSettings && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            onPress={() => {
              setShowSettings(false);
              navigation.navigate('Tài khoản');
            }}
            style={styles.menuItem}
          >
            <Ionicons name="person-circle-outline" size={20} color="#4A6FA5" />
            <Text style={styles.menuText}>Tài khoản</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
            <Ionicons name="log-out-outline" size={20} color="red" />
            <Text style={[styles.menuText, { color: 'red' }]}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      )}
      

      <TouchableOpacity
        onPress={() => navigation.navigate('Tìm kiếm')}
        style={styles.findFriendButton}
      >
        <Ionicons name="person-add-outline" size={20} color="white" />
        <Text style={styles.findFriendText}>Tìm bạn bè</Text>
      </TouchableOpacity>

      {conversations.length === 0 ? (
        <Text style={styles.noChatText}>Không có cuộc trò chuyện nào</Text>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAF4EF', // nền kem nhạt
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5B3A29', // nâu đất đậm
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
    width: 180,
    borderWidth: 1,
    borderColor: '#E4DCD5', // viền beige xám nhẹ
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#594A42', // nâu xám
  },
  conversationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A6FA5', // màu vàng nâu nổi bật
    shadowColor: '#C8B8A8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  conversationName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#5B3A29',
    marginBottom: 6,
  },
  conversationMessage: {
    fontSize: 14,
    color: '#786960',
    marginBottom: 6,
    lineHeight: 20,
  },
  conversationTime: {
    fontSize: 12,
    color: '#A49788',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  findFriendButton: {
    backgroundColor: '#4A6FA5', // xanh rêu
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C8B6F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  findFriendText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  noChatText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#B0A8A0',
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF4EF',
  },
});
