import {
  Aspirate,
  Dispense,
  DisposeTip,
  instanceOfWellPlate,
  Labware,
  Laser, OpentronsTipRack,
  PickUpTip,
  Step,
  Transfer, WellPlate96
} from "./datatypes";

export interface BuildPythonProtocolOptions {
  name: string,
  author: string,
  description: string,
  labware: Labware[],
  steps: Step[]
}

export function buildPythonProtocolForExport({name, author, description, labware, steps}: BuildPythonProtocolOptions) {
  console.log({name, author, description, labware, steps})
  const labwareString = labware.map(val => val.getPythonInit()).join("\n")
  const stepString = steps.map(val => val.getPythonString()).join("\n\n")
  const tipRacksString = labware
    .filter(val => !instanceOfWellPlate(val))
    .map(val => val.name).join(", ")

  return `
from opentrons import protocol_api
from ondine_laser_control import laser

# meta;${name}:${author}:${description}

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

export function importPythonProtocol({pythonFile}: { pythonFile: string }): BuildPythonProtocolOptions {
  const labware:Labware[] = []
  const steps:Step[] = []
  let meta: string[] = []
  pythonFile.split("\n")
    .filter(val => val[0] === "#")
    .forEach((comment) => {
      comment = comment.replace("#", "")
      console.log(comment)
      let [className] = comment.split(";")
      className = className.trim()
      switch (className) {
        case "Transfer":
          steps.push(Transfer.fromImportComment(comment))
          break;
        case "Laser":
          steps.push(Laser.fromImportComment(comment))
          break;
        case "Aspirate":
          steps.push(Aspirate.fromImportComment(comment))
          break;
        case "Dispense":
          steps.push(Dispense.fromImportComment(comment))
          break;
        case "DisposeTip":
          steps.push(DisposeTip.fromImportComment(comment))
          break;
        case "PickUpTip":
          steps.push(PickUpTip.fromImportComment(comment))
          break;
        case "OpentronsTipRack":
          labware.push(OpentronsTipRack.fromImportComment(comment))
          break;
        case "WellPlate96":
          labware.push(WellPlate96.fromImportComment(comment))
          break;
        case "meta":
          meta = comment.split(";")[1].split(":");
          break;
      }
    })
  const [name, author, description] = meta;
  return {
    name,
    author,
    description,
    labware,
    steps
  }
}