/* middleware; check if login token in token storage, if not, 403 response */
let requireAuth = (req, res, next) => {
    let { token } = req.cookies;
      console.log(token, tokenStorage);
      if (token === undefined || !tokenStorage.hasOwnProperty(token)) {
        res.status(403);
        return res.send("Token not found"); // TODO
      }
      next();
};

module.exports = requireAuth;