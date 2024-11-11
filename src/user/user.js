const { v4 } = require("uuid");
const AWS = require("aws-sdk");
/**
 * Adds a new user to the DynamoDB table.
 * @param {Object} event - The event object containing the user data.
 * @param {string} event.body - JSON string containing user details (name, lastName, amount).
 * @returns {Object} - HTTP response with status code and the created user object.
 */
const addUser = async (event) => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const { name, lastName, amount } = JSON.parse(event.body);
    const userId = v4();

    const newUser = {
      userId,
      name,
      lastName,
      amount,
      createdAt: new Date().toISOString(),
    };

    await dynamodb
      .put({
        TableName: "UserTable",
        Item: newUser,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(newUser),
    };
  } catch (error) {
    console.log(error);
  }
};
/**
 * Retrieves all users from the DynamoDB table.
 * @returns {Object} - HTTP response with status code and an array of all user objects.
 */
const getAllUsers = async () => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const result = await dynamodb
      .scan({
        TableName: "UserTable",
      })
      .promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.log(error);
  }
};
/**
 * Retrieves a single user by their ID.
 * @param {Object} event - The event object containing path parameters.
 * @param {Object} event.pathParameters - The path parameters containing the userId.
 * @param {string} event.pathParameters.userId - The ID of the user to retrieve.
 * @returns {Object} - HTTP response with status code and user data, or error if not found.
 */
const getUser = async (event) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const { userId } = event.pathParameters;

  const result = await dynamodb
    .get({
      TableName: "UserTable",
      Key: { userId },
    })
    .promise();

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "User not found" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
};
/**
 * Updates a user's information.
 * @param {Object} event - The event object containing path parameters and updated data.
 * @param {Object} event.pathParameters - The path parameters containing the userId.
 * @param {string} event.pathParameters.userId - The ID of the user to update.
 * @param {string} event.body - JSON string containing updated user details (name, lastName, amount).
 * @returns {Object} - HTTP response with status code and updated user data.
 */
const updateUser = async (event) => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const { userId } = event.pathParameters;
    const { name, lastName, amount } = JSON.parse(event.body);

    const result = await dynamodb
      .update({
        TableName: "UserTable",
        Key: { userId },
        UpdateExpression:
          "set #name = :name, #lastName = :lastName, #amount = :amount",
        ExpressionAttributeNames: {
          "#name": "name",
          "#lastName": "lastName",
          "#amount": "amount",
        },
        ExpressionAttributeValues: {
          ":name": name,
          ":lastName": lastName,
          ":amount": amount,
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.log(error);
  }
};
/**
 * Deletes a user by their ID.
 * @param {Object} event - The event object containing path parameters.
 * @param {Object} event.pathParameters - The path parameters containing the userId.
 * @param {string} event.pathParameters.userId - The ID of the user to delete.
 * @returns {Object} - HTTP response with status code and a confirmation message.
 */
const deleteUser = async (event) => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const { userId } = event.pathParameters;

    await dynamodb
      .delete({
        TableName: "UserTable",
        Key: { userId },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User deleted successfully" }),
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
