import {
  Aspirate,
  Dispense,
  instanceOfWellPlate,
  Labware, LabwareType,
  Laser, Mix, OpentronsTipRack, Plate, Reservoir12,
  Step, StepType,
  Transfer, WellPlate12, WellPlate24, WellPlate48, WellPlate6, WellPlate96
} from "./datatypes";

export interface BuildPythonProtocolOptions {
  name: string,
  author: string,
  description: string,
  labware: Labware[],
  steps: Step[]
}

export function buildPythonProtocolForExport({name, author, description, labware, steps}: BuildPythonProtocolOptions) {
  const labwareString = labware.map(val => val.getPythonInit()).join("\n")
  const stepString = steps.map((val, index, array) => val.getPythonString(array.slice(0, index))).join("\n\n")
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
  const labware: Labware[] = []
  const steps: Step[] = []
  let meta: string[] = []
  pythonFile.split("\n")
    .filter(val => val[0] === "#")
    .forEach((comment) => {
      comment = comment.replace("#", "")
      let [className] = comment.split(";")
      className = className.trim()
      switch (className) {
        case StepType.TRANSFER:
          steps.push(Transfer.fromImportComment(comment))
          break;
        case StepType.LASER:
          steps.push(Laser.fromImportComment(comment))
          break;
        case StepType.ASPIRATE:
          steps.push(Aspirate.fromImportComment(comment))
          break;
        case StepType.DISPENSE:
          steps.push(Dispense.fromImportComment(comment))
          break;
        case StepType.MIX:
          steps.push(Mix.fromImportComment(comment))
          break;
        case StepType.PLATE:
          steps.push(Plate.fromImportComment(comment))
          break;
        case LabwareType.OpentronsTipRack:
          labware.push(OpentronsTipRack.fromImportComment(comment))
          break;
        case LabwareType.Reservoir12:
          labware.push(Reservoir12.fromImportComment(comment))
          break;
        case LabwareType.WellPlate96:
          labware.push(WellPlate96.fromImportComment(comment))
          break;
        case LabwareType.WellPlate6:
          labware.push(WellPlate6.fromImportComment(comment))
          break;
        case LabwareType.WellPlate12:
          labware.push(WellPlate12.fromImportComment(comment))
          break;
        case LabwareType.WellPlate24:
          labware.push(WellPlate24.fromImportComment(comment))
          break;
        case LabwareType.WellPlate48:
          labware.push(WellPlate48.fromImportComment(comment))
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