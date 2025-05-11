import { useRoute } from '@react-navigation/native';
import { useEffect, useState, useRef } from 'react'; // sử dụng useRef để scroll tự động
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, FlatList, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView  } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getMessages, sendMessage as sendMessageAPI } from '../services/api';



export default function ChatDetail() {
  const route = useRoute();
  const { receiverName, receiverId } = route.params;
  const { token, userId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null); //scroll tự động khi tn mới 
  const [isAtBottom, setIsAtBottom] = useState(true);

  const fetchMessages = async () => {
    if (!receiverId) {
      console.error("receiverId is undefined");
      return;
    }
    try {
      const data = await getMessages(receiverId, token);
      // Chuyển đổi dữ liệu từ API để phù hợp với định dạng tin nhắn
      const formattedMessages = data.map(msg => ({
        ...msg,
        // dùng is_sender từ API, kh tính lại vì có thể ghi đè lên
      }));

      setMessages(formattedMessages);
      
    } catch (err) {
      console.error('Lỗi khi lấy tin nhắn:', err);
    }

  };

  // Auto scroll khi có tin nhắn mới
  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

    // Nếu còn < 60px nữa là chạm đáy, coi như đang ở cuối
    setIsAtBottom(distanceFromBottom < 60);
  };
  const handleScrollBeginDrag = () => {
    setIsAtBottom(false); // Người dùng bắt đầu kéo → không auto scroll nữa
  };
//Mỗi khi tn mới và user đang ở cuối ds, đoạn này sẽ cuộn auto xuống cuối sau 100ms, đảm bảo UI luôn hiện tn new
  useEffect(() => {
    if (isAtBottom && flatListRef.current && messages.length > 0) {
      // Dùng setTimeout để delay nhẹ, đảm bảo FlatList đã render xong
      const timeout = setTimeout(() => { 
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true }); 
        }
      }, 100); 
  
      return () => clearTimeout(timeout); 
    }
  }, [messages]);

// làm mới cuộc trò chuyện
  useEffect(() => {
    fetchMessages(); // fetch messages ngay khi vào màn hình
    // cập nhật tin nhắn mới mỗi 3giây
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [receiverId]);

  // user thấy đc tn khi vừa gửi  (tạm thời)
  const sendMessage = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    const tempMessage = {
      id: Date.now(), // Tạo ID tạm thời
      content,
      is_sender: true,
      // is_deleted: false,
      isTemp: true, // Đánh dấu là tin nhắn tạm thời
      sender_username: 'Bạn',
    };

    setMessages(prev => [...prev, tempMessage]);
    setContent('');
    try {
      await sendMessageAPI(receiverId, content, token);
      // Sau khi gửi thành công, cập nhật lại danh sách tin nhắn
      fetchMessages();
    } catch (err) {
      console.error('Gửi tin nhắn lỗi:', err);
      // Xóa tin nhắn tạm nếu gửi thất bại
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  // Sắp xếp tin nhắn theo thời gian hiển thị tin nhắn
  const sortedMessages = [...messages].sort((a, b) =>
    new Date(a.created_at) - new Date(b.created_at));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 50} // điều chỉnh fit nếu có bàn phím
  >
    
  
      <View style={{ flex: 1 }}>
      
  
        {/* Danh sách tin nhắn */}
        <FlatList
          ref={flatListRef}
          data={sortedMessages}
          keyExtractor={(item) => item.id.toString()}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 0}}
           keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: item.is_sender ? 'flex-end' : 'flex-start',
                paddingHorizontal: 10,
                marginVertical: 4,
              }} 
            >
              <View
                style={[
                  styles.messageContainer,
                  item.is_sender ? styles.senderMessage : styles.receiverMessage,
                ]}
              >
                <Text style={styles.senderName}>{item.sender_username}</Text>
                <Text style={styles.messageText}>
                  { item.content}
                </Text>
              </View>
            </View>
          )}
        />
  
        {/* Hộp nhập tin nhắn */}
        <View style={styles.inputWrapper}>
          <TextInput 
            value={content}
            onChangeText={setContent}
            placeholder="Nhập tin nhắn..."
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={styles.sendButton}
            disabled={!content.trim() || isSending}
          >
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </View>
   
  </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
  </SafeAreaView>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', // màu nền tổng thể dịu mắt
  },
  header: {
    padding: 16,
    backgroundColor: '#2f4f4f',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  messageContainer: {
    padding: 10,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
 senderMessage: {
  alignSelf: 'flex-end', // Tin nhắn người gửi phải căn bên phải
  backgroundColor: '#CDE8FF', // Màu nền xanh nhạt cho người gửi
  marginRight: 10,  // Khoảng cách bên phải
  padding: 10,      // Đảm bảo tin nhắn có khoảng cách
  borderRadius: 16, // Bo tròn góc
  maxWidth: '80%',  // Giới hạn chiều rộng tin nhắn để không quá dài
  shadowColor: '#000', 
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 1, // Thêm hiệu ứng cho Android
},

receiverMessage: {
  alignSelf: 'flex-start',  // Tin nhắn người nhận phải căn bên trái
  backgroundColor: '#fff',  // Màu nền trắng cho người nhận
  marginLeft: 10,           // Khoảng cách bên trái
  borderWidth: 0.5,
  borderColor: '#ddd',
  padding: 10,             // Đảm bảo tin nhắn có khoảng cách
  borderRadius: 16,        // Bo tròn góc
  maxWidth: '80%',         // Giới hạn chiều rộng tin nhắn để không quá dài
},

inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 10,
  paddingBottom: 50,
  borderTopWidth: 1,
  borderColor: '#eee',
  backgroundColor: '#fff',
},

textInput: {
  flex: 1,
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 20,
  backgroundColor: '#fff',
  fontSize: 16,
},

sendButton: {
  backgroundColor: '#007AFF', // Màu xanh cho nút gửi
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 24,
  marginLeft: 8,
  justifyContent: 'center',
  alignItems: 'center',
},

sendButtonText: {
  color: '#FFF',
  fontWeight: '600',
},

  senderName: {
    fontWeight: '500',
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#222',
    lineHeight: 22,
  },
  // inputWrapper: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   padding: 10,
  //   paddingBottom: 50,
  //   borderTopWidth: 1,
  //   borderColor: '#eee',
  //   backgroundColor: '#fff',
  // },
  // textInput: {
  //   flex: 1,
  //   paddingHorizontal: 12,
  //   paddingVertical: 8,
  //   borderWidth: 1,
  //   borderColor: '#ccc',
  //   borderRadius: 20,
  //   backgroundColor: '#fff',
  //   fontSize: 16,
  // },
  
  // sendButton: {
  //   backgroundColor: '#007AFF', // xanh iOS
  //   paddingVertical: 10,
  //   paddingHorizontal: 16,
  //   borderRadius: 24,
  //   marginLeft: 8,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // sendButtonText: {
  //   color: '#FFF',
  //   fontWeight: '600',
  // },
});
