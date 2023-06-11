module.exports = (mysqlConfig, { userName }) => {
  return new Promise((resolve, reject) => {
    if (!userName) {
      reject(`required params missing`);
    }
    const dbParams = [userName];
    mysqlConfig.query(
      `call get_Details_of_user(?)`,
      dbParams,
      (err, result) => {
        if (err) {
          reject(`something went wrong`);
        }
        const userDetails =
          result && result[0] && result[0][0]
            ? result[0][0]
            : reject("User Doesnot exist");
        resolve(userDetails);
      }
    );
  });
};
