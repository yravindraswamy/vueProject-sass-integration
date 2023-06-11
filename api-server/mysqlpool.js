const { createPool } = require("mysql");
const pool = createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "Ravindra",
  password: "SASS",
  database: "users",
  port: 3306,
});

module.exports = pool;
