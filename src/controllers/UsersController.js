const sqliteConnection = require("../database/sqlite")
const AppError = require("../utils/AppError")
const { hash, compare } = require("bcryptjs")

class UsersController {
   async create( request, response) {
   const { name, email, password } = request.body

   const database = await sqliteConnection()

   const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

   if(checkUserExists) {
      throw new AppError("Este email já esta em uso!")
   }

   const passwordHashed = await hash(password, 3)

   await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, passwordHashed])

   return response.status(201).json("Usuário cadastrado")
   }

   async update(request, response) {
      const { name, email, password, old_password } = request.body
      const user_id = request.user.id

      const database = await sqliteConnection()
      
      const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id])
      
      if(!user) {
         throw new AppError("Usuário não encontrado!")
      }

      const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = ?", [email])

      if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
        throw new AppError("Email já cadastrado!")
      }      

      user.name = name ?? user.name
      user.email = email ?? user.email

      if(password && !old_password) {
         throw new AppError("É necessário informar a senha antiga.")
      }

      if( password && old_password) {
         const checkOldPassword = await compare(old_password, user.password)

         if(!checkOldPassword) {
            throw new AppError("As senha não correspondem.")
         }

         user.password = await hash(password, 3)
      }

      await database.run("UPDATE users SET name = ?, email = ?, password = ?, updated_at = DATETIME('NOW') WHERE id = ?", [user.name, user.email, user.password, user_id])

      return response.json("Usuário atualizado")
   }
}  

module.exports = UsersController