import Logger, { LoggerType } from './logger'
import { IRoute, TypeRoute, t } from './my-router'
import Server from './server'

const app = new Server().start()

const PORT = process.env.PORT ?? 3000
const myRoute: IRoute = new TypeRoute()
const logger = new Logger()

class Handler {
    constructor(private readonly route: IRoute, private readonly logger: LoggerType) { }

    private get = this.route.get('/').query(t.object({
        id: t.string().optional(),
    })).handler(async ({ query, req }) => {
        const logger = this.logger.Logger(req)
        logger.info('Request', query)
        return {
            message: 'Hello World',
            data: {
                id: query.id,
            },
        }
    })

    private post = this.route.post('/').handler(async () => {
        return {
            message: 'Hello World',
        }
    })
}

app.route('/api', new Handler(myRoute, logger))

app.listen(PORT)