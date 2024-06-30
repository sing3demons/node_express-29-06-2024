import type { Request, Response, NextFunction } from 'express';
const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()
    const session = req.header('x-transaction-id') as string ?? 'unknown'

    const originalSend = res.json
    res.json = (data) => {
        const duration = Date.now() - start;
        let logInfo = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Request completed successfully',
            session: {
                id: session,
                ip: req.ip,
                device: req.headers['user-agent'],
                location: req.headers['x-location'],
            },
            service: {
                name: 'Service-HTTP',
                version: '1.2.0',
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
        console.log(JSON.stringify(logInfo, null, 2))
        res.on('finish', () => {
            console.log('Request completed')
        });
        return res.json(data)
    }

    next();
}

export default logMiddleware;