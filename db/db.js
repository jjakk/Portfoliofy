let { Pool, Client } = require("pg");
let pool = process.env.DATABASE_URL ? new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}) : new Pool({
    user: "postgres",
    database: "portfolify"
});

pool.connect().then(() => {
    pool.query("SELECT current_database()").then(({ rows: [{ current_database }] }) => {
        console.log(`Connected to database: ${current_database}`);
    });
});

module.exports = pool;