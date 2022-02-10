const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Link to the lightbnb postgreSQL database
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  // Query database with user-inputted email
  return pool.query(`
  SELECT * 
  FROM users
  WHERE email = $1`, [email])
    .then(result => {
      if (result.rows.length === 0) {
        return null;
      }
      // Return user object if successful
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  // Query database for a user with a specific ID
  return pool.query(`
  SELECT * 
  FROM users
  WHERE id = $1`, [id])
    .then(result => {
      if (result.rows.length === 0) {
        return null;
      }
      // Return user object if successful
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  // Insert user into database and return object with user ID
  return pool.query(`
  INSERT INTO users
    (name, email, password)
  VALUES 
    ($1, $2, $3) 
  RETURNING *`, [user.name, user.email, user.password])
    .then(result => result.rows[0])
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  // Return all reservation details including property details
  return pool.query(`
  SELECT reservations.*, properties.*, AVG(property_reviews.rating) as average_rating
  FROM reservations 
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON property_reviews.property_id = properties.id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id, properties.id
  LIMIT $2`, [guest_id, limit])
    .then(result => result.rows)
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {

  // Create empty array for parameters and initial select statement
  const queryParams = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // Include a where clause if there are any search terms
  if (options) {
    queryString += "WHERE ";
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `owner_id = $${queryParams.length} AND `;
  }

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `city LIKE $${queryParams.length} AND `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`);
    queryString += `cost_per_night <= $${queryParams.length} AND `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    queryString += `cost_per_night >= $${queryParams.length} AND `;
  }

  // Remove any trailing ANDs if they exist
  if (queryString.slice(-4) === "AND ") {
    queryString = queryString.slice(0, -4);
  }

  queryString += `GROUP BY properties.id `;

  // Aggregate average rating in a HAVING clause
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `HAVING avg(property_reviews.rating) > $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams)
    .then((result) => result.rows)
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  return pool.query(`
  INSERT INTO properties
    (title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code)
  VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
  RETURNING *`, [property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms, property.country, property.street, property.city, property.province, property.post_code])
    .then(result => result.rows[0])
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addProperty = addProperty;
