
const getUserByEmail = (email, database) => {
  for (let id in database) {
    if (email === database[id].email) {
      return database[id];
    }
  }
  return null;
};


const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substring(6);
};

const urlsForUsers = (id, database) => {
  let result = {};
  for (let key in database) {
    if (database[key].userID === id) {
      result[key] = database[key];
    }
  }
  return result;
};
  


  

module.exports = {getUserByEmail, generateRandomString, urlsForUsers};