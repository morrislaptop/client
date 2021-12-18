import { Component, h } from 'preact'
import { Planet, PlanetLevel } from '@darkforest_eth/types'
import GameManager from '../../declarations/src/Backend/GameLogic/GameManager'
import GameUIManager from '../../declarations/src/Backend/GameLogic/GameUIManager'
import { PlanetLink } from '../components/PlanetLink'
import { Header, Sub, Title } from '../components/Text'
import { Table } from '../components/Table';
import { ManageInterval } from '../components/ManageInterval'

import { bestStats, capturePlanets, closestToCenter, directionToCenter, highestLevel, lowestEnergy } from '../strategies/Crawl'
import { distributeEnergy } from '../strategies/DistributeEnergy'
import { buttonGridStyle, energy, getMyPlanets, getPlanetTypeAcronym, hasPendingMove, isAsteroid, isFoundry, planetName, PlanetTypes, PrimeMinutes } from '../utils'
import { config } from 'plugins/config'
const pauseable = require('pauseable')

declare const df: GameManager
declare const ui: GameUIManager

function onCrawlThenDistributeClick(selectedPlanet: Planet|null = null) {
  console.log('Crawling and Distributing')

  capturePlanets({
    fromId: selectedPlanet?.locationId,
    fromMinLevel: selectedPlanet?.planetLevel || config.MIN_LEVEL_PLANET,
    fromMaxLevel: selectedPlanet?.planetLevel || config.MAX_LEVEL_PLANET,
    fromMinEnergyLeftPercent: 37.5,
    toMinLevel: PlanetLevel.FOUR,
    toPlanetTypes: [PlanetTypes.FOUNDRY],
    toTargetEnergy: 50,
    sortFunction: highestLevel,
  })

  capturePlanets({
    fromId: selectedPlanet?.locationId,
    fromMinLevel: selectedPlanet?.planetLevel || config.MIN_LEVEL_PLANET,
    fromMaxLevel: selectedPlanet?.planetLevel || config.MAX_LEVEL_PLANET,
    fromMinEnergyLeftPercent: 37.5,
    toPlanetTypes: [PlanetTypes.PLANET, PlanetTypes.ASTEROID, PlanetTypes.RIP],
    toMinLevel: PlanetLevel.FIVE,
    toTargetEnergy: 15,
    sortFunction: bestStats,
  })

  capturePlanets({
    fromId: selectedPlanet?.locationId,
    fromMinLevel: selectedPlanet?.planetLevel || config.MIN_LEVEL_PLANET,
    fromMaxLevel: selectedPlanet?.planetLevel || config.MAX_LEVEL_PLANET,
    fromMinEnergyLeftPercent: 37.5,
    toMinLevel: PlanetLevel.TWO,
    toPlanetTypes: [PlanetTypes.FOUNDRY],
    toTargetEnergy: 96,
    sortFunction: highestLevel,
  })

  capturePlanets({
    fromId: selectedPlanet?.locationId,
    fromMinLevel: selectedPlanet?.planetLevel || config.MIN_LEVEL_PLANET,
    fromMaxLevel: selectedPlanet?.planetLevel || config.MAX_LEVEL_PLANET,
    fromMinEnergyLeftPercent: 37.5,
    toPlanetTypes: [PlanetTypes.RIP],
    toMinLevel: PlanetLevel.THREE,
    toTargetEnergy: 15,
    sortFunction: lowestEnergy,
  })

  distributeEnergy({
    fromId: selectedPlanet?.locationId,
    fromMinLevel: selectedPlanet?.planetLevel || config.MIN_LEVEL_PLANET,
    fromMaxLevel: selectedPlanet?.planetLevel || config.MAX_LEVEL_PLANET,
  })
}

export class PlanetsWithEnergy extends Component
{
  interval: any

  constructor() {
    super()
    // takes 80 minutes for a l4 r5 planet to go from 37.5% to 50%
    // let's do this twice then the closest 10 planets should be sending energy
    this.interval = pauseable.setInterval(PrimeMinutes.NINETEEN, onCrawlThenDistributeClick)
    // this.interval.pause()
  }

  render()
  {
    console.log('PlanetsWithEnergy')
    const headers = ['Planet Name', 'Energy'];
    const alignments: Array<'r' | 'c' | 'l'> = ['l', 'r', 'r'];

    const rows = getMyPlanets()
      .filter(p => p.planetLevel >= config.MIN_LEVEL_PLANET)
      .filter(p => ! isFoundry(p))
      .filter(p => ! hasPendingMove(p))
      .filter(p => p.planetType === PlanetTypes.PLANET)
      .filter(p => energy(p) > 75)
      // .sort((a, b) => energy(b) - energy(a))
      .sort((a, b) => b.planetLevel - a.planetLevel || energy(b) - energy(a))

    const columns = [
      (planet: Planet) => <PlanetLink planet={planet}>{getPlanetTypeAcronym(planet)}L{planet.planetLevel} {planetName(planet)}</PlanetLink>,
      (planet: Planet) => <Sub>{energy(planet)}%</Sub>,
    ]

    return <div>
    <Header>Planets with &gt; 75% Energy</Header>
    <ManageInterval interval={this.interval} />
    <div style={buttonGridStyle}>
      <button onClick={() => onCrawlThenDistributeClick(ui.getSelectedPlanet())}>
        Crawl then Distribute
      </button>
    </div>
    <Table
      rows={rows}
      headers={headers}
      columns={columns}
      alignments={alignments}
    />
  </div>
  }

  componentWillUnmount() {
    this.interval.clear()
  }
}
