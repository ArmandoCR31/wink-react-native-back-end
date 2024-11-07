const { v4 } = require("uuid");
const AWS = require("aws-sdk");

const addUser = async (event) => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const { name, lastName, amount } = JSON.parse(event.body);
    const createdAt = new Date();
    const userId = v4();

    const newUser = {
      userId,
      name,
      lastName,
      amount,
      createdAt,
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
