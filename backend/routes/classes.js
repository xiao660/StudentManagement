const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const auth = require("../middleware/auth");
const logger = require("../middleware/logger");
// 添加调试中间件
router.use((req, res, next) => {
  console.log("[班级路由] 收到请求:", {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      authorization: req.headers.authorization ? "已提供" : "未提供",
    },
  });
  next();
});

// 班级路由
router.get("/", auth, classController.getClasses);
router.get("/:id", auth, classController.getClass);
router.post("/", auth, logger("create"), classController.createClass);
router.put("/:id", auth, logger("update"), classController.updateClass);
router.delete("/:id", auth, logger("delete"), classController.deleteClass);

module.exports = router;
