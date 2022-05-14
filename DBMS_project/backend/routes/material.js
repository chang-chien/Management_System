var express = require("express");
var router = express.Router();

const { v4: uuidv4 } = require("uuid");

/* GET material listening. */
router.get("/", function (req, res, next) {
  // #swagger.tags = ['Material']
  res.send("In Material!!");
});

router.post("/getAllMaterials", function (req, res, next) {
  // #swagger.tags = ['Unfinished']
});

router.post("/getMaterialHistory", function (req, res, next) {
  // #swagger.tags = ['Unfinished']
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  const materialId = req.body.materialId;
  mysqlPoolQuery(
    "SELECT * from user WHERE user_id = ?",
    userId,
    function (err, rows) {
      if (err) {
        res.status(404).json({ success: false, err: err });
      } else if (rows.length > 0) {
        mysqlPoolQuery(
          "SELECT * FROM material WHERE material_id = ?",
          materialId,
          function (err, rows) {
            if (err) {
              res.status(404).json({ success: false, err: err });
            } else if (rows.length > 0) {
              mysqlPoolQuery(
                "SELECT price, amount, cost, time FROM material_history WHERE user_id = ? AND material_id = ?",
                [userId, materialId],
                function (err, rows) {
                  if (err) {
                    res.status(404).json({ success: false, err: err });
                  } else {
                    res
                      .status(200)
                      .json({ success: true, materialInformation: rows });
                  }
                }
              );
            } else {
              res.status(404).json({ success: false, err: "原料不存在" });
            }
          }
        );
      } else {
        res.status(404).json({ success: false, err: "使用者不存在" });
      }
    }
  );
});

// 取得原料name與id的dictionary
router.post("/getMaterialDict", function (req, res, next) {
  /* 
  #swagger.tags = ['Material']
  #swagger.responses[200] = {
    description: '取得成功',
  }
  #swagger.responses[409] = {
    description: '使用者不存在',
  }
  */
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  mysqlPoolQuery(
    "SELECT * FROM user WHERE user_id = ?",
    userId,
    function (err, rows) {
      if (err) {
        res.status(404).json({ success: false, err: err });
      } else if (rows.length > 0) {
        mysqlPoolQuery(
          "SELECT material_name, material_id FROM material WHERE user_id = ? ",
          userId,
          function (err, rows) {
            if (err) {
              res.status(404).json({ success: false, err: err });
            } else {
              let materialDict = {};
              for (let i = 0; i < rows.length; i++) {
                materialDict[rows[i].material_name] = rows[i].material_id;
              }
              res
                .status(200)
                .json({ success: true, materialDict: materialDict });
            }
          }
        );
      } else {
        res.status(409).json({ success: false, err: "使用者不存在" });
      }
    }
  );
});

router.post("/addNewMaterial", function (req, res, next) {
  /*
  #swagger.tags = ['Material']
  #swagger.responses[201] = {
    description: '新增初始原料成功',
  }
  #swagger.responses[409] = {
    description: '原料名稱已存在',
  }
  */
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  const materialName = req.body.materialName;
  const materialPrice = req.body.materialPrice || 0;
  const materialAmount = req.body.materialAmount || 0;
  const materialId = uuidv4();
  let insertMaterial = {
    material_id: materialId,
    material_name: materialName,
    material_amount: materialAmount,
    user_id: userId,
  };
  // insert new material
  mysqlPoolQuery(
    "SELECT material_name FROM material WHERE material_name = ?",
    materialName,
    function (err, rows) {
      if (rows.length > 0) {
        res.status(409).json({ success: false, err: "原料名稱已存在" });
      } else {
        mysqlPoolQuery(
          "INSERT INTO material SET ?",
          insertMaterial,
          function (err, rows) {
            if (err) {
              res.status(404).json({ success: false, err: err });
            } else if (materialAmount > 0) {
              // 若有初始數量，則新增原料記錄
              let insertMaterialHistory = {
                mh_id: uuidv4(),
                user_id: userId,
                material_id: materialId,
                amount: materialAmount,
                price: materialPrice,
                cost: materialAmount * materialPrice,
                time: new Date(Date.now()),
              };
              mysqlPoolQuery(
                "INSERT INTO material_history SET ?",
                insertMaterialHistory,
                function (err, rows) {
                  if (err) {
                    res.status(404).json({ success: false, err: err });
                  } else {
                    res
                      .status(201)
                      .json({ success: true, message: "新增初始原料成功" });
                  }
                }
              );
            } else {
              res
                .status(201)
                .json({ success: true, message: "新增初始原料成功" });
            }
          }
        );
      }
    }
  );
});

router.post("/deleteMaterial", function (req, res, next) {
  /* 
  #swagger.tags = ['Material']
  #swagger.responses[200] = {
    description: '刪除原料成功',
  }
  */
  const mysqlPoolQuery = req.pool;
  const userId = req.body.userId;
  const materialId = req.body.materialId;
  mysqlPoolQuery(
    "DELETE FROM material WHERE material_id = ? AND user_id = ?",
    [materialId, userId],
    function (err, rows) {
      if (err) {
        res.status(404).json({ success: false, err: err });
      } else {
        res.status(200).json({ success: true, message: "刪除原料成功" });
      }
    }
  );
});

router.post("/updateAmount", function (req, res, next) {
  // #swagger.tags = ['Unfinished']
});

module.exports = router;
