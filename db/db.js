let { Pool } = require("pg");
let pool = new Pool({
    user: "postgres",
    database: "portfolify"
});

pool.connect().then(() => {
    pool.query("SELECT current_database()").then(({ rows: [{ current_database }] }) => {
        console.log(`Connected to database: ${current_database}`);
    });
});

module.exports = pool;