const knex = require("../database/knex")
const AppError = require ("../utils/AppError")
const authConfig = require("../config/auth")

const { compare } = require("bcryptjs")
const { sign } = require("jsonwebtoken")

class SessionsController {
  async create (request, response) {
    const { email, password } = request.body

    const user = await knex("users").where({ email }).first()

    if(!user) {
      throw new AppError("Email não cadastrado!", 401)
    }

    const checkPassword = await compare( password, user.password)

    if(!checkPassword) {
      throw new AppError("Senha incorreta!", 401)
    }

    const { secret, expiresIn } = authConfig.jwt

    const token = sign({}, secret,{
      subject: String(user.id),
      expiresIn
    }) 

    return response.json({user, token})
  }
}

module.exports = SessionsController