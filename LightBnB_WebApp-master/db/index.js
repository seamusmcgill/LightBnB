const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

module.exports = {
  query: (text, params) => {
    const today = new Date();
    return Promise.resolve(pool.query(text, params), console.log(`Executed query ${text} \nat ${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`));
  },
};