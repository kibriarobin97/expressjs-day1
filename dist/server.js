import express, { json, } from "express";
const app = express();
const port = config.port;
import { Pool, Query } from "pg";
import config from "./config";
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
const pool = new Pool({
    connectionString: config.connection_string,
});
const initDB = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20),
      email VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      age INT,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
        console.log("database connected successfully");
    }
    catch (error) {
        console.log(error);
    }
};
initDB();
app.get("/", (req, res) => {
    //   res.send("Express server is running");
    res.status(200).json({
        message: "Express server is running",
        author: "Robin",
    });
});
// create user
app.post("/api/users", async (req, res) => {
    // console.log(req.body);
    const { name, email, age, password } = req.body;
    try {
        const result = await pool.query(`
    INSERT INTO users(name, email, age, password) VALUES($1, $2, $3, $4)
    RETURNING *
    `, [name, email, age, password]);
        // console.log(result)
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error,
        });
    }
});
// get all users
app.get("/api/users", async (req, res) => {
    try {
        const result = await pool.query(`
    SELECT * FROM users
    `);
        res.status(200).json({
            success: true,
            message: "User retrieved successfully ",
            data: result.rows,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error,
        });
    }
});
// get single user
app.get("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
      SELECT * FROM users WHERE id=$1
      `, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
                data: {},
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error,
        });
    }
});
// update user --- PUT method
app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, password, age, is_active } = req.body;
    try {
        const result = await pool.query(`
    UPDATE users 
    SET 
    name=COALESCE($1, name),
    password=COALESCE($2, password), 
    age=COALESCE($3, age),
    is_active=COALESCE($4, is_active)
    
    WHERE id=$5 RETURNING *
    `, [name, password, age, is_active, id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
                data: {},
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error,
        });
    }
});
// delete user ---- DELETE method
app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
      DELETE FROM users WHERE id=$1
      `, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
                data: {},
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: {},
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error,
        });
    }
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=server.js.map