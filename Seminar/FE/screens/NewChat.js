import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/api';

export default function NewChat({ navigation }) {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers(token);
        setUsers(data);
      } catch (err) {
        console.error('Lỗi lấy danh sách người dùng:', err);
      }
    };
    fetchUsers();
  }, []);
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredUsers([]);
    } else {
      // Lọc các user có tên chứa searchText
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchText.toLowerCase())
      );

      // Sắp xếp các user theo thứ tự bảng chữ cái từ a đến z
      const sorted = filtered.sort((a, b) => {
        const nameA = a.username.toLowerCase();
        const nameB = b.username.toLowerCase();

        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      setFilteredUsers(sorted);
    }
  }, [searchText, users]);

  const handleStartChat = (item) => {
    navigation.navigate('Trong cuộc trò chuyện', {
      receiverId: item.id,
      receiverName: item.username, // hiển thị tên người dùng trong cuộc trò chuyện
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleStartChat(item)}>
      <View style={styles.userItem}>
        <Text style={styles.username}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tìm kiếm</Text>

      <TextInput
        placeholder="Nhập tên người dùng..."
        placeholderTextColor="#9EAD9C"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      {searchText.trim() !== '' && (
        filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        ) : (
          <Text style={styles.noResultText}>Không tìm thấy người dùng nào.</Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#F8FBF9', // nền rất nhạt để chữ xanh rêu nổi bật
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    color: '#3B5E47', // chữ xanh rêu đậm
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    margin: 16,
    padding: 10,
    borderColor: '#A0C3A8', // viền xanh rêu nhạt
    color: '#3B5E47', // chữ xanh rêu đậm
    backgroundColor: '#FFFFFF',
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DDEDE2', // xanh rêu nhạt
    backgroundColor: '#FFFFFF',
  },
  username: {
    fontSize: 16,
    color: '#3B5E47', // tên người dùng màu xanh rêu
    fontWeight: '500',
  },
  noResultText: {
    textAlign: 'center',
    color: '#9EAD9C', // xám xanh rêu nhạt
    marginTop: 20,
    fontSize: 16,
  },
});
