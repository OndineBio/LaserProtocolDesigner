export enum StepType {
  TRANSFER = "TRANSFER", LASER = "LASER", ASPIRATE = "ASPIRATE", DISPENSE = "DISPENSE", DISPOSE_TIP = "DISPOSE_TIP",
  PICK_UP_TIP = "PICK_UP_TIP",
  PLACEHOLDER = "PLACEHOLDER"
}

export function stepTypeHas(type: StepType, attr: string): boolean {
  switch (type) {
    case StepType.TRANSFER:
      return ["from", "to", "volume"].includes(attr)
    case StepType.LASER:
      return ["location", "duration"].includes(attr)
    case StepType.DISPENSE:
      return ["to", "volume"].includes(attr)
    case StepType.DISPOSE_TIP:
      return false
    case StepType.PICK_UP_TIP:
      return false
    case StepType.PLACEHOLDER:
      return false
    case StepType.ASPIRATE:
      return ["from", "volume"].includes(attr)
  }
  return false
}

/*import comment structure

# CLASSNAME;{ParamName:param,ParamName:param}

*/


export interface Step {
  id: string
  type: StepType
  getPythonString: () => string
  from?: Well
  to?: Well
  duration?: number
  location?: Well
  volume?: number
}

export class PlaceHolderStep implements Step {
  [key: string]: any;

  getPythonString(): string {
    return "";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
  type: StepType = StepType.PLACEHOLDER;
}

export class Transfer implements Step {


  [k: string]: any;

  type = StepType.TRANSFER;

  constructor({from, to, volume}: { from: Well, to: Well, volume: number }) {

    this.from = from;
    this.to = to;
    this.volume = volume;
  }

  getPythonString(): string {
    return `
# Transfer;${JSON.stringify(this)}
pipette.transfer(${this.volume}, ${this.to}, ${this.from})`;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {
    const [_, json] = comment.split(";")
    const {from, to, volume} = JSON.parse(json) as { from: JSONWell, to: JSONWell, volume: number }
    return new Transfer({from: fromJSONWelltoWell(from), to: fromJSONWelltoWell(to), volume})
  }
}

export class Laser implements Step {
  [k: string]: any;

  type = StepType.LASER;


  constructor({location, duration}: { location: Well, duration: number }) {

    this.duration = duration;
    this.location = location;
  }

  getPythonString(): string {
    return `
# Laser;${JSON.stringify(this)}
laserController.move_to_well(well=${this.location.pythonString()})
laserController.turn_on_laser(seconds_to_off=${this.duration})
    `;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {
    const [_, json] = comment.split(";")
    const {location, duration} = JSON.parse(json) as { location: JSONWell, duration: number }

    return new Laser({location: fromJSONWelltoWell(location), duration})
  }
}

export class Aspirate implements Step {
  [k: string]: any;

  type = StepType.ASPIRATE;


  constructor({from, volume}: { from: Well, volume: number }) {
    this.from = from;
    this.volume = volume;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  getPythonString(): string {
    return `
# Aspirate;${JSON.stringify(this)}
pipette.aspirate(${this.volume}, ${this.from.pythonString()})`;
  }

  static fromImportComment(comment: string): Step {
    const [_, json] = comment.split(";")
    const {from, volume} = JSON.parse(json) as { from: JSONWell, volume: number }
    return new Aspirate({from: fromJSONWelltoWell(from), volume})
  }

}

export class Dispense implements Step {
  [k: string]: any;

  type = StepType.DISPENSE;

  constructor({to, volume}: { to: Well, volume: number }) {
    this.to = to;
    this.volume = volume;
  }

  getPythonString(): string {
    return `
# Dispense; ${JSON.stringify(this)}
pipette.dispense(${this.volume}, ${this.to.pythonString()})`;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {
    const [_, json] = comment.split(";")
    const {to, volume} = JSON.parse(json) as { to: JSONWell, volume: number }
    return new Dispense({to: fromJSONWelltoWell(to), volume})
  }


}

export class DisposeTip implements Step {
  [k: string]: any;

