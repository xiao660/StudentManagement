const User = require("../models/User");
const { success, error } = require("../utils/response");
const bcrypt = require("bcryptjs");
const Log = require("../models/Log");

// 获取用户列表
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, username, role } = req.query;
    // console.log('获取用户列表, 参数:', { page, pageSize, username, role })

    const query = {};
    if (username) query.username = new RegExp(username, "i");
    if (role) query.role = role;

    console.log("查询条件:", query);

    const list = await User.find(query)
      .select("-password")
      .skip((parseInt(page) - 1) * parseInt(pageSize))
      .limit(parseInt(pageSize))
      .sort("-createdAt")
      .lean();

    const total = await User.countDocuments(query);

    console.log("查询结果:", {
      total,
      listCount: list.length,
      firstItem: list[0],
    });

    success(res, { list, total });
  } catch (err) {
    console.error("获取用户列表失败:", err);
    error(res, err.message || "获取用户列表失败", 1, 500);
  }
};

// 创建用户
exports.createUser = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return error(res, "用户名已存在", 1, 400);
    }

    // 创建新用户
    const user = await User.create({
      username,
      password,
      name,
      role,
    });

    // 记录创建操作日志
    await Log.create({
      type: "create",
      operator: req.user._id,
      username: req.user.name,
      content: `创建用户：${name}（${username}）`,
      detail: {
        userId: user._id,
        username,
        name,
        role,
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

    success(res, userWithoutPassword, "创建成功");
  } catch (err) {
    console.error("创建用户失败:", err);
    error(res, "创建用户失败", 1, 500);
  }
};

// 更新用户
exports.updateUser = async (req, res) => {
  try {
    const { name, role, password } = req.body;
    const userId = req.params.id;
    const operatorId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return error(res, "用户不存在", 1, 404);
    }

    // 记录原始数据
    const originalData = {
      name: user.name,
      role: user.role,
    };

    // 更新基本信息
    user.name = name;
    user.role = role;

    // 如果提供了新密码，则更新密码
    let isPasswordChanged = false;
    if (password) {
      user.password = password;
      isPasswordChanged = true;
    }

    await user.save();

    // 构建操作内容
    let content = "";
    const changes = [];
    const roleMap = { admin: "管理员", teacher: "教师" };

    if (originalData.name !== name) {
      changes.push(`姓名从"${originalData.name}"改为"${name}"`);
    }
    if (originalData.role !== role) {
      changes.push(
        `角色从"${roleMap[originalData.role]}"改为"${roleMap[role]}"`
      );
    }
    if (isPasswordChanged) {
      changes.push("修改了密码");
    }

    content = `修改用户 ${name}：${changes.join("，")}`;

    // 记录操作日志
    await Log.create({
      type: "update",
      operator: operatorId,
      username: req.user.name, // 添加操作人姓名
      content: content, // 添加操作内容
      detail: {
        userId,
        before: originalData,
        after: { name, role },
        passwordChanged: isPasswordChanged,
      },
      ip: req.ip,
    });

    // 返回更新后的用户信息
    const updatedUser = {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    success(res, updatedUser, "更新成功");
  } catch (err) {
    console.error("更新用户失败:", err);
    error(res, "更新用户失败", 1, 500);
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, "用户不存在", 1, 404);
    }

    // 不允许删除自己
    if (user._id.toString() === req.user.id) {
      return error(res, "不能删除当前登录用户", 1, 400);
    }

    await user.deleteOne();

    // 记录删除操作日志
    await Log.create({
      type: "delete",
      operator: req.user._id,
      username: req.user.name,
      content: `删除用户：${user.name}（${user.username}）`,
      detail: {
        userId: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      ip: req.ip,
    });

    success(res, null, "删除成功");
  } catch (err) {
    console.error("删除用户失败:", err);
    error(res, "删除用户失败", 1, 500);
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return error(res, "用户不存在", 1, 404);
    }

    // 验证原密码
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return error(res, "原密码错误");
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    // 记录修改密码操作日志
    await Log.create({
      type: "update",
      operator: req.user._id,
      username: req.user.name,
      content: `修改了自己的密码`,
      detail: {
        userId: user._id,
        passwordChanged: true,
      },
      ip: req.ip,
    });

    success(res, null, "密码修改成功");
  } catch (err) {
    console.error("[用户控制器] 修改密码失败:", err);
    error(res, "修改密码失败", 1, 500);
  }
};
