import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    // Check if it's forwarded exception from microservice
    if (exception?.error) {
      const error = exception.error
      const status =
        typeof error.status === 'number'
          ? error.status
          : HttpStatus.INTERNAL_SERVER_ERROR

      return response.status(status).json({
        statusCode: status,
        message: error.message,
        error: error.name,
      })
    }

    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse())
    }

    // Default to 500
    const status = HttpStatus.INTERNAL_SERVER_ERROR
    const message = exception?.message || 'Internal server error'

    response.status(status).json({
      statusCode: status,
      message: message,
    })
  }
}
