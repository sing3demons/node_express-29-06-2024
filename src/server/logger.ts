import type { Request, Response, NextFunction } from 'express'
import { createLogger, format, transports, Logger as WinstonLog } from 'winston'

export type ContextType = Record<string, string>

export type ILogger = {
    info: (message: string, data?: any) => void
    warn: (message: string, data?: any) => void
    error: (message: string, data?: any) => void
    debug: (message: string, data?: any) => void
    // println: (message: string, data?: any) => void
}

interface ISensitive {
    maskNumber(mobileNo: string, mask?: string): string
    maskEmail(email: string): string
    maskPassword(password: string): string
    masking(item: any): void
}

interface IgnoreCase {
    equal(a: string, b: string): boolean
    notEqual(a: string, b: string): boolean
    contain(a: string, b: string): boolean
    notContain(a: string, b: string): boolean
    startWith(a: string, b: string): boolean
}

function makeStructuredClone<T>(obj: T): T {
    if (typeof obj === 'undefined') {
        return obj
    }
    const payload = JSON.parse(JSON.stringify(obj))
    if (typeof payload === 'object') {
        if (Array.isArray(payload)) {
            for (const item of payload) {
                if (typeof item === 'object') {
                    Sensitive.masking(item)
                }
            }
        } else {
            Sensitive.masking(payload)
        }
    }
    return payload
}

const Sensitive: ISensitive = {
    maskNumber: (mobileNo: string, mask?: string): string => {
        let maskData = 'XXX-XXX-XX'
        if (mask) {
            maskData = maskData.replace(/X/g, mask)
        }
        if (ignoreCase.startWith(mobileNo, '+')) {
            if (mobileNo.length >= 10) {
                return `${maskData}${mobileNo.substring(mobileNo.length - 2, mobileNo.length)}`
            }
        } else if (ignoreCase.startWith(mobileNo, '0') && mobileNo.length >= 10) {
            return `${maskData}${mobileNo.substring(mobileNo.length - 2, mobileNo.length)}`
        }

        return mobileNo
    },
    maskEmail: (email: string): string => {
        const rex = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
        if (!rex.test(email)) {
            return email
        } else {
            let [first, second] = email.split('@')
            if (!first) {
                return ''
            }
            if (first.length > 2) {
                const mask = first.substring(3, first.length)
                const notMask = first.substring(0, 3)
                first = notMask + 'X'.repeat(mask.length)
            } else {
                first = first.replace(first.substring(1, first.length), 'X'.repeat(first.length - 1))
            }
            return `${first}@${second}`
        }
    },
    maskPassword: (password: string): string => password.replace(password, '********'),
    masking: (item: any) => {
        for (const key in item) {
            if (ignoreCase.equal(key, 'password')) {
                item[key] = Sensitive.maskPassword(item[key])
            } else if (ignoreCase.equal(key, 'email')) {
                item[key] = Sensitive.maskEmail(item[key])
            } else if (ignoreCase.equal(key, 'mobileNo')) {
                item[key] = Sensitive.maskNumber(item[key])
            } else if (ignoreCase.equal(key, 'phone')) {
                item[key] = Sensitive.maskNumber(item[key])
            } else if (typeof item[key] === 'object') {
                Sensitive.masking(item[key])
            }
        }
    },
}

export const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()
    const session = req.header('x-transaction-id') as string ?? 'unknown'

    const originalSend = res.json
    res.json = (data) => {
        const duration = Date.now() - start;
        let logInfo = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: res.statusCode === 200 ? 'Request Success' : 'Request Failed',
            session: {
                id: session,
                ip: req.ip,
                device: req.headers['user-agent'],
                location: req.headers['x-location'],
            },
            service: {
                name: 'Service-HTTP',
                version: '1.0.0',
                host: req.hostname
            },
            request: {
                path: req.originalUrl,
                status: res.statusCode,
                duration_ms: duration,
                headers: req.headers,
                host: req.headers.host,
                baseUrl: req.baseUrl,
                url: req.url,
                method: req.method,
                body: req.body,
                params: req?.params,
                query: req?.query,
                clientIp: req.headers['x-forwarded-for'] ?? req?.socket.remoteAddress,
            },
            response: {
                headers: res.getHeaders(),
                statusCode: res.statusCode,
                data: null,
            },
        }
        res.json = originalSend
        logInfo.response.data = data

        res.on('finish', () => {
            console.log(JSON.stringify(logInfo))
        });
        return res.json(data)
    }

    next();
}

export const ignoreCase: IgnoreCase = {
    equal: (a?: string, b?: string) => {
        if (a === undefined || b === undefined) {
            return false
        }
        return a.toLowerCase() === b.toLowerCase()
    },
    notEqual: (a: string, b: string) => a.toLowerCase() !== b.toLowerCase(),
    contain: (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase()),
    notContain: (a: string, b: string) => !a.toLowerCase().includes(b.toLowerCase()),
    startWith: (a: string, b: string) => a.toLowerCase().startsWith(b.toLowerCase()),
}

const level = process.env.LOG_LEVEL ?? 'debug'

class Logger implements ILogger {
    private readonly log: WinstonLog
    constructor() {
        this.log = createLogger({
            level: level,
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss', alias: '@timestamp' }),
                format.json({
                    replacer(key, value) {
                        if (ignoreCase.equal(key, 'password')) {
                            return Sensitive.maskPassword(value)
                        } else if (ignoreCase.equal(key, 'email')) {
                            return Sensitive.maskEmail(value)
                        } else if (ignoreCase.equal(key, 'mobileNo')) {
                            return Sensitive.maskNumber(value)
                        } else if (ignoreCase.equal(key, 'phone')) {
                            return Sensitive.maskPassword(value)
                        } else if (key === 'timestamp') {
                            return undefined
                        }
                        return value
                    },
                    // space: 2
                })
            ),
            exceptionHandlers: [],
            exitOnError: false,
            transports: [
                new transports.Console({
                    level: level,
                    handleExceptions: true,
                }),
            ],
            defaultMeta: { service: process.env.SERVICE_NAME ?? 'Service-HTTP' },
        })
    }

    Logger(ctx: Request, extra?: object): ILogger {
        const session = ctx.headers['x-transaction-id'] as string
        return this.log.child({ session, ...extra }) as ILogger
    }

    info(message: string, data?: any) {
        const action = { ...makeStructuredClone(data) }
        this.log.info(message, action)
        return this
    }

    warn(message: string, data?: any) {
        const action = { ...makeStructuredClone(data) }
        this.log.warn(message, action)
        return this
    }

    error(message: string, data?: any) {
        const action = { ...makeStructuredClone(data) }
        this.log.error(message, action)
        return this
    }

    debug(message: string, data?: any) {
        const action = { ...makeStructuredClone(data) }
        this.log.debug(message, action)
        return this
    }
}

export type LoggerType = Logger

export default Logger