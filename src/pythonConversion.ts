import {
  Aspirate,
  ChangeSpeed,
  Dispense,
  TubeRack24Eppendorf15,
  TubeRack15Falcon15,
  instanceOfWellPlate,
  Labware, LabwareType,
  Laser, Mix, OpentronsTipRack, Plate, Reservoir12,
  Step, StepType,
  Transfer, Wait, WellPlate12, WellPlate24, WellPlate48, WellPlate6, WellPlate96, FalconPetriDish90mm
} from "./datatypes";

export interface BuildPythonProtocolOptions {
  name: string,
  author: string,
  description: string,
  labware: Labware[],
  steps: Step[]
}

export function buildPythonProtocolForExport({name, author, description, labware, steps}: BuildPythonProtocolOptions) {
  const labwareString = labware.map(val => val.getPythonInit()).join("\n").replace(/\n/g, "\n    ")
  const stepString = steps.map((val, index, array) => val.getPythonString(array.slice(0, index), array.slice(index+1)))
    .map(v => {console.log(v); return v})
    .join("\n\n")
    .replace(/\n/g, "\n    ")
  const tipRacksString = labware
    .filter(val => !instanceOfWellPlate(val))
    .map(val => val.name).join(", ")
  console.log({labwareString, stepString, tipRacksString})
  let hasLaser = false;
  if(steps.some(step => step.type === "LASER")) { hasLaser = true }
  return `
from opentrons import protocol_api
${hasLaser ? 'from ondine_laser_control import laser' : ''}

# meta;${name}:${author}:${description}

metadata = {
    'protocolName': '${name}',
    'author': '${author}',
    'description': '${description}',
    'apiLevel': '2.8'
}
def run(protocol: protocol_api.ProtocolContext):
    ${labwareString}

    pipette = protocol.load_instrument('p300_single_gen2', 'right', tip_racks=[${tipRacksString}])

    ${hasLaser ? 'laserController = laser.Controller(protocol=protocol)' : ''}

    ${stepString}
    #end
`

}

export function importPythonProtocol({pythonFile}: { pythonFile: string }): BuildPythonProtocolOptions {
  const labware: Labware[] = []
  const steps: Step[] = []
  let meta: string[] = []
  pythonFile.split("\n").map(s => s.trim()) // get every line of the input file
    .filter(val => val[0] === "#")// get only the comments
    .forEach((comment) => { // extract step and labware info from comments
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
        case StepType.WAIT:
          steps.push(Wait.fromImportComment(comment))
          break;
        case StepType.CHANGESPEED:
          steps.push(ChangeSpeed.fromImportComment(comment))
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
        case LabwareType.TubeRack15Falcon15:
          labware.push(TubeRack15Falcon15.fromImportComment(comment))
          break;
        case LabwareType.TubeRack24Eppendorf15:
          labware.push(TubeRack24Eppendorf15.fromImportComment(comment))
          break;
        case LabwareType.FalconPetriDish90mm:
          labware.push(FalconPetriDish90mm.fromImportComment(comment))
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