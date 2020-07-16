import {instanceOfWellPlate, Labware, Step} from "./datatypes";

export interface BuildPythonProtocolOptions {
  name: string,
  author: string,
  description: string,
  labware: Labware[],
  steps: Step[]
}

export function buildPythonProtocol({name, author, description, labware, steps}: BuildPythonProtocolOptions) {
console.log({name, author, description, labware, steps})
  const labwareString = labware.map(val => val.getPythonInit()).join("\n")
  const stepString = steps.map(val => val.getPythonString()).join("\n\n")
  const tipRacksString = labware
    .filter(val => !instanceOfWellPlate(val))
    .map(val => val.name).join(", ")

  return `
from opentrons import protocol_api
from ondine_laser_control import laser

metadata = {
    'protocolName': '${name}',
    'author': '${author}',
    'description': '${description}',
    'apiLevel': '2.5'
}

${labwareString}

pipette = protocol.load_instrument('p300_single_gen2', 'right', tip_racks=[${tipRacksString}])

laserController = laser.Controller(protocol=protocol)

${stepString}

`

}

