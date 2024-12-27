const Teacher = require("../models/Teacher");
const { success, error } = require("../utils/response");

// 获取教师列表
exports.getTeachers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name, subject } = req.query;
    // console.log('[教师控制器] 获取教师列表, 参数:', { page, pageSize, name, subject })

    const query = {};
    if (name) query.name = new RegExp(name, "i");
    if (subject) query.subject = subject;

    console.log("[教师控制器] 查询条件:", query);

    // 先检查是否有教师数据
    const totalCount = await Teacher.countDocuments();
    console.log("[教师控制器] 总教师数:", totalCount);

    // 如果没有数据，创建一些测试数据
    if (totalCount === 0) {
      console.log("[教师控制器] 无教师数据，创建测试数据");
      await Teacher.create([
        { name: "张老师", gender: 1, subject: "语文" },
        { name: "李老师", gender: 1, subject: "数学" },
        { name: "王老师", gender: 2, subject: "英语" },
      ]);
    }

    const list = await Teacher.find(query)
      .skip((parseInt(page) - 1) * parseInt(pageSize))
      .limit(parseInt(pageSize))
      .sort("name")
      .lean();

    console.log("[教师控制器] 查询结果:", {
      count: list.length,
      sample: list[0],
    });

    const total = await Teacher.countDocuments(query);

    success(res, {
      list: list.map((item) => ({
        _id: item._id,
        name: item.name,
        gender: item.gender,
        subject: item.subject,
      })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    console.error("[教师控制器] 获取教师列表失败:", err);
    error(res, "获取教师列表失败", 1, 500);
  }
};

// 获取单个教师
exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return error(res, "教师不存在", 1, 404);
    }
    success(res, teacher);
  } catch (err) {
    error(res, "获取教师信息失败", 1, 500);
  }
};

// 创建教师
exports.createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    success(res, teacher, "创建成功");
  } catch (err) {
    error(res, "创建教师失败", 1, 500);
  }
};

// 更新教师
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!teacher) {
      return error(res, "教师不存在", 1, 404);
    }
    success(res, teacher, "更新成功");
  } catch (err) {
    error(res, "更新教师失败", 1, 500);
  }
};

// 删除教师
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return error(res, "教师不存在", 1, 404);
    }
    await teacher.deleteOne();
    success(res, null, "删除成功");
  } catch (err) {
    error(res, "删除教师失败", 1, 500);
  }
};
