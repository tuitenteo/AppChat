
-- Bảng người dùng
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  password VARCHAR(255) NOT NULL
);

-- Bảng tin nhắn
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) ON DELETE CASCADE, -- ai gửi
  receiver_id INT REFERENCES users(id) ON DELETE CASCADE, -- ai nhận
  content TEXT NOT NULL, -- nội dung
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- gửi hồi nào
);




