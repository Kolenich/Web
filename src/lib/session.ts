import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { OutgoingHttpHeaders } from 'http';

const xsrfCookieName: string = 'csrftoken';
const xsrfHeaderName: string = 'X-CSRFToken';

let baseURL: string = 'http://localhost:8000';
if (process.env.NODE_ENV === 'production') {
  baseURL = 'http://localhost/server';
}

const timeout: number = 1000;

const headers: OutgoingHttpHeaders = {
  'Content-Type': 'application/json',
};

const requestConfig: AxiosRequestConfig = {
  baseURL,
  xsrfCookieName,
  xsrfHeaderName,
  timeout,
  headers,
};

export const session: AxiosInstance = axios.create(requestConfig);

export const API_URL: string = 'api';
