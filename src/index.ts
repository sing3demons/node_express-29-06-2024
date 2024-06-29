import { IRoute, TypeRoute, t } from './my-router'
import Server from './server'

const app = new Server().start()

const PORT = process.env.PORT ?? 3000
const myRoute: IRoute = new TypeRoute()

class Handler {
    constructor(private readonly route: IRoute) { }

    get = this.route.get('/').query(t.object({
        id: t.string().optional(),
    })).handler(async ({ query, req }) => {
        const txId = req.headers['x-transaction-id'] as string
        return {
            message: 'Hello World',
            data: {
                id: query.id,
                txId
            },
        }
    })

    private post = this.route.post('/').handler(async () => {
        return {
            message: 'Hello World',
        }
    })
}

app.route('/api', new Handler(myRoute))

app.listen(PORT)