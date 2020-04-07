import { HttpService, Injectable } from '@nestjs/common'
import { AxiosRequestConfig } from 'axios'
import { Compute, GoogleAuth, JWT } from 'google-auth-library'
import { MemoryCache } from 'ts-method-cache'
import { parse } from 'url'

@Injectable()
export class RestTemplate {
  private static THIRTY_MINUTES_IN_SECONDS = 30 * 60

  constructor(private readonly httpService: HttpService) {}

  async delete(url: string, config: AxiosRequestConfig = {}) {
    const token = await this.fetchToken(url)

    Object.assign(config.headers, { Authorization: `Bearer ${token}` })

    return this.httpService.delete(url, config)
  }

  async get(url: string, config: AxiosRequestConfig = {}) {
    const token = await this.fetchToken(url)

    Object.assign(config.headers, { Authorization: `Bearer ${token}` })

    return this.httpService.get(url, config)
  }

  async patch(url: string, data?: any, config: AxiosRequestConfig = {}) {
    const token = await this.fetchToken(url)

    Object.assign(config.headers, { Authorization: `Bearer ${token}` })

    return this.httpService.patch(url, data, config)
  }

  async post(url: string, data?: any, config: AxiosRequestConfig = {}) {
    const token = await this.fetchToken(url)

    Object.assign(config.headers, { Authorization: `Bearer ${token}` })

    return this.httpService.post(url, data, config)
  }

  async put(url: string, data?: any, config: AxiosRequestConfig = {}) {
    const token = await this.fetchToken(url)

    Object.assign(config.headers, { Authorization: `Bearer ${token}` })

    return this.httpService.put(url, data, config)
  }

  @MemoryCache({ ttl: RestTemplate.THIRTY_MINUTES_IN_SECONDS })
  async fetchToken(url: string) {
    const client = (await new GoogleAuth().getClient()) as JWT | Compute

    const audience = parse(url).href

    return client.fetchIdToken(audience)
  }
}
