import AuthHandler from './auth/handler'
import AuthRepository from './auth/repository'
import AuthService from './auth/service'
import Database from './db'
import Logger, { LoggerType } from './server/logger'
import { IRoute, TypeRoute, t } from './server/my-router'
import Server from './server/server'
import  config from './config'
const { MONGO_URL } = config

const db = new Database(MONGO_URL)
const app = new Server(async () => {
    await db.connect()
})

const PORT = process.env.PORT ?? 3000
const myRoute: IRoute = new TypeRoute()
const logger = new Logger()
const authRepository = new AuthRepository(db)
const authService = new AuthService(authRepository)

app.route('/api/v1/auth', new AuthHandler(myRoute, logger, authService))

app.listen(PORT)