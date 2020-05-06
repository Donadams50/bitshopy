const  jwt =require('jsonwebtoken');
const dotenv=require('dotenv');

dotenv.config();

exports.signToken= (userId, userUsername, userEmail)=> {
    const key = process.env.SECRET_KEY;
    const token = jwt.sign({ id: userId, username:userUsername,email: userEmail }, key, { expiresIn: '1h' });
    return token;
  }

  exports.verifyToken= (req, res, next)=> { 
    const key = process.env.SECRET_KEY;
    const token = req.headers.authorization || req.params.token;
    if (!token) {
      res.status(403).json({ status: 403, error: 'No token provided' }); 
    }else{
      jwt.verify(token, key, (error, decoded) => {
        if (error) {
          console.log(error)
          res.status(401).json({ status: 401, error: 'Unauthorized' });
        }else{
          req.decoded = decoded;
          next();
        }
       
      });
    }
    
  }