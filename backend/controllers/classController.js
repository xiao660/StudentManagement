const Class = require("../models/Class");
const { success, error } = require("../utils/response");
const Log = require("../models/Log");

// 获取班级列表
exports.getClasses = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name, grade } = req.query;
    // console.log('[班级控制器] 获取班级列表, 参数:', { page, pageSize, name, grade })

    const query = {};
    if (name) query.name = new RegExp(name, "i");
    if (grade) query.grade = grade;

    console.log("[班级控制器] 查询条件:", query);

    // 先检查是否有班级数据
    const totalCount = await Class.countDocuments();
    // console.log('[班级控制器] 总班级数:', totalCount)

    // 如果没有数据，创建一些测试数据
    if (totalCount === 0) {
      console.log("[班级控制器] 无班级数据，创建测试数据");
      await Class.create([
        { grade: "2024", name: "1班", teacherId: null },
        { grade: "2024", name: "2班", teacherId: null },
        { grade: "2024", name: "3班", teacherId: null },
      ]);
    }

    // 查询班级列表
    const list = await Class.find(query)
      .populate({
        path: "teacherId",
        model: "Teacher",
        select: "name gender subject",
      })
      .skip((parseInt(page) - 1) * parseInt(pageSize))
      .limit(parseInt(pageSize))
      .sort("-createdAt")
      .lean();

    console.log("[班级控制器] 查询结果:", {
      count: list.length,
      sample: list[0],
    });

    const total = await Class.countDocuments(query);

    // 处理返回数据
    const formattedList = list.map((item) => ({
      _id: item._id,
      grade: item.grade,
      name: item.name,
      teacherId: item.teacherId?._id || null,
      teacherName: item.teacherId?.name || "未分配",
      createdAt: item.createdAt,
    }));

    success(res, {
      list: formattedList,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    console.error("[班级控制器] 获取班级列表失败:", err);
    error(res, "获取班级列表失败", 1, 500);
  }
};

// 获取单个班级
exports.getClass = async (req, res) => {
  try {
    const classInfo = await Class.findById(req.params.id)
      .populate({
        path: "teacherId",
        model: "Teacher",
        select: "name gender subject",
      })
      .lean();

    if (!classInfo) {
      return error(res, "班级不存在", 1, 404);
    }

    success(res, classInfo);
  } catch (err) {
    console.error("获取班级信息失败:", err);
    error(res, "获取班级信息失败", 1, 500);
  }
};

// 创建班级
exports.createClass = async (req, res) => {
  try {
    // console.log("[班级控制器] 创建班级, 请求数据:", req.body);
    const { grade, name, teacherId } = req.body;

    // 创建班级
    const newClass = await Class.create({
      grade,
      name,
      teacherId: teacherId || null, // 如果没有teacherId，设为null
    });

    console.log("[班级控制器] 班级创建成功:", newClass);

    // 记录创建操作日志
    await Log.create({
      type: "create",
      operator: req.user._id,
      username: req.user.name,
      content: `创建班级：${grade}级${name}`,
      ip: req.ip,
    });

    success(res, newClass, "创建成功");
  } catch (err) {
    console.error("[班级控制器] 创建班级失败:", err);
    error(res, err.message || "创建班级失败", 1, 500);
  }
};

// 更新班级
exports.updateClass = async (req, res) => {
  try {
    const { name, teacher } = req.body;
    const classId = req.params.id;

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return error(res, "班级不存在", 1, 404);
    }

    // 记录原始数据
    const originalName = classDoc.name;

    // 更新数据
    classDoc.name = name;
    classDoc.teacher = teacher;
    await classDoc.save();

    // 记录更新操作日志
    await Log.create({
      type: "update",
      operator: req.user._id,
      username: req.user.name,
      content: `修改班级：${originalName}改为${name}`,
      ip: req.ip,
    });

    success(res, classDoc, "更新成功");
  } catch (err) {
    error(res, "更新班级失败", 1, 500);
  }
};

// 删除班级
exports.deleteClass = async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return error(res, "班级不存在", 1, 404);
    }

    await classDoc.deleteOne();

    // 记录删除操作日志
    await Log.create({
      type: "delete",
      operator: req.user._id,
      username: req.user.name,
      content: `删除班级：${classDoc.name}`,
      ip: req.ip,
    });

    success(res, null, "删除成功");
  } catch (err) {
    error(res, "删除班级失败", 1, 500);
  }
};
