import { LoggerType } from "../server/logger"
import { IRoute, t } from "../server/my-router"
import AuthService from "./service"

export default class AuthHandler {
    constructor(private readonly route: IRoute, private readonly logger: LoggerType, private readonly service: AuthService) { }

    private get = this.route.get('/').query(t.object({
        id: t.string().optional(),
    })).handler(async ({ query, req }) => {
        const logger = this.logger.Logger(req)
        logger.info('Request', query)

        const data = await this.service.getProfile(logger)

        return {
            message: 'Hello World',
            data,
        }
    })

    private post = this.route.post('/').handler(async () => {
        return {
            message: 'Hello World',
        }
    })
}