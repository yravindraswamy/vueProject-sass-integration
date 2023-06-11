const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("./mysqlpool");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { singInCall, userIdentityCheck, insertNewUser } = require("./dbCalls");
const app = express();
app.use(express.json());
app.use(cors());
require("dotenv").config();

app.post("/api/get", (request, response) => {
  console.log(`you received a request from client`);
  response.json("Hello Ravindra Swamy");
});
// this is a midle ware function for checking user is existed
const userCheck = async (request, response, next) => {
  const { userName } = request.body;
  request.userExisted = false;
  const requestParams = { userName };
  try {
    try {
      const details = await userIdentityCheck(pool, requestParams);
      if (details) {
        request.userExisted = true;
        request.userDetails = { ...details };
      }
      next();
    } catch (err) {
      response.json(err);
    }
  } catch (err) {
    response.json(err);
  }
};
// API for user Registration
app.post("/api/Register", userCheck, (request, response) => {
  console.log(`you received a Request from client`);
  const { userName, password, firstName, lastName, DOB } = request.body;
  if (request.userExisted) {
    response.json({
      message: `user with these details already existed`,
      details: request.userDetails,
    });
    return;
  }
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    console.log(hashedPassword);
    const requestParams = {
      userName,
      hashedPassword,
      firstName,
      lastName,
      DOB,
    };
    console.log(requestParams);
    try {
      const result = insertNewUser(pool, requestParams);
      response.send(JSON.stringify(result));
    } catch (err) {
      response.json(err);
    }
  });
});

// API for user LOGIN
app.post("/api/SignIn", userCheck, async (request, response) => {
  const { userName, password } = request.body;
  const requestParms = { userName };
  try {
    const hashedPassword = await singInCall(pool, requestParms);
    // console.log(hashedPassword[0][0].hashedPassword);
    bcrypt.compare(password, hashedPassword, (err, result) => {
      // if password and hashedPassword comparison is success
      if (result === true) {
        const jwtToken = jwt.sign({ userName }, process.env.JWT_SECRET_KEY);
        response.status = 200;
        response.json({ jwtToken });
      }
      // password is not matched with hashedpassword
      else {
        response.json({ err: `incorrect Password` });
        process.exit(0);
      }
    });
  } catch (err) {
    response.json(err);
  }
});

// API for checking request authorization string only
const userAuthentication = (request, response, next) => {
  let jwtToken;
  const { authorization } = request.headers;
  if (authorization !== undefined) {
    jwtToken = authorization.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status = 401;
    response.send(`Invalid access Token`);
  } else {
    jwt.verify(jwtToken, process.env.JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        response.send(`Invalid Access Token`);
      } else {
        next();
      }
    });
  }
};
app.post("/api/authorization", userAuthentication, (request, response) => {
  console.log(`your are being verified please stay on`);
  response.json({ message: `user successfully verified` });
});
app.post("/api/Profile", userCheck, userAuthentication, (request, response) => {
  response.send(request.userDetails);
});
app.listen(process.env.PORT_NUMBER, () => {
  console.log(`server is running at ${process.env.PORT_NUMBER}`);
});
