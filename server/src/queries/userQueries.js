const pool = require('../db.js')

exports.getUserByUserName = async (username) =>{
     const result = await pool.query("SELECT * FROM users WHERE username = $1",[username])
     return result.rows[0]
}

exports.getUserByEmail = async (email) =>{
     const result = await pool.query("SELECT * FROM users WHERE email = $1",[email])
     return result.rows[0]
}

exports.createUser = async (username , email , password_hash) => {
    const result = await pool.query("INSERT INTO users (username , email , password_hash) VALUES ($1 , $2 , $3) RETURNING *",[username,email,password_hash])
    return result.rows[0]
}   

exports.userProfile = async (id) =>{
     const result = await pool.query("SELECT * FROM users WHERE id = $1",[id]) ;
     return result.rows[0];
}

exports.getAllUsers = async () => {
    const result = await pool.query("SELECT id FROM users");
    return result.rows;
}