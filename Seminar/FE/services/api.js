// file để gọi api
import axios from 'axios'; 

const BASE_URL = 'http://192.168.100.7:3000'; //thay ip

//api đăng nhập
export async function loginUser(username, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      username,
      password
    }, 
  {
    headers: {
      'Content-Type': 'application/json'
    }
  });

    return response.data; 
  } catch (error) {
    // Kiểm tra có phản hồi từ server không
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Đăng nhập thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

//api đnăg ky
export async function registerUser(userData) {
    try {
        const response = await axios.post(`${BASE_URL}/api/register`, userData);
        return response.data;
      } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        throw error;
      }
    };
 
    // xóa acc
    export const deleteUser = async (token) => {
      const res = await fetch(`${BASE_URL}/api/users/profile`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Xóa tài khoản thất bại');
      return await res.json();
    };
    

    // lấy thông tin sau đó cập nhật
    export async function updateUser(token, userData) {
      try {
        const response = await axios.put(`${BASE_URL}/api/users/profile`, userData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      } catch (error) {
        // Kiểm tra xem có lỗi từ server không
        if (error.response) {
          // Nếu có lỗi từ server, thông báo chi tiết
          console.error('Lỗi khi cập nhật thông tin người dùng:', error.response.data);
          throw new Error(error.response.data?.error || 'Cập nhật thông tin thất bại');
        } else if (error.request) {
          // Nếu có vấn đề với request (chẳng hạn mất kết nối mạng)
          console.error('Không nhận được phản hồi từ server:', error.request);
          throw new Error('Không nhận được phản hồi từ server. Kiểm tra kết nối mạng.');
        } else {
          // Nếu lỗi không liên quan đến response hoặc request
          console.error('Lỗi không xác định:', error.message);
          throw new Error('Lỗi không xác định. Vui lòng thử lại.');
        }
      }
    }

    // Hàm lấy thông tin user
    // export async function getUserInfo(token) {
    //   try {
    //     console.log('Token being used:', token); // Debug token
        
    //     if (!token) {
    //       throw new Error('Không tìm thấy token');
    //     }
        
    //     const response = await axios.get(`${BASE_URL}/api/users/me`, {
    //       headers: { 
    //         Authorization: `Bearer ${token}`,
    //         'Content-Type': 'application/json'
    //       }
    //     });
    //     return response.data;
    //   } catch (error) {
    //     console.error('Chi tiết lỗi:', error.response?.data || error.message);
    //     throw new Error(error.response?.data?.message || 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
    //   }
    // }
    // export async function getUserInfo(token) {
    //   try {
    //     if (!token) {
    //       throw new Error('Không tìm thấy token');
    //     }
        
    //     const response = await axios.get(`${BASE_URL}/api/users/me`, {
    //       headers: { 
    //         Authorization: `Bearer ${token}`,
    //         'Content-Type': 'application/json'
    //       }
    //     });
        
    //     if (!response.data) {
    //       throw new Error('Không nhận được dữ liệu người dùng');
    //     }
        
    //     return response.data;
    //   } catch (error) {
    //     console.error('Lỗi khi lấy thông tin user:', error);
    //     throw new Error(error.response?.data?.message || error.message || 'Lỗi khi tải thông tin người dùng');
    //   }
    // }
    export async function getUserInfo(token) {
      try {
        console.log("Token đang gửi lên server:", token); // Debug token
        
        const response = await axios.get(`${BASE_URL}/api/users/profile`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Dữ liệu nhận về từ server:", response.data); // Debug data
        
        return response.data;
      } catch (error) {
        console.error("Lỗi chi tiết:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      }
    }
// Gửi mã OTP (email hoặc phone)
export async function forgotPassword(identifier, via) {
  try {
    const response = await axios.post(`${BASE_URL}/api/sendotp`, { identifier, via });
    return response.data;
  } catch (error) {
    console.error('Lỗi forgotPassword:', error);
    throw new Error(
      error.response?.data?.error || 'Lỗi khi gửi yêu cầu quên mật khẩu'
    );
    
  }
}

// Đặt lại mật khẩu
export async function resetPassword(identifier, otp, newPassword) {
  try {
    const response = await axios.post(`${BASE_URL}/api/resetpassword`, {
      identifier,
      otp,
      newPassword,
    });    
  
    return response.data;
    
  } catch (error) {
    
    console.error('Lỗi resetPassword:', error);
    
    throw new Error(
      error.response?.data?.error || 'Lỗi khi đặt lại mật khẩu'
    );
  }
}


  // Lấy danh sách tất cả người dùng (trừ bản thân --- tìm kiếm ng dùng khác để nt)
export async function getUsers(token) {
  const res = await axios.get(`${BASE_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}


  // Lấy danh sách cuộc trò chuyện để hiển thị list tn ở chat
export async function getConversations(token) {
  const response = await axios.get(`${BASE_URL}/api/conversations`, {
    headers: { Authorization: `Bearer ${token}` }   
  });
  return response.data;
}
    
// Lấy tin nhắn
export async function getMessages(receiverId, token) {
    const response = await axios.get(`${BASE_URL}/api/messages?receiver_id=${receiverId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
 
    return response.data;
  }
  
  // Gửi tin nhắn
  export async function sendMessage(receiverId, content, token) {
    const response = await axios.post(`${BASE_URL}/api/messages`, {
      receiver_id: receiverId,
      content
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Dữ liệu trả về từ API sendMessage:', response.data); // Debug dữ liệu
    return response.data;
  }