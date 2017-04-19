const Client = require('./Client');

/**
 * Cloud Function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.claimBook = function claimBook(event, callback) {
  console.log(`My Cloud claimBook Function: ${event.data.username}:***********`);

  const config = {
      email: event.data.username,
      password: event.data.password
    };

  const client = new Client(config);

  client.login()
  .then(()=>{
    client.claimBook();
  });

  callback();
};
