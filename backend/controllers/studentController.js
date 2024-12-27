const xlsx = require("xlsx");
const { validationResult } = require("express-validator");
const Student = require("../models/Student");
const { success, error } = require("../utils/response");
const logger = require("../utils/logger");
const Log = require("../models/Log");

// ... 保持原有方法

// 导入学生数据
exports.importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "请选择文件");
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const results = await Promise.all(
      data.map(async (row) => {
        try {
          const student = new Student({
            studentId: row["学号"],
            name: row["姓名"],
            gender: row["性别"] === "男" ? 1 : 2,
            classId: row["班级ID"],
            phone: row["电话"],
            email: row["邮箱"],
            address: row["地址"],
          });
          await student.save();
          return { success: true, studentId: row["学号"] };
        } catch (err) {
          return { success: false, studentId: row["学号"], error: err.message };
        }
      })
    );

    success(res, results, "导入完成");
  } catch (err) {
    logger.error("导入学生数据失败:", err);
    error(res, "导入失败", 1, 500);
  }
};

// 上传头像
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "请选择文件");
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return error(res, "学生不存在", 1, 404);
    }

    student.avatar = `/uploads/${req.file.filename}`;
    await student.save();

    success(res, { avatar: student.avatar }, "上传成功");
  } catch (err) {
    logger.error("上传头像失败:", err);
    error(res, "上传失败", 1, 500);
  }
};

// 导出学生数据
exports.exportStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("class", "name grade")
      .lean();

    const data = students.map((student) => ({
      学号: student.studentId,
      姓名: student.name,
      性别: student.gender === 1 ? "男" : "女",
      班级: student.class
        ? `${student.class.grade}级${student.class.name}`
        : "",
      电话: student.phone || "",
      邮箱: student.email || "",
      地址: student.address || "",
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "学生信息");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
    res.send(buffer);
  } catch (err) {
    logger.error("导出学生数据失败:", err);
    error(res, "导出失败", 1, 500);
  }
};

// 获取学生列表
exports.getStudents = async (req, res) => {
  try {
    console.log("[学生控制器] 获取学生列表, 参数:", req.query);
    const { page = 1, pageSize = 10, studentId, name, classId } = req.query;

    // 构建查询条件
    const query = {};
    if (studentId) query.studentId = new RegExp(studentId, "i");
    if (name) query.name = new RegExp(name, "i");
    if (classId) query.classId = classId;

    console.log("[学生控制器] 查询条件:", query);

    // 先检查是否有学生数据
    const totalCount = await Student.countDocuments();
    console.log("[学生控制器] 总学生数:", totalCount);

    // 如果没有数据，创建一些测试数据
    if (totalCount === 0) {
      console.log("[学生控制器] 无学生数据，创建测试数据");
      await Student.create([
        {
          studentId: "20240001",
          name: "张三",
          gender: 1,
          classId: null,
          phone: "13800138001",
          email: "zhangsan@example.com",
        },
        {
          studentId: "20240002",
          name: "李四",
          gender: 1,
          classId: null,
          phone: "13800138002",
          email: "lisi@example.com",
        },
        {
          studentId: "20240003",
          name: "王五",
          gender: 2,
          classId: null,
          phone: "13800138003",
          email: "wangwu@example.com",
        },
      ]);
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    // 查询学生列表
    const list = await Student.find(query)
      .populate({
        path: "classId",
        select: "grade name",
        model: "Class",
      })
      .skip(skip)
      .limit(parseInt(pageSize))
      .sort("-createdAt")
      .lean();

    console.log("[学生控制器] 查询结果:", {
      count: list.length,
      sample: list[0],
    });

    const total = await Student.countDocuments(query);

    // 处理返回数据
    const formattedList = list.map((student) => ({
      _id: student._id,
      studentId: student.studentId,
      name: student.name,
      gender: student.gender,
      className: student.classId
        ? `${student.classId.grade}级${student.classId.name}`
        : "未分配班级",
      phone: student.phone,
      email: student.email,
      address: student.address,
      createdAt: student.createdAt,
    }));

    success(res, {
      list: formattedList,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    console.error("[学生控制器] 获取学生列表失败:", err);
    error(res, "获取学生列表失败", 1, 500);
  }
};

// 获取单个学生
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "classId",
      "name grade"
    );

    if (!student) {
      return error(res, "学生不存在", 1, 404);
    }

    success(res, student);
  } catch (err) {
    error(res, "获取学生信息失败", 1, 500);
  }
};

// 创建学生
exports.createStudent = async (req, res) => {
  try {
    // console.log("[学生控制器] 创建学生, 请求数据:", req.body);
    const { studentId, name, gender, classId, phone, email, address } =
      req.body;

    // 创建学生
    const student = await Student.create({
      studentId,
      name,
      gender,
      classId: classId || null, // 如果没有classId，设为null
      phone: phone || "",
      email: email || "",
      address: address || "",
    });

    console.log("[学生控制器] 学生创建成功:", student);

    // 记录创建操作日志
    await Log.create({
      type: "create",
      operator: req.user._id,
      username: req.user.name,
      content: `创建学生：${name}（学号：${studentId}）`,
      ip: req.ip,
    });

    success(res, student, "创建成功");
  } catch (err) {
    console.error("[学生控制器] 创建学生失败:", err);
    // 返回具体的错误信息
    error(res, err.message || "创建学生失败", 1, 500);
  }
};

// 更新学生
exports.updateStudent = async (req, res) => {
  try {
    const { name, number, class: classId, gender } = req.body;
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return error(res, "学生不存在", 1, 404);
    }

    // 记录原始数据
    const originalData = {
      name: student.name,
      number: student.number,
    };

    // 更新数据
    student.name = name;
    student.number = number;
    student.class = classId;
    student.gender = gender;
    await student.save();

    // 记录更新操作日志
    await Log.create({
      type: "update",
      operator: req.user._id,
      username: req.user.name,
      content: `修改学生：${originalData.name}改为${name}，学号从${originalData.number}改为${number}`,
      ip: req.ip,
    });

    success(res, student, "更新成功");
  } catch (err) {
    error(res, "更新学生失败", 1, 500);
  }
};

// 删除学生
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return error(res, "学生不存在", 1, 404);
    }

    await student.deleteOne();

    // 记录删除操作日志
    await Log.create({
      type: "delete",
      operator: req.user._id,
      username: req.user.name,
      content: `删除学生：${student.name}（学号：${student.number}）`,
      ip: req.ip,
    });

    success(res, null, "删除成功");
  } catch (err) {
    error(res, "删除学生失败", 1, 500);
  }
};

// 获取最近添加的学生
exports.getRecentStudents = async (req, res) => {
  try {
    // console.log('[学生控制器] 获取最近添加的学生')

    const students = await Student.find()
      .populate({
        path: "classId",
        select: "grade name",
      })
      .sort("-createdAt")
      .limit(10)
      .lean();

    console.log("[学生控制器] 查询结果:", {
      count: students.length,
      sample: students[0],
    });

    success(
      res,
      students.map((student) => ({
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        gender: student.gender,
        classId: student.classId,
        createdAt: student.createdAt,
      }))
    );
  } catch (err) {
    console.error("[学生控制器] 获取最近添加的学生失败:", err);
    error(res, "获取最近添加的学生失败", 1, 500);
  }
};
