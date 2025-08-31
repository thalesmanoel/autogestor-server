import Provider, { IProvider } from '../models/Provider'
import BaseRepository from './BaseRepository'

export default class ProviderRepository extends BaseRepository<IProvider> {
  constructor () {
    super(Provider)
  }
}
