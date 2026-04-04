import { Catch, RpcExceptionFilter, HttpException } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { RpcException } from '@nestjs/microservices'

@Catch(HttpException)
export class HttpExceptionFilter implements RpcExceptionFilter<HttpException> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: HttpException): Observable<any> {
    return throwError(
      () =>
        new RpcException({
          status: exception.getStatus(),
          message: exception.message,
          name: exception.name,
        })
    )
  }
}