  type = StepType.DISPOSE_TIP;

  getPythonString(): string {
    return "# DisposeTip;\n" +
      "pipette.drop_tip()";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {
    return new DisposeTip();
  }

}

export class PickUpTip implements Step {
  [k: string]: any;

  type = StepType.PICK_UP_TIP;

  getPythonString(): string {
    return "# PickUpTip;\n" +
      "pipette.pick_up_tip()";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {
    return new PickUpTip();
  }

}

export enum LabwareType {
  WellPlate96 = "96 well plate",
  OpentronsTipRack = "Opentrons Tip Rack"
}

export interface Labware {
  readonly type: LabwareType

  readonly name: string

  getPythonInit(): string

  readonly slot: number
}

export class OpentronsTipRack implements Labware {
  readonly type = LabwareType.OpentronsTipRack
  readonly name: string;
  readonly slot: number;

  constructor(slot: number) {
    this.name = "opentrons_tip_rack_in_" + slot;
    this.slot = slot;
  }

  getPythonInit(): string {
    return `
# OpentronsTipRack;${JSON.stringify(this)}
${this.name} = protocol.load_labware('opentrons_96_tiprack_300ul', ${this.slot})`;
  }

  static fromImportComment(comment: string): Labware {
    const [_, json] = comment.split(";")
    const {slot} = JSON.parse(json) as { slot: number }
    return new OpentronsTipRack(slot)
  }
}

export interface WellPlate extends Labware {
  readonly wells: Well[];
  width: number;
  height: number;
  isWellPlate: true;
}

export function instanceOfWellPlate(object: any): object is WellPlate {
  return object.isWellPlate;
}

interface JSONWell {
  isJSONWell: true
  wellPlateType: LabwareType
  slot: number,
  locationString: string
}

const fromJSONWelltoWell: (jw: JSONWell) => Well = (jw):Well => {
  switch (jw.wellPlateType) {
    case LabwareType.WellPlate96:
      const wp = new WellPlate96(jw.slot)
      return wp.wells.find(v => v.locationString === jw.locationString) as Well
  }
  throw Error("Unknown Labware")
}


export class Well {
  wellPlate: WellPlate
  locationString: string

  constructor(wellPlate: WellPlate, wellString: string) {
    this.wellPlate = wellPlate;
    this.locationString = wellString;
  }

  toJSON(): JSONWell {
    return {
      isJSONWell: true,
      wellPlateType: this.wellPlate.type,
      slot: this.wellPlate.slot,
      locationString: this.locationString
    }
  }

  toString(): string {
    return `${this.locationString} in "${this.wellPlate.type}" at slot ${this.wellPlate.slot}`
  }

  pythonString(): string {
    return `${this.wellPlate.name}["${this.locationString}"]`
  }

}

export class WellPlate96 implements WellPlate {
  readonly type = LabwareType.WellPlate96
  readonly name: string; // an unique name
  readonly wells: Well[]; // the wells in this plate
  readonly slot: number;
  height = 8;
  width = 12;

  isWellPlate: true = true;

  constructor(slot: number) {
    this.slot = slot
    this.name = "96_well_plate_in_" + slot
    this.wells = []
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    letters.forEach(val => {
      for (let i = 1; i <= 12; i++) {
        this.wells.push(new Well(this, val + i))
      }
    })
  }

  getPythonInit(): string {
    return `
# WellPlate96;${JSON.stringify({slot: this.slot})}
${this.name} = protocol.load_labware('corning_96_wellplate_360ul_flat', ${this.slot})`;
  }

  static fromImportComment(comment: string): Labware {
    const [_, json] = comment.split(";")
    const {slot} = JSON.parse(json) as { slot: number }
    return new WellPlate96(slot)
  }
}

