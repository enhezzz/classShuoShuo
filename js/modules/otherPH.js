const express = require("express");
const router = express.Router();
var db = require("../mongodb");
router.get("/", (req, res) => {
  if (req.session.info) {
    db.find("shuoshuo", { cardId: req.query.cardId }, function(result) {
      let shuoshuos = [];
      result[0]["content"].forEach(function(item, index) {
        if (index < 3) shuoshuos.unshift(item);
      });
      var info = {};
      info.shuoshuos = shuoshuos;

      info.cardId = req.query.cardId;
      db.find("student", { cardId: req.query.cardId }, function(response) {
        if (response.length) {
          info.name = response[0].name;
          const registDate = response[0].date;
          const now = new Date();
          const yearGap = now.getFullYear() - registDate.getFullYear();
          const monthGap = now.getMonth() - registDate.getMonth();
          const dayGap = now.getDate() - registDate.getDate();
          const date = yearGap
            ? registDate.getFullYear() +
              "年" +
              registDate.getMonth() +
              "月" +
              registDate.getDate() +
              "日"
            : monthGap
              ? monthGap + "月前"
              : !dayGap
                ? "今天"
                : dayGap == 1 ? "昨天" : dayGap == 2 ? "前天" : dayGap + "天前";
          info.date = date;
          db.find("homePage", { cardId: req.query.cardId }, function(response) {
            console.log(response[0]);
            if (response[0]) {
              console.log("---------");
              db.update(
                "homePage",
                { cardId: req.query.cardId },
                { $inc: { accessSum: 1 } },
                function() {}
              );
              info.accessSum = response[0].accessSum + 1;
              console.log(info);
              res.render("otherPH.html", info);
            }
          });
        }
      });
    });
  } else res.render("index", { msg: "注册", name: "登录" });
});
module.exports = router;
