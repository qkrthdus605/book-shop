const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto"); // 암호화

dotenv.config();

const join = (req, res) => {
  const { email, password } = req.body;

  // 비밀번호 암호화
  const salt = crypto.randomBytes(10).toString("base64");
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  let sql = "INSERT INTO users (email, password) VALUES (?, ?)";
  let values = [email, hashPassword, salt];

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.CREATED).json(result);
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  let sql = "SELECT * FROM users WHERE email = ?";

  conn.query(sql, email, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const loginUser = result[0];

    // salt값 꺼내서 날 것으로 들어온 비밀번호를 암호화
    const hashPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512")
      .toString("base64");

    // 디비 비밀번호랑 비교
    if (loginUser && loginUser.password == hashPassword) {
      const token = jwt.sign(
        {
          email: loginUser.email,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "10m",
          issuer: "soyeon",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
      });

      console.log(token);
      return res.status(StatusCodes.OK).json(result);
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};

const passwordResetRequest = (req, res) => {
  const { email } = req.body;

  let sql = "SELECT * FROM users WHERE email = ?";

  conn.query(sql, email, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const user = result[0];
    if (user) {
      return res.status(StatusCodes.OK).json({
        email: email,
      });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};

const passwordReset = (req, res) => {
  const { email, password } = req.body;

  let sql = "UPDATE users SET password=?, salt=? WHERE email=?";

  const salt = crypto.randomBytes(10).toString("base64");
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  let values = [hashPassword, salt, email];

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (result.affectedRows == 0) {
      return res.status(StatusCodes.BAD_REQUEST).end();
    } else {
      return res.status(StatusCodes.OK).json(result);
    }
  });
};

module.exports = { join, login, passwordReset, passwordResetRequest };
