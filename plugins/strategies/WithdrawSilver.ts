import GameManager from '../../declarations/src/Backend/GameLogic/GameManager'
import GameUIManager from '../../declarations/src/Backend/GameLogic/GameUIManager'
import { LocationId } from '@darkforest_eth/types';
import { getMyPlanets, PlanetTypes } from '../utils';
import { isUnconfirmedWithdrawSilverTx } from '@darkforest_eth/serde';

declare const df: GameManager
declare const ui: GameUIManager

interface config {
  fromId?: LocationId,
}
export function withdrawSilver(config: config)
{
  const from = getMyPlanets()
    .filter(p => p.planetType === PlanetTypes.RIP)
    .filter(p => p.silver > 0)
    .filter(p => ! p.transactions?.hasTransaction(isUnconfirmedWithdrawSilverTx))
    .filter(p => ! config.fromId || p.locationId === config.fromId)
    .sort((a, b) => b.silver - a.silver)

  return from.map(from => df.withdrawSilver(from.locationId, from.silver))
}
