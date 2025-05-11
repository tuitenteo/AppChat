const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const fs = require("fs");  // dùng để lưu message vào file log


const app = express();
app.use(cors());

app.use(express.json());
const SECRET_KEY = "sdfggdfgdfgdfgwerewrtyytua2342";
// PostgreSQL pool (pool đối tượng connect đến pg)
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "AppChat",
  password: "051203",
  port: 5432,
});

// Middleware xác thực JWT (để bv cho các api cần đăng nhập thì mới truy cạp đc)
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer abc" → lấy abc
  if (!token) return res.status(403).send("No token provided");
//xài jsonwebtoken để xác thực token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).send("Invalid token");
    req.userId = decoded.id; // gán userId vào req để dùng sau này
    next();
  });
}


// Đăng ký
app.post("/api/register", async (req, res) => {
  const { username, phone, email, password } = req.body;

    // Kiểm tra định dạng email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Địa chỉ email không hợp lệ" });
  }

  // Kiểm tra định dạng số điện thoại
  const phoneRegex = /^0[1-9]{7,10}$/; // $ để ktr chuỗi chính xác k có ký tự thừa các kiểu
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
  }
  try {
     // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }
    //hash mk
    const hashedPassword = await bcrypt.hash(password, 10);
    //thêm ng dùng vào csdl
    await pool.query(
      "INSERT INTO users (username, phone, email, password) VALUES ($1, $2, $3, $4)",
      [username, phone, email, hashedPassword]
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists or invalid" });
  }
});

// Đăng nhập
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );

  if (result.rows.length === 0)
    return res.status(401).json({ error: "User not found" });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token, userId: user.id  });
});

// xem thông tin acc của mình
app.get('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'SELECT id, username, email, phone FROM users WHERE id = $1',
      [userId] // Lấy thông tin của người dùng hiện tại
    );
    res.json(result.rows[0]); // Trả về dữ liệu người dùng
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// cập nhật thông tin acc
app.put('/api/users/profile', verifyToken, async (req, res) => {
  const { username, email, phone, password } = req.body;

  try {
    let query = '';
    let values = [];

    if (password) {
      const salt = await bcrypt.genSalt(10); // nếu có pass thì sẽ mã hóa lại mk
      const hashedPassword = await bcrypt.hash(password, salt);
//r cập nhật lại các trường trong csdl
      query = `
        UPDATE users 
        SET username = $1, email = $2, phone = $3, password = $4 
        WHERE id = $5
      `;
      values = [username, email, phone, hashedPassword, req.userId];
    } else { // nếu k có pass thì chỉ cập nhật các trường khác
      query = `
        UPDATE users 
        SET username = $1, email = $2, phone = $3 
        WHERE id = $4
      `;
      values = [username, email, phone, req.userId];
    }

    await pool.query(query, values);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user' });
  }
});


//xóa acc
app.delete('/api/users/profile', verifyToken, async (req, res) => {
  try {
    // Xóa tất cả tin nhắn liên quan đến người dùng này trước
    await pool.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', [req.userId]);

    // Sau đó xóa người dùng
    await pool.query('DELETE FROM users WHERE id = $1', [req.userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting user' });
  }
});


// Mã OTP tạm thời lưu trong RAM
// let otpStore = {}; 
// app.post("/api/sendotp", async (req, res) => {
//   const { identifier, via } = req.body;

//   // Validate input
//   if (!identifier || !via) {
//     return res.status(400).json({ error: "Missing identifier or via" });
//   }

//   // Chỉ cho phép email hoặc phone
//   const validMethods = ['email', 'phone'];
//   if (!validMethods.includes(via)) {
//     return res.status(400).json({ 
//       error: "Invalid method. Only 'email' or 'phone' allowed" 
//     });
//   }

//   let result;
//   if (via === 'email') {
//     result = await pool.query("SELECT * FROM users WHERE email = $1", [identifier]);
//   } else { // via === 'phone'
//     result = await pool.query("SELECT * FROM users WHERE phone = $1", [identifier]);
//   }

//   if (result.rows.length === 0) {
//     return res.status(404).json({ error: "User not found" });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   otpStore[identifier] = { otp, createdAt: Date.now() };

//   console.log(`[FAKE] OTP sent to ${via} ${identifier}: ${otp}`);
//   res.json({ message: "OTP sent successfully", otp });
// });

// Mã OTP tạm thời lưu trong RAM
let otpStore = {}; 
// gửi mã otp
app.post("/api/sendotp", async (req, res) => {
  const { identifier } = req.body;

  // Validate input
  if (!identifier) {
    return res.status(400).json({ error: "Missing identifier" });
  }

  // Kiểm tra xem identifier có phải là email hay phone
  let result;
  if (identifier.includes('@')) { // Kiểm tra email (dựa vào dấu '@')
    result = await pool.query("SELECT * FROM users WHERE email = $1", [identifier]);
  } else { // ngược lại là phone
    result = await pool.query("SELECT * FROM users WHERE phone = $1", [identifier]);
  }

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  //tạo mã otp ngẫu nhiên 6 chữ số, hàm toán cơ bản
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[identifier] = { otp, createdAt: Date.now() }; //đc lữu trong otpStore vơi skey là email hoặc phone với thời gian tạo mã

  console.log(`[FAKE] OTP sent to ${identifier}: ${otp}`);
  res.json({ message: "OTP sent successfully", otp });
});


// Xóa toàn bộ tham số 'via' trong API resetpassword
app.post("/api/resetpassword", async (req, res) => {
  const { identifier, otp, newPassword } = req.body; // Chỉ nhận 3 tham số

  // Tự động xác định loại identifier (email/phone)
  const isEmail = identifier.includes('@');
  const query = isEmail 
    ? "SELECT * FROM users WHERE email = $1"
    : "SELECT * FROM users WHERE phone = $1";

  // Kiểm tra user tồn tại
  const userResult = await pool.query(query, [identifier]);
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  // Kiểm tra OTP  có đúng k
  const storedOtp = otpStore[identifier];
  if (!storedOtp || storedOtp.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // Kiểm tra thời hạn OTP 5p hết hạn
  if (Date.now() - storedOtp.createdAt > 5 * 60 * 1000) {
    delete otpStore[identifier];
    return res.status(400).json({ error: "OTP expired" });
  }

  // Cập nhật mật khẩu đổi mã mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query(
    "UPDATE users SET password = $1 WHERE email = $2 OR phone = $2",
    [hashedPassword, identifier]
  );

  delete otpStore[identifier];
  res.json({ message: "Password reset successfully" });
});

// Tìm tất cả user (trừ bản thân) để thêm 1 cuộc trơ chuyện mới
app.get("/api/users", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username FROM users WHERE id != $1",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách người dùng" });
  }
});



