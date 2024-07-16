require("express-async-errors")
require("dotenv/config")

const migrationsRun = require("./database/sqlite/migrations")
const AppError = require("./utils/AppError")
const express = require("express")
const uploadConfig = require("./config/upload")
const cors = require("cors")

migrationsRun()

const app = express()
app.use(cors())

const routes = require("./routes")

app.use(express.json())
app.use(routes)

app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER))

app.use((error, request, response, next) => {
    if(error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message
        })
    }

    return response.status(500).json({
        status: "error",
        message: "Internal sever error"
    })
})

const PORT = process.env.SERVER_PORT || 3333
app.listen(PORT, () => console.log(`Sever is running on Port:${PORT}`))