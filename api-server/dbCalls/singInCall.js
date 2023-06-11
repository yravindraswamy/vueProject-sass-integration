module.exports = (mysqlConfig, { userName }) => {
  return new Promise((resolve, reject) => {
    //1. I have to learn about Error class
    //2. logger.info
    //3.
    if (!userName) {
      reject(`required parameters are missing`);
    }
    const dbParams = [userName];
    mysqlConfig.query(`call get_user_password(?)`, dbParams, (err, result) => {
      if (err) {
        reject(`incorrect password`);
      }
      const hashedPassword =
        result && result[0] && result[0][0]
          ? result[0][0].hashedPassword
          : reject(`Invalid Password`);
      resolve(hashedPassword);
    });
  });
};
