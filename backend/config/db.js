const mongoose = require("mongoose");
//异步函数（async），所以使用了 await 来等待数据库连接的完成
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb://127.0.0.1:27017/student_management",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB 连接失败:", error.message);
    process.exit(1);
  }
};

// 监听连接错误
mongoose.connection.on("error", (err) => {
  console.error("MongoDB 连接错误:", err);
});

// 监听连接断开
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB 连接断开");
});

module.exports = connectDB;
