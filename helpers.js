
const getUserByEmail = (email, database) => {
    for (let id in database) {
      if (email === database[id].email) {
        return database[id];
      }
    }
    return null;
  };



  module.exports = {getUserByEmail};