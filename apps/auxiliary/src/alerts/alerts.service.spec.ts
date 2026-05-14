import { Test, TestingModule } from '@nestjs/testing'
import { AlertsService } from './alerts.service'
import * as fs from 'fs'

jest.mock('fs')

describe('AlertsService', () => {
  let service: AlertsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertsService],
    }).compile()

    service = module.get<AlertsService>(AlertsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('logStateChanged - writes ON state to log file', () => {
    service.logStateChanged('user-1', 'device-1', true)
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('DEVICE STATE CHANGED'),
      expect.any(Object)
    )
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('State: ON'),
      expect.any(Object)
    )
  })

  it('logStateChanged - writes OFF state to log file', () => {
    service.logStateChanged('user-1', 'device-1', false)
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('State: OFF'),
      expect.any(Object)
    )
  })

  it('logFavoriteChanged - writes favorite true to log file', () => {
    service.logFavoriteChanged('user-1', 'device-1', true)
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('FAVORITE TOGGLED'),
      expect.any(Object)
    )
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Favorite: true'),
      expect.any(Object)
    )
  })

  it('logDeviceAdded - writes device name to log file', () => {
    service.logDeviceAdded('user-1', 'device-1', 'Kitchen Light')
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('DEVICE ADDED'),
      expect.any(Object)
    )
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"Kitchen Light"'),
      expect.any(Object)
    )
  })

  it('logDeviceDeleted - writes device id to log file', () => {
    service.logDeviceDeleted('user-1', 'device-1')
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('DEVICE DELETED'),
      expect.any(Object)
    )
    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('device-1'),
      expect.any(Object)
    )
  })
})
