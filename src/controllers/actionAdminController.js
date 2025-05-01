const { upload } = require("../middlewares/uploadMiddleware");
const actionAdminModel = require("../models/actionAdminModel");
const IssueLogModel = require("../models/issueLogModel");
const IssueReportModel = require("../models/issueReportModel");
const {notifyAgents , notifyAdmins} = require('../controllers/notifyController');
const { getUidByIssueId } = require('../models/notifyModel');
const { pushLineMessage } = require('../utils/lineNotify');



const ActionAdminController = {
  updateIssueStatus: [
    upload.array("images", 1),  // ใช้ Middleware สำหรับอัปโหลดรูปภาพ
    async (req, res) => {
      try {
        const { id } = req.params; // รับ `issue_id`
        const { status, comment } = req.body; // รับค่าสถานะและคำอธิบายของเจ้าหน้าที่
        const role = req.user?.role;
        const adminId = req.user?.userId; // ดึง `adminId` จาก Token
        const isAdmin = role === "admin";
        const isAgent = role === "agent";
        const isSuper = role === "superadmin";

        if (!adminId) {
          return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
        }

        if (!isAdmin && !isAgent && !isSuper ) {
          return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this issue" });
        }

        // ตรวจสอบว่า Issue มีอยู่จริงหรือไม่
        const existingIssue = await actionAdminModel.getIssueById(id);
        if (!existingIssue) {
          return res.status(404).json({ error: "Issue not found" });
        }

        // อัปเดต `status` ของ Issue
        const updatedIssue = await actionAdminModel.updateIssue(id, status);

        // ตรวจสอบ Action และ Timestamp
        let action;
        let ongoingat = null;
        let endat = null;

        if (status === "กำลังดำเนินการ") {
          action = "update";
          ongoingat = new Date().toISOString();
        } else if (status === "เสร็จสิ้น") {
          action = "complete";
          endat = new Date().toISOString();
        } else if (status === "ไม่เกี่ยวข้อง") {
          action = "unassign";

          // ล้างหน่วยงานออกจาก Issue
          await actionAdminModel.updateDepartment(id, null);

          // ดึงชื่อหน่วยงาน
          const department_id = existingIssue.assigned_to;
          const departmentResult = await actionAdminModel.getDepartmentName(department_id);
          const departmentName = departmentResult.name;

          // สร้าง log โดยระบุเหตุผลว่า "เคสนี้ไม่เกี่ยวข้องกับหน่วยงาน"
          await IssueLogModel.createIssueLog(
            adminId,
            id,
            action,
            status,
            null,
            null,
            false,
            `เคสนี้ไม่เกี่ยวข้องกับหน่วยงาน ${departmentName}`
          );
        
          return res.status(200).json({
            message: "สถานะถูกอัปเดตเป็น 'ไม่เกี่ยวข้อง' และลบหน่วยงานที่รับผิดชอบเรียบร้อยแล้ว",
            issue: {
              id,
              status: "ไม่เกี่ยวข้อง",
              assigned_to: null
            }
          });
        }

        // รับ URL ของไฟล์ที่อัปโหลด
        const imageUrls = req.files?.length > 0
          ? req.files.map(file => ({
              file_url: file.location,  // URL ของไฟล์
              file_extension: file.originalname.split(".").pop()
          }))
          : [];

        const has_images = imageUrls.length > 0;

        // บันทึก Log การเปลี่ยนแปลงของ Issue
        const logEntry = await IssueLogModel.createIssueLog(adminId, id, action, status, ongoingat, endat, has_images, comment);

        // บันทึกไฟล์ภาพที่อัปโหลด
        let uploadedImages = [];
        if (has_images) {
          uploadedImages = await actionAdminModel.uploadIssueImages(id, logEntry.id, adminId, imageUrls);
        }

        //  ดึงข้อมูลฉบับเต็มของ issue
        const fullIssue = await IssueReportModel.getIssueById(id);
        const uid = await getUidByIssueId(id);

        console.log("🔍 Update Triggered by User:", req.user?.userId);
        console.log("🔍 Issue ID:", id);
        console.log("🔍 Status:", status);
        console.log("🔍 UID to notify:", uid);

        if (uid && (status === "กำลังดำเนินการ" || status === "เสร็จสิ้น")) {
          const lineMessage = {
            type: "flex",
            altText: `สถานะแจ้งปัญหาของคุณอัปเดตเป็น "${status}"`,
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
                    text: "สถานะอัปเดต: " + status,
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
                          { type: "text", text: fullIssue.transaction_id, flex: 5, size: "sm", color: "#333333" }
                        ]
                      },
                      {
                        type: "box",
                        layout: "baseline",
                        contents: [
                          { type: "text", text: "สถานะ:", flex: 2, size: "sm", color: "#aaaaaa" },
                          { type: "text", text: status , flex: 5, size: "sm", color: "#f39c12" }
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
                      },
                      {
                        type: "box",
                        layout: "baseline",
                        contents: [
                          { type: "text", text: "รายละเอียด:", flex: 2, size: "sm", color: "#aaaaaa" },
                          { type: "text", text: comment , flex: 5, size: "sm", color: "#333333" }
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
                      uri: `https://tse-fongdi.vercel.app/UserPage/IssueTimeline/${id}`
                    }
                  },
                  ...(status === "เสร็จสิ้น"
                    ? [{
                        type: "button",
                        style: "primary",
                        color: "#42A5F5",
                        action: {
                          type: "uri",
                          label: "✏️ รีวิวปัญหา",
                          uri: `https://tse-fongdi.vercel.app/UserPage/ReviewPage/${id}`
                        }
                      }]
                    : [])
                ]
              }              
            }
          };

        await pushLineMessage(uid, lineMessage);
        
    } else {
      console.warn("⚠ ไม่พบ UID หรือเงื่อนไขไม่ตรง status");
    }


        res.status(200).json({
          message: "Issue updated successfully",
          issue: {
            id: updatedIssue.id,
            status: updatedIssue.status,
            updated_at: updatedIssue.updated_at
          }
        });

      } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: error.message });
      }
    }
    
  ],

  // ลบรายงาน แต่่เก็บไว้ในฐานข้อมูล
  deleteIssueReport: async (req, res) => {
    try {
      const { id } = req.params; // รับ `issue_id`
      const role = req.user?.role;
      const adminId = req.user?.userId; // ดึง `adminId` จาก Token
      const isAdmin = role === "admin";
      const isSuper = role === "superadmin";

      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
      }

      if (!isAdmin && !isSuper) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this issue" });
      }

      // ตรวจสอบว่า Issue มีอยู่จริง
      const existingIssue = await actionAdminModel.getIssueById(id);
      if (!existingIssue) {
        return res.status(404).json({ error: "Issue not found" });
      }


      await IssueLogModel.createIssueLog(
        adminId,  // user_id (คนที่ลบ)
        id,  // issue_id
        "delete",  // action = "delete"
        null,  // status = null
        null,  // ongoingAt = null
        null,  // endAt = null
        false,  // has_images = false
        null,  // comment = null
        new Date().toISOString(),
      );

      

      // set deleted = true
      await actionAdminModel.deleteIssue(id);

      res.status(200).json({ message: "Issue report deleted successfully" });

    } catch (error) {
      console.error("Internal Server Error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  updateDepartment: async (req, res) => {
    try {
      const { id } = req.params; // issue_id
      const role = req.user?.role;
      const { department_id } = req.body;
      const adminId = req.user?.userId;
      const isAdmin = role === "admin";
      const isSuper = role === "superadmin";

      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
      }

      if (!isAdmin && !isSuper ) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this issue" });
      }
  
      // ตรวจสอบว่า Issue มีอยู่จริง
      const existingIssue = await actionAdminModel.getIssueById(id);
      if (!existingIssue) {
        return res.status(404).json({ error: "Issue not found" });
      }
  
      // ตรวจสอบว่า department_id ไม่ว่าง
      if (!department_id || isNaN(parseInt(department_id))) {
        return res.status(400).json({ error: "กรุณาระบุ department_id ที่ถูกต้อง" });
      }

      // ดึงชื่อหน่วยงาน
      const departmentResult = await actionAdminModel.getDepartmentName(department_id);

      if (!departmentResult) {
        return res.status(404).json({ error: "ไม่พบหน่วยงานที่ระบุ" });
      }
      
      const departmentName = departmentResult.name;

      // ตรวจว่าตอนนี้ issue อยู่ในสถานะ "ไม่เกี่ยวข้อง" หรือไม่
      let shouldUpdateStatus = false;
      if (existingIssue.status === "ไม่เกี่ยวข้อง") {
        shouldUpdateStatus = true;
      }

      // อัปเดต assign_to
      await actionAdminModel.updateDepartment(id, department_id);

      // ส่งการแจ้งเตือนให้กับเจ้าหน้าที่ที่รับผิดชอบ
      const fullIssue = await IssueReportModel.getIssueById(id);
      await notifyAgents(
        fullIssue.assigned_to,
        {
          transaction_id: fullIssue.transaction_id,
          title: fullIssue.title, // category_name
          description: fullIssue.description,
          location: `อาคาร ${fullIssue.building} ชั้น ${fullIssue.floor ?? ""} ห้อง ${fullIssue.room ?? ""}`,
          departmentName: fullIssue.department_name
        },
        "assign" // <<< เพิ่มโหมด assign
      );

      if (shouldUpdateStatus) {
        await actionAdminModel.updateIssue(id, "รอรับเรื่อง"); 
      }

      // log การ assign
      await IssueLogModel.createIssueLog(
        adminId,
        id,
        "assign",     // action
        shouldUpdateStatus ? "รอรับเรื่อง" : null,  // status
        null, null,   // ongoing_at, end_at
        false,        // has_images
        `มอบหมายให้หน่วยงาน ${departmentName}`
      );
  
      res.status(200).json({
        message: "อัปเดตหน่วยงานสำเร็จ",
        assign_to: department_id
      });
  
    } catch (error) {
      console.error("updateDepartment error:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  updateDeleteFlag: async (req, res) => {
    const id = parseInt(req.params.id);
    const { isDeleted } = req.body;
    const role = req.user?.role;
    const adminId = req.user?.userId; // ดึง `adminId` จาก Token
    const isDean = role === "รองคณบดี";
      

    try {

      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
      }

      if (!isDean) {
        return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this issue" });
      }

      if (isNaN(id) || typeof isDeleted !== 'boolean') {
        return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
      }

      await actionAdminModel.updateDeleteFlag(id, isDeleted);

      const fullIssue = await IssueReportModel.getIssueById(id);

      await notifyAdmins(
        {
          transaction_id: fullIssue.transaction_id,
          title: fullIssue.title, // category_name
          description: fullIssue.description,
          location: `อาคาร ${fullIssue.building} ชั้น ${fullIssue.floor ?? ""} ห้อง ${fullIssue.room ?? ""}`,
          departmentName: fullIssue.department_name
        },
        "return" // <<< เพิ่มโหมด assign
      );

       // log 
       await IssueLogModel.createIssueLog(
        adminId,  // user_id 
        id,  // issue_id
        "return",  // action = "delete"
        null,  // status = null
        null,  // ongoingAt = null
        null,  // endAt = null
        false,  // has_images = false
        null,  // comment = null
        new Date().toISOString(),
      );

      res.status(200).json({ message: 'อัปเดตสถานะลบสำเร็จ' });
    } catch (err) {
      console.error('❌ updateDeleteFlag error:', err.message);
      res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะลบได้' });
    }
  }


};

module.exports = ActionAdminController;
