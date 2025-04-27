const db = require('../../config/db');

const IssueCategoryModel = {
  getAllCategories: () => {
    const query = `
        SELECT id, category_name
        FROM issue_categories
        ORDER BY id ASC;
        `;
    return db.query(query);
    },

  createCategory: (categoryName) => {
    const query = `
      INSERT INTO issue_categories (category_name)
      VALUES ($1)
      RETURNING id;
    `;
    return db.query(query, [categoryName]);
    },

  linkCategoryToRooms: (categoryId, roomTypeIds) => {
    const values = roomTypeIds.map((roomTypeId) => `(${roomTypeId}, ${categoryId})`).join(',');

    const query = `
      INSERT INTO issue_room_type (room_type_id, issue_id)
      VALUES ${values};
    `;

    return db.query(query);
  },

  deleteLinksByCategoryId: (categoryId) => {
    const query = `
      DELETE FROM issue_room_type
      WHERE issue_id = $1;
    `;
    return db.query(query, [categoryId]);
  },
  
  deleteCategory: (categoryId) => {
    const query = `
      DELETE FROM issue_categories
      WHERE id = $1;
    `;
    return db.query(query, [categoryId]);
  },

  updateCategoryName: (categoryId, categoryName) => {
  const query = `
    UPDATE issue_categories
    SET category_name = $1
    WHERE id = $2;
  `;
  return db.query(query, [categoryName, categoryId]);
},

  getCategoryById: (categoryId) => {
    const query = `
      SELECT id, category_name
      FROM issue_categories
      WHERE id = $1;
    `;
    return db.query(query, [categoryId]);
  },

  getRoomsWithNameByCategoryId: (categoryId) => {
    const query = `
      SELECT rt.id AS room_type_id, rt.type_name AS room_type_name
      FROM issue_room_type irt
      JOIN room_type rt ON irt.room_type_id = rt.id
      WHERE irt.issue_id = $1;
    `;
    return db.query(query, [categoryId]);
  },

  getAllRoomTypes: () => {
    const query = `
      SELECT id, type_name
      FROM room_type
      ORDER BY id ASC;
    `;
    return db.query(query);
  },

  
};

module.exports = IssueCategoryModel;
