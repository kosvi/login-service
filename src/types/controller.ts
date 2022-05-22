import { OutgoingHttpHeaders, OutgoingHttpHeader } from 'http';

/* List of allowed status codes */

export type StatusCode = 200 | 400 | 401 | 404 | 500;

/*
 * These are our custom stripped down request and response objects
 * It will make testing easier, since no non-needed garbage is carried around
 */

interface RequestHeaders {
  host?: string,
  authorization?: string
}

export interface HttpRequest {
  url?: string,
  method?: string,
  body?: string,
  headers: RequestHeaders
}

export interface HttpResponse {
  setHeader: (name: string, value: string | number) => void,
  writeHead: (statusCode: StatusCode, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined) => void,
  end: (body?: string | undefined) => void
}

/*
 * Every single Controller has to implement this interface so that
 * our server knows how to use the Controller
 */
export interface Controller {
  // handleRequest is the method that takes care of the request and handles the response
  handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> | void,
  // this is just in case we want to know what controller we are using
  controllerName: string
}
