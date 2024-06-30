import express from 'express'
import type { Express, Request, Response, NextFunction, RequestHandler } from 'express'
import http from 'http'
import { v7 as uuid } from 'uuid'
import { globalErrorHandler, MyRouter } from './my-router'
import logMiddleware from './middleware'

interface IServer {
    start: () => IServer
    use: (handler: RequestHandler) => IServer
    listen: (port: number) => void
}

class Server implements IServer {
    private readonly app: Express
    constructor() {
        this.app = express()
        this.app.use((req: Request, _res: Response, next: NextFunction) => {
            if (!req.headers['x-transaction-id']) {
                req.headers['x-transaction-id'] = uuid()
            }
            next()
        })
        this.app.use(express.json({ limit: '50mb' }))
        this.app.use(express.urlencoded({ extended: true }))
        this.app.get('/healthz', (_req: Request, res: Response) => { res.status(200).send('OK') })
        this.app.use(logMiddleware)
    }
    public start = (cb?: () => Promise<void> | void) => {
        cb?.()
        return this
    }
    // app.use(new MyRouter().Register(new ExampleController(myRoute)).instance)
    public route = (path: string, classInstance: object) => {
        this.app.use(path, new MyRouter().Register(classInstance).instance)
        return this
    }

    private get = (path: string, handler: RequestHandler) => {
        this.app.get(path, handler)
        return this
    }

    private post = (path: string, handler: RequestHandler) => {
        this.app.post(path, handler)
        return this
    }

    private put = (path: string, handler: RequestHandler) => {
        this.app.put(path, handler)
        return this
    }

    private delete = (path: string, handler: RequestHandler) => {
        this.app.delete(path, handler)
        return this
    }

    private patch = (path: string, handler: RequestHandler) => {
        this.app.patch(path, handler)
        return this
    }

    public use = (handler: RequestHandler) => {
        this.app.use(handler)
        return this
    }

    public listen = (port: number | string) => {
        this.app.use(globalErrorHandler)
        const server = http.createServer(this.app).listen(port, () => {
            console.log(`Server is running on port: ${port}`)
        })

        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received.')
            server.close(() => {
                console.log('Http server closed.')
                process.exit(0)
            })
        })

        process.on('SIGINT', () => {
            console.log('SIGINT signal received.')
            server.close(() => {
                console.log('Http server closed.')
                process.exit(0)
            })
        })
    }
}

export default Server