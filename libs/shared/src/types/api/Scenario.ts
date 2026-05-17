import type { Scenario } from '@smart-home/db/schema'

export type ScenariosGetRes = Scenario[]
export type ScenariosGetReq = unknown

export type ScenarioGetRes = Scenario
export type ScenarioGetReq = { id: string }

export type ScenarioCreateRes = Scenario
export type ScenarioCreateReq = { name: string; actions: object[] }

export type ScenarioUpdateRes = Scenario
export type ScenarioUpdateReq = {
  id: string
  body: { name?: string; actions?: object[] }
}

export type ScenarioSetStateRes = Scenario
export type ScenarioSetStateReq = { id: string; active: boolean }

export type ScenarioDeleteRes = { success: boolean }
export type ScenarioDeleteReq = { id: string }
