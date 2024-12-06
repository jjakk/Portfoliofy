const pool = require("../db/db");

/* middleware; check if login token in token storage, if not, 403 response */
let requireAuth = async (req, res, next) => {
  const token = req.headers["authorization"].replace("Bearer ", "");
  const { rows: [tokenCell] } = await pool.query("SELECT * FROM TOKENS WHERE CODE = $1", [token]);
  if (token === undefined || !tokenCell) {
    res.status(403);
    return res.send("Token not found"); // TODO
  }
  const { rows: [user] } = await pool.query("SELECT * FROM USERS WHERE USER_ID = $1", [tokenCell.user_id]);
  if (!user) {
    res.status(403);
    return res.send("No user associated with this token"); // TODO
  }
  else {
    req.user = user;
    next();
  }
};

module.exports = requireAuth;