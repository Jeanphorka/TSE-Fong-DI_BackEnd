const { upload } = require("../middlewares/uploadMiddleware");
const IssueReportModel = require("../models/issueReportModel");
const IssueLogModel = require("../models/issueLogModel");
const { notifyAgents } = require('../controllers/notifyController');
const pool = require('../../config/db'); 
const { getUidByUserId } = require('../models/notifyModel');
const { pushLineMessage } = require('../utils/lineNotify');


const IssueReportController = {
  createIssueReport: [
    upload.array("images", 5),  //ใช้ Middleware จัดการอัปโหลดรูปภาพ
    async (req, res) => {
      const client = await pool.connect();
      try {
        const { problem_id, description, location_id } = req.body;
        const reporter_id = req.user?.userId;

        if (!reporter_id || !problem_id || !location_id) {
          return res.status(400).json({ error: "Missing required parameters" });
        }

        await client.query('BEGIN');

        const lastIssue = await IssueReportModel.getLatestIssueByUser(reporter_id);

        if (lastIssue) {
          const now = new Date();
          const lastTime = new Date(lastIssue.created_at);
          const timeDiffSec = (now - lastTime) / 1000;
        
          // เช็คเวลาสร้างห่างกันน้อยกว่า 15 วินาที
          if (timeDiffSec < 15) {
            return res.status(429).json({
              error: "คุณเพิ่งส่งรายงานเมื่อไม่กี่วินาทีที่แล้ว กรุณารอสักครู่ก่อนส่งอีกครั้ง"
            });
          }
        }

        const duplicate = await IssueReportModel.checkDuplicateIssue(reporter_id, problem_id, location_id, description);

        if (duplicate) {
          await client.query('ROLLBACK');
          return res.status(429).json({
            error: "พบว่าท่านได้ส่งรายงานเดียวกันในช่วงเวลาอันใกล้ ระบบได้รับรายงานของท่านแล้ว"
          });
        }
        
        // รับ URL ของไฟล์ที่อัปโหลด
        const imageUrls = req.files?.length > 0
                ? req.files.map(file => ({
                    file_url: file.location,
                    file_extension: file.originalname.split(".").pop()
                }))
                : [];

        // บันทึกข้อมูลปัญหา
        const issue = await IssueReportModel.createIssueReport(reporter_id, problem_id, description || "", location_id);

        // สร้าง `transaction_id`
        const date = new Date(issue.created_at);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
        const transaction_id = `IS-${formattedDate}-${String(issue.id).padStart(4, '0')}`;

        // อัปเดต `transaction_id`
        await IssueReportModel.updateTransactionId(issue.id, transaction_id);

        // บันทึก Log "Created"
        const logEntry = await IssueLogModel.createIssueLog(reporter_id, issue.id, "created", "รอรับเรื่อง",null, null,imageUrls.length > 0, null, null);

        // บันทึกไฟล์ภาพที่อัปโหลด
        let uploadedImages = [];
        if (imageUrls.length > 0) {
          uploadedImages = await IssueReportModel.uploadIssueImages(issue.id, logEntry.id, reporter_id, imageUrls);
        }
        
        // ส่งการแจ้งเตือนให้กับเจ้าหน้าที่ที่รับผิดชอบ
        const fullIssue = await IssueReportModel.getIssueById(issue.id);
        await notifyAgents(
          fullIssue.assigned_to,
          {
            transaction_id: fullIssue.transaction_id,
            title: fullIssue.title, // category_name
            description: fullIssue.description,
            location: `อาคาร ${fullIssue.building} ชั้น ${fullIssue.floor ?? ""} ห้อง ${fullIssue.room ?? ""}`,
            departmentName: fullIssue.department_name
          },
          "new" //เพิ่มโหมด 
        );

      const userUid = await getUidByUserId(reporter_id);

      if (userUid) {
        const lineMessage = {
          type: "flex",
          altText: "ระบบได้รับการแจ้งปัญหาของคุณเรียบร้อยแล้ว",
          contents: {
            type: "bubble",
            size: "mega",
            body: {
              type: "box",
              layout: "vertical",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "📌 แจ้งปัญหาสำเร็จ",
                  weight: "bold",
                  size: "xl",
                  color: "#1DB446"
                },
                {
                  type: "box",
                  layout: "vertical",
                  spacing: "sm",
                  contents: [
                    {
                      type: "box",
                      layout: "baseline",
                      contents: [
                        { type: "text", text: "หมายเลข:", flex: 2, size: "sm", color: "#aaaaaa" },
                        { type: "text", text: transaction_id, flex: 5, size: "sm", color: "#333333" }
                      ]
                    },
                    {
                      type: "box",
                      layout: "baseline",
                      contents: [
                        { type: "text", text: "สถานะ:", flex: 2, size: "sm", color: "#aaaaaa" },
                        { type: "text", text: "รอรับเรื่อง", flex: 5, size: "sm", color: "#f39c12" }
                      ]
                    },
                    {
                      type: "box",
                      layout: "baseline",
                      contents: [
                        { type: "text", text: "สถานที่:", flex: 2, size: "sm", color: "#aaaaaa" },
                        { type: "text", text: fullIssue.building + " ชั้น " + (fullIssue.floor || "-") + " ห้อง " + (fullIssue.room || "-"), flex: 5, size: "sm", wrap: true, color: "#333333" }
                      ]
                    },
                    {
                      type: "box",
                      layout: "baseline",
                      contents: [
                        { type: "text", text: "ประเภท:", flex: 2, size: "sm", color: "#aaaaaa" },
                        { type: "text", text: fullIssue.title, flex: 5, size: "sm", color: "#333333" }
                      ]
                    }
                  ]
                }
              ]
            },
            footer: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  color: "#1DB446",
                  action: {
                    type: "uri",
                    label: "🔍 ดูสถานะปัญหา",
                    uri: `https://tse-fongdi.vercel.app/UserPage/IssueTimeline/${issue.id}`
                  }
                }
              ]
            }
          }
        };
        
      await pushLineMessage(userUid, lineMessage);
}


        await client.query('COMMIT');
        res.status(201).json({
          message: "Issue reported successfully",
          report: {
            id: issue.id,
            transaction_id,
            reporter_id,
            problem_id,
            description,
            status: "รอรับเรื่อง",
            location_id,
            created_at: issue.created_at,
            images: uploadedImages
          }
        });

      } catch (error) {
        await client.query('ROLLBACK');
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดระหว่างการส่งข้อมูล กรุณาลองใหม่อีกครั้ง" });
      } finally {
        client.release();
      }
    }
  ],

  getUserIssues: async (req, res) => {
    try {

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized", message: "User ID is missing" });
      }

      const issues = await IssueReportModel.getUserIssues(userId);
      res.status(200).json(issues);
    } catch (err) {
      console.error("Error fetching issues:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getIssueById: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role; 
      const { id } = req.params;
      

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized", message: "User ID is missing" });
      }

      if (!id) {
        return res.status(400).json({ error: "Missing issue ID" });
      }

      const issue = await IssueReportModel.getIssueById(id);

      if (!issue) {
        return res.status(404).json({ error: "Not Found", message: "Issue not found" });
      }

      // เงื่อนไขตรวจสอบการเข้าถึง
      const isOwner = String(issue.reporter_id) === String(userId);
      const isAdmin = role === "admin";
      const isAgent = role === "agent";
      const isDean = role === "รองคณบดี";
      const isSuper = role === "superadmin";

        
      if (!isOwner && !isAdmin && !isAgent && !isDean && !isSuper) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this issue" });
      }

      res.status(200).json(issue);
    } catch (err) {
      console.error("Error fetching issue by ID:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

};

module.exports = IssueReportController;
