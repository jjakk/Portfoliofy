let { Pool } = require("pg");
let env = require("../env.json");
let pool = new Pool(env.db);

pool.connect().then(() => {
    pool.query("SELECT current_database()").then(({ rows: [{ current_database }] }) => {
        console.log(`Connected to database: ${current_database}`);
    });
});

module.exports = pool;