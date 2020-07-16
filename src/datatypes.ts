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

export type AnyStep = Transfer | Laser | Aspirate | Dispense | DisposeTip

// @ts-ignore
export interface Step {
  [key: string]: any

  id: string,
  type: StepType
  getPythonString: () => string
  from?: Well
  to?: Well
  duration?: number,
  location?: Well,
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
    return "";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

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
laserController.move_to_well(well=${this.location.pythonString()})
laserController.turn_on_laser(seconds_to_off=${this.duration})
    `;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
}

export class Aspirate implements Step {
  [k: string]: any;

  type = StepType.ASPIRATE;


  constructor({from, volume}: { from: Well, volume: number }) {
    this.from = from;
    this.volume = volume;
  }

  getPythonString(): string {
    return `pipette.aspirate(${this.volume}, ${this.from.pythonString()})`;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
}

export class Dispense implements Step {
  [k: string]: any;

  type = StepType.DISPENSE;

  constructor({to, volume}: { to: Well, volume: number }) {
    this.to = to;
    this.volume = volume;
  }

  getPythonString(): string {
    return `pipette.dispense(${this.volume}, ${this.to.pythonString()})`;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
}

export class DisposeTip implements Step {
  [k: string]: any;

  type = StepType.DISPOSE_TIP;

  getPythonString(): string {
    return "pipette.drop_tip()";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
}

export class PickUpTip implements Step {
  [k: string]: any;

  type = StepType.PICK_UP_TIP;

  getPythonString(): string {
    return "p300.pick_up_tip()";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
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
    return `${this.name} = protocol.load_labware('opentrons_96_tiprack_300ul', ${this.slot})`;
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

export class Well {
  wellPlate: WellPlate
  locationString: string

  constructor(wellPlate: WellPlate, wellString: string) {
    this.wellPlate = wellPlate;
    this.locationString = wellString;
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
    return `${this.name} = protocol.load_labware('corning_96_wellplate_360ul_flat', ${this.slot})`;
  }
}

