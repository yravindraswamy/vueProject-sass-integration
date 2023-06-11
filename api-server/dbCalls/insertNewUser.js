module.exports = (
  mysqlConfig,
  { firstName, lastName, DOB, userName, hashedPassword }
) => {
  return new Promise((resolve, reject) => {
    if (!(firstName && lastName && DOB && userName && hashedPassword)) {
      reject(`required params are missing`);
    }
    dbParams = [firstName, lastName, DOB, userName, hashedPassword];
    mysqlConfig.query(
      `call insert_user_details_into_users_details(?,?,?,?,?)`,
      dbParams,
      (err, result, fields) => {
        if (err) {
          reject(`${err}`);
        }
        resolve(result);
      }
    );
  });
};
