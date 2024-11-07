const { v4 } = require("uuid");

const addUser = async (event) => {
  const { name, lastName, amount } = event.body;
  const createdAt = new Date();
  const id = v4();
};

module.exports = {
  addUser,
};
