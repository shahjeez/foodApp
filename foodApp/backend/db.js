import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "recipedia_db",
  password: "shahjee",
  port: 5432,
});
export default pool;
