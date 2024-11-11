const { v4 } = require("uuid");
const AWS = require("aws-sdk");

/**
 * Adds a new transaction to the DynamoDB table.
 * @param {Object} event - The event object containing the transaction data.
 * @param {string} event.body - JSON string containing the transaction details (amount, contact, description, type).
 * @returns {Object} - HTTP response with status code and the created transaction object.
 */
const addTransaction = async (event) => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const { amount, contact, description, type } = JSON.parse(event.body);
    const transactionId = v4();

    const newTransaction = {
      transactionId,
      amount,
      contact,
      description,
      type,
      createdAt: new Date().toISOString(),
    };

    await dynamodb
      .put({
        TableName: "TransactionTable",
        Item: newTransaction,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(newTransaction),
    };
  } catch (error) {
    console.log(error);
  }
};
/**
 * Retrieves a list of transactions with optional pagination.
 * @param {Object} event - The event object containing query parameters.
 * @param {Object} event.queryStringParameters - Query parameters for pagination (optional).
 * @param {string} [event.queryStringParameters.lastEvaluatedKey] - Encoded JSON string for pagination.
 * @returns {Object} - HTTP response with status code, items (transactions), and lastEvaluatedKey for pagination.
 */
const getAllTransactions = async (event) => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    // Parse lastEvaluatedKey from query parameters if it exists
    let lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey
      ? JSON.parse(
          decodeURIComponent(event.queryStringParameters.lastEvaluatedKey)
        ) // Decodificar el parámetro URL
      : undefined;
    const params = {
      TableName: "TransactionTable",
      Limit: 10, // Set maximum items per request to 10,
      ScanIndexForward: false,
    };

    // If a lastEvaluatedKey is provided, add it to the params for pagination
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey); // Parse lastEvaluatedKey if it's present
    }
    const result = await dynamodb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items,
        lastEvaluatedKey: result.LastEvaluatedKey
          ? JSON.stringify(result.LastEvaluatedKey)
          : null, // Si hay más registros, devolvemos el `lastEvaluatedKey`
      }),
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve transactions",
        error: error.message,
      }),
    };
  }
};
/**
 * Retrieves a single transaction by its ID.
 * @param {Object} event - The event object containing path parameters.
 * @param {Object} event.pathParameters - The path parameters containing the transactionId.
 * @param {string} event.pathParameters.transactionId - The ID of the transaction to retrieve.
 * @returns {Object} - HTTP response with status code and transaction data, or error if not found.
 */
const getTransaction = async (event) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const { transactionId } = event.pathParameters;

  const result = await dynamodb
    .get({
      TableName: "TransactionTable",
      Key: { transactionId },
    })
    .promise();

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Transaction not found" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
};
/**
 * Updates a transaction's details.
 * @param {Object} event - The event object containing path parameters and updated data.
 * @param {Object} event.pathParameters - The path parameters containing the transactionId.
 * @param {string} event.pathParameters.transactionId - The ID of the transaction to update.
 * @param {string} event.body - JSON string with updated transaction details (amount, contact, description, type).
 * @returns {Object} - HTTP response with status code and updated transaction data.
 */
const updateTransaction = async (event) => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const { transactionId } = event.pathParameters;
    const { amount, contact, description, type } = JSON.parse(event.body);
    const result = await dynamodb
      .update({
        TableName: "TransactionTable",
        Key: { transactionId },
        UpdateExpression:
          "set #amount = :amount, #contact = :contact, #description = :description, #type = :type",
        ExpressionAttributeNames: {
          "#amount": "amount",
          "#contact": "contact",
          "#description": "description",
          "#type": "type",
        },
        ExpressionAttributeValues: {
          ":amount": amount,
          ":contact": contact,
          ":description": description,
          ":type": type,
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
 * Deletes a transaction by its ID.
 * @param {Object} event - The event object containing path parameters.
 * @param {Object} event.pathParameters - The path parameters containing the transactionId.
 * @param {string} event.pathParameters.transactionId - The ID of the transaction to delete.
 * @returns {Object} - HTTP response with status code and a confirmation message.
 */
const deleteTransaction = async (event) => {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const { transactionId } = event.pathParameters;

    await dynamodb
      .delete({
        TableName: "TransactionTable",
        Key: { transactionId },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Transaction deleted successfully" }),
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addTransaction,
  getAllTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
