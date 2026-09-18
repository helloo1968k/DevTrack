import * as signalR from '@microsoft/signalr'
import { getToken } from './api'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

let connection: signalR.HubConnection | null = null

export function getBoardConnection(): signalR.HubConnection {
  if (connection) return connection

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${BASE_URL}/hubs/board`, {
      accessTokenFactory: () => getToken() ?? ''
    })
    .withAutomaticReconnect()
    .build()

  return connection
}