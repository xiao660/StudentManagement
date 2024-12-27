const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { success, error } = require("../utils/response");
const Log = require("../models/Log");

/**
 * 登录功能
 * @param {*} req 请求对象，包含用户名和密码
 * @param {*} res 响应对象，用于发送响应
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("[认证控制器] 登录请求:", { username });

    // 查找用户并包含密码字段
    const user = await User.findOne({ username }).select("+password");
    console.log("[认证控制器] 查找用户结果:", user ? "找到用户" : "用户不存在");

    if (!user) {
      return error(res, "用户名或密码错误", 1, 400);
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(
      "[认证控制器] 密码验证结果:",
      isMatch ? "密码正确" : "密码错误"
    );

    if (!isMatch) {
      return error(res, "用户名或密码错误", 1, 400);
    }

    // 生成 token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "24h" }
    );

    // 记录登录日志
    await Log.create({
      type: "login",
      operator: user._id,
      username: user.name,
      content: `用户 ${user.name} 登录系统`,
      detail: {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      ip: req.ip,
    });

    // 返回用户信息（不包含密码）
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    console.log("[认证控制器] 登录成功:", {
      user: userWithoutPassword,
      token: token.substring(0, 20) + "...",
    });

    success(res, {
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("[认证控制器] 登录失败:", err);
    error(res, "登录失败", 1, 500);
  }
};
/**
 * 退出登录功能，清理用户的登录状态并返回退出成功消息
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 *
 */
exports.logout = async (req, res) => {
  try {
    // 这里可以添加token黑名单等逻辑
    success(res, null, "退出成功");
  } catch (err) {
    error(res, "退出失败", 1, 500);
  }
};
/**
 * 注册新用户功能
 * @param {*} req 请求对象，包含用户名、密码、姓名、邮箱、手机号
 * @param {*} res 响应对象
 */
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg);
    }

    const { username, password, name, email, phone } = req.body;

    // 检查用户是否已存在
    let user = await User.findOne({ username });
    if (user) {
      return error(res, "用户名已存在");
    }

    // 创建新用户
    user = new User({
      username,
      password,
      name,
      email,
      phone,
    });

    await user.save();
    success(res, null, "注册成功");
  } catch (err) {
    error(res, "注册失败", 1, 500);
  }
};
/**
 * 获取当前用户个人信息
 * @param {*} req 请求对象，包含当前用户的 ID
 * @param {*} res 响应对象
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    success(res, user);
  } catch (err) {
    error(res, "获取个人信息失败", 1, 500);
  }
};
/**
 * 更新当前用户的个人信息
 * @param {*} req 请求对象，包含新的个人信息（姓名、邮箱、手机号）
 * @param {*} res 响应对象
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();
    success(res, null, "更新成功");
  } catch (err) {
    error(res, "更新个人信息失败", 1, 500);
  }
};
