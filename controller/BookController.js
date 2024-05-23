const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const allBooks = (req, res) => {
  let { category_id } = req.query;

  // 쿼리가 있을 때와 없을 때로 분리
  if (category_id) {
    let sql = "SELECT * FROM books WHERE category_id=?";

    conn.query(sql, category_id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }

      if (results.length) {
        return res.status(StatusCodes.OK).json(results);
      } else {
        return res.status(StatusCodes.NOT_FOUND).end();
      }
    });
  } else {
    let sql = "SELECT * FROM books";

    conn.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }

      return res.status(StatusCodes.OK).json(results);
    });
  }
};

const bookDetail = (req, res) => {
  // parseInt로 묶으면 int로 바뀌면서 json 형태가 x
  // 비구조화 불가능
  let { id } = req.params;

  let sql = "SELECT * FROM books WHERE id=?";

  conn.query(sql, id, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results[0]) {
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

module.exports = { allBooks, bookDetail };
