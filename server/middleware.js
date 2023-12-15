const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  // if (!token) {
  //   return res.json({ error: "No token provided!",code:"logout" });
  // }

  jwt.verify(token, 'totb-front', (err, decoded) => {
    if(token){
      if (err) {
        return res.json({ error: "Unauthorized!",code:"logout" });
      } else{
        req.userId = decoded.id;
      }
    } else{
      req.userId = '';
    }
    next();
  });
};

const middleware = {
  verifyToken
};
module.exports = middleware;