const IssueCategoryModel = require('../models/issueCategoryModel');

const IssueCategoryController = {

    getAllIssueCategories: async (req, res) => {
        const role = req.user?.role;
        const adminId = req.user?.userId;
        const isSuper = role === "superadmin";

        try {

            if (!adminId) {
                return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
            }
    
            if (!isSuper) {
                return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this department" });
            }

            const result = await IssueCategoryModel.getAllCategories();
        
            const categories = result.rows.map((row) => ({
                id: row.id,
                category_name: row.category_name
            }));
        
            res.status(200).json(categories);
            } catch (err) {
            console.error('❌ getAllIssueCategories error:', err.message);
            res.status(500).json({ error: 'ไม่สามารถดึงประเภทปัญหาได้' });
            }
      },

    createIssueCategory: async (req, res) => {
        const { categoryName, roomTypeIds } = req.body;
        const role = req.user?.role;
        const adminId = req.user?.userId;
        const isSuper = role === "superadmin";

        try {

            if (!adminId) {
                return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
            }
    
            if (!isSuper) {
                return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this department" });
            }
    
            if (!categoryName || !Array.isArray(roomTypeIds)) {
                return res.status(400).json({ error: "กรุณากรอกชื่อประเภทปัญหาและเลือกประเภทห้องให้ถูกต้อง" });
            }

            // 1. สร้าง category ใหม่
            const newCategory = await IssueCategoryModel.createCategory(categoryName);

            const categoryId = newCategory.rows[0].id;

            // 2. ผูกกับประเภทห้อง
            await IssueCategoryModel.linkCategoryToRooms(categoryId, roomTypeIds);

            res.status(201).json({ 
                message: "เพิ่มประเภทปัญหาและเชื่อมประเภทห้องสำเร็จ", 
                categoryId 
            });
            } catch (err) {
            console.error('❌ createIssueCategory error:', err.message);
            res.status(500).json({ error: 'ไม่สามารถเพิ่มประเภทปัญหาได้' });
            }
        },

    deleteIssueCategory: async (req, res) => {
        const id = parseInt(req.params.id);
        const role = req.user?.role;
        const adminId = req.user?.userId;
        const isSuper = role === "superadmin";
    
        try {
    
            if (!adminId) {
                return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
              }
      
            if (!isSuper) {
                return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this department" });
              }
      

            if (isNaN(id)) {
                return res.status(400).json({ error: "รหัสประเภทปัญหาไม่ถูกต้อง" });
            }
        
            // 1. ลบความสัมพันธ์กับ room_type ก่อน
            await IssueCategoryModel.deleteLinksByCategoryId(id);
        
            // 2. ลบประเภทปัญหาเอง
            await IssueCategoryModel.deleteCategory(id);
        
            res.status(200).json({ message: "ลบประเภทปัญหาและความสัมพันธ์สำเร็จ" });
            } catch (err) {
            console.error('❌ deleteIssueCategory error:', err.message);
            res.status(500).json({ error: 'ไม่สามารถลบประเภทปัญหาได้' });
            }
        },
    updateIssueCategory: async (req, res) => {
    const id = parseInt(req.params.id);
    const { categoryName, roomTypeIds } = req.body;

    try {
        if (isNaN(id) || !categoryName || !Array.isArray(roomTypeIds)) {
        return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" });
        }

        // 1. อัปเดตชื่อประเภทปัญหา
        await IssueCategoryModel.updateCategoryName(id, categoryName);

        // 2. ลบความสัมพันธ์เดิม
        await IssueCategoryModel.deleteLinksByCategoryId(id);

        // 3. สร้างความสัมพันธ์ใหม่
        await IssueCategoryModel.linkCategoryToRooms(id, roomTypeIds);

        res.status(200).json({ message: "อัปเดตประเภทปัญหาและการเชื่อมต่อห้องสำเร็จ" });
    } catch (err) {
        console.error('❌ updateIssueCategory error:', err.message);
        res.status(500).json({ error: 'ไม่สามารถอัปเดตประเภทปัญหาได้' });
    }
    },

    getIssueCategoryById: async (req, res) => {
        const id = parseInt(req.params.id);
        const role = req.user?.role;
        const adminId = req.user?.userId;
        const isSuper = role === "superadmin";

        try {

            if (!adminId) {
                return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
            }
    
            if (!isSuper) {
                return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this department" });
            }

            if (isNaN(id)) {
                return res.status(400).json({ error: "รหัสประเภทปัญหาไม่ถูกต้อง" });
            }
        
            // ดึงข้อมูลประเภทปัญหา
            const categoryResult = await IssueCategoryModel.getCategoryById(id);
        
            if (categoryResult.rows.length === 0) {
                return res.status(404).json({ error: "ไม่พบประเภทปัญหา" });
            }
        
            const category = categoryResult.rows[0];
        
            // ดึงข้อมูล room types พร้อมชื่อ
            const roomResult = await IssueCategoryModel.getRoomsWithNameByCategoryId(id);
        
            const roomTypes = roomResult.rows.map((row) => ({
                id: row.room_type_id,
                name: row.room_type_name
            }));
        
            res.status(200).json({
                id: category.id,
                category_name: category.category_name,
                roomTypes: roomTypes
            });
        
            } catch (err) {
            console.error('❌ getIssueCategoryById error:', err.message);
            res.status(500).json({ error: 'ไม่สามารถดึงประเภทปัญหาได้' });
            }
        },
    
    getAllRoomTypes: async (req, res) => {
        const role = req.user?.role;
        const adminId = req.user?.userId;
        const isSuper = role === "superadmin";

        try {

            if (!adminId) {
                return res.status(401).json({ error: "Unauthorized", message: "Admin ID is missing" });
            }
    
            if (!isSuper) {
                return res.status(403).json({ error: "Forbidden", message: "You do not have permission to view this department" });
            }

            const result = await IssueCategoryModel.getAllRoomTypes();

            const roomTypes = result.rows.map((row) => ({
            id: row.id,
            name: row.type_name
            }));

            res.status(200).json(roomTypes);
        } catch (err) {
            console.error('❌ getAllRoomTypes error:', err.message);
            res.status(500).json({ error: 'ไม่สามารถดึงประเภทห้องได้' });
        }
        },

};

module.exports = IssueCategoryController;