app.get("/api/messages", verifyToken, async (req, res) => {
  const { receiver_id } = req.query;
  if (!receiver_id) {
    return res.status(400).json({ error: "receiver_id is required" });
  }

  try {
    const result = await pool.query(
      `SELECT 
         m.id, 
         m.content, 
         m.sent_at, 
         m.sender_id = $1 AS is_sender,
         sender.username AS sender_username,
         receiver.username AS receiver_username
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.sent_at ASC`,
      [req.userId, receiver_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});



app.post("/api/messages", verifyToken, async (req, res) => {
  const { receiver_id, content } = req.body;

  try {
    // Lấy username của người gửi
    const senderResult = await pool.query("SELECT username FROM users WHERE id = $1", [req.userId]);
    const senderUsername = senderResult.rows[0]?.username;

    if (!senderUsername) {
      return res.status(404).json({ error: "Sender username not found" });
    }

    // Lấy username của người nhận
    const receiverResult = await pool.query("SELECT username FROM users WHERE id = $1", [receiver_id]);
    const receiverUsername = receiverResult.rows[0]?.username;

    if (!receiverUsername) {
      return res.status(404).json({ error: "Receiver username not found" });
    }

    // Lưu tin nhắn vào cơ sở dữ liệu
    const result = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING id, content, sender_id, receiver_id, sent_at",
      [req.userId, receiver_id, content]
    );

    const newMessage = result.rows[0];

    // Ghi log với username của cả người gửi và người nhận
    const logMessage = `[${new Date().toISOString()}] From User ${senderUsername} to User ${receiverUsername}: ${content}\n`;
    fs.appendFile("messages.log", logMessage, (err) => {
      if (err) console.error("Lỗi ghi file log:", err);
    });

    // Trả về thông tin tin nhắn mới
    res.status(200).json({
      ...newMessage,
      sender_username: senderUsername,
      receiver_username: receiverUsername, // Thêm receiver_username vào phản hồi
      is_sender: true, // Đánh dấu đây là tin nhắn của người gửi
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

//ds người từng trò chuyện (gửi or nhận) cùng với tin nhắn mới nhất của cuoc trò chuyện đó để hiển thị chat UI
app.get("/api/conversations", verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.id AS partnerId,
        u.id AS id,
        COALESCE(u.username, 'Không rõ tên') AS partnerName,
        COALESCE(m.content, 'Chưa có tin nhắn') AS lastMessage,
        COALESCE(m.sent_at, null) AS lastMessageTime
      FROM (
        SELECT
          CASE 
              WHEN sender_id = $1 THEN receiver_id
              ELSE sender_id
          END AS other_user_id,
          MAX(sent_at) AS latest
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
        GROUP BY other_user_id
      ) AS recent
      JOIN messages m ON (
          (m.sender_id = $1 AND m.receiver_id = recent.other_user_id)
          OR (m.sender_id = recent.other_user_id AND m.receiver_id = $1)
      )
      AND m.sent_at = recent.latest
      JOIN users u ON u.id = recent.other_user_id
      ORDER BY m.sent_at DESC
    `, [req.userId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy danh sách trò chuyện" });
  }
});

// app.listen(1001, () => {
//   console.log("Server running on http://192.168.100.7:1001");
// });

app.listen(3000, () => {
  console.log("Server running on http://192.168.100.7:3000"); // tahy ip
});

