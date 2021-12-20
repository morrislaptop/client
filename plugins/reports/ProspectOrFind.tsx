import { Component, h } from 'preact'
import { Planet } from '@darkforest_eth/types'
import GameManager from '../../declarations/src/Backend/GameLogic/GameManager'
import GameUIManager from '../../declarations/src/Backend/GameLogic/GameUIManager'
import { PlanetLink } from '../components/PlanetLink'
import { Header, Sub, Title } from '../components/Text'
import { Table } from '../Components/Table';
import { ManageInterval } from '../Components/ManageInterval'
import { config } from 'plugins/config'
import { blocksLeft, buttonGridStyle, enoughEnergyToProspect, getMyPlanets, hasBeenFound, isFindable, isFoundry, isProspectable, planetName, PrimeMinutes, prospectExpired } from '../utils'
import { prospectAndFind } from 'plugins/strategies/ProspectAndFind'

const pauseable = require('pauseable')

declare const df: GameManager
declare const ui: GameUIManager

function onProspectAndFindClick() {
  prospectAndFind()
}

/**
 * @todo Can't test this since round was over.
 */
 export class ProspectOrFind extends Component
 {
  interval: any

  constructor() {
    super()
    this.interval = pauseable.setInterval(PrimeMinutes.TWO * config.TIME_FACTOR, onProspectAndFindClick)
    // this.interval.pause()
  }

   render()
   {
    const headers = ['Planet Name', 'Level', 'Blocks Left'];
    const alignments: Array<'r' | 'c' | 'l'> = ['l', 'r', 'r'];

    // const expired = getMyPlanets()
    //   .filter(isFoundry)
    //   .filter(prospectExpired)

    // console.log({ expired })

    const rows = getMyPlanets()
      .filter(p => isProspectable(p) || isFindable(p))
      .sort((a, b) => b.planetLevel - a.planetLevel)

    const columns = [
      (planet: Planet) => <PlanetLink planet={planet}>{planetName(planet)}</PlanetLink>,
      (planet: Planet) => <Sub>{planet.planetLevel}</Sub>,
      (planet: Planet) => <Sub>{planet.prospectedBlockNumber ? blocksLeft(planet) : '-'}</Sub>,
    ];

    return <div>
      <Header>Prospect or Find</Header>
      <ManageInterval interval={this.interval} />
      <div style={buttonGridStyle}>
        <button onClick={onProspectAndFindClick}>Prospect & Find</button>
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