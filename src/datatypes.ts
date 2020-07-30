import {Step} from "@material-ui/core";

export enum StepType {
  TRANSFER = "TRANSFER", LASER = "LASER", ASPIRATE = "ASPIRATE", DISPENSE = "DISPENSE",
  PLACEHOLDER = "PLACEHOLDER",
  MIX = "MIX",
  PLATE = "PLATE",
}

export function stepTypeHas(type: StepType, attr: string): boolean {
  switch (type) {
    case StepType.TRANSFER:
      return ["from", "to", "volume"].includes(attr)
    case StepType.LASER:
      return ["location", "duration"].includes(attr)
    case StepType.DISPENSE:
      return ["to", "volume"].includes(attr)
    case StepType.PLACEHOLDER:
      return false
    case StepType.ASPIRATE:
      return ["from", "volume"].includes(attr)
    case StepType.PLATE:
      return ["from", "to", "heightOfAgar", "volume"].includes(attr)
    case StepType.MIX:
      return ["from", "volume", "times"].includes(attr)
  }
  return false
}

/*import comment structure

# CLASSNAME;{ParamName:param,ParamName:param}

*/


export function copyStep(s: Step) {
  switch (s.type) {
    case StepType.TRANSFER:
      return new Transfer({...s as { from: Well, to: Well, volume: number }})
    case StepType.LASER:
      return new Laser({...s as { location: Well, duration: number }})
    case StepType.ASPIRATE:
      return new Aspirate({...s as { from: Well, volume: number }})
    case StepType.DISPENSE:
      return new Dispense({...s as { to: Well, volume: number }})
    case StepType.PLACEHOLDER:
      return new PlaceHolderStep()
    case StepType.MIX:
      return new Mix({...s as { from: Well, volume: number, times: number }})
    case StepType.PLATE:
      return new Plate({...s as { from: Well, to: Well, volume: number, heightOfAgar: number }})

  }
}

export interface Step {
  id: string
  type: StepType
  getPythonString: (stepsBefore: Step[], stepsNext: Step[]) => string
  from?: Well
  to?: Well
  duration?: number
  location?: Well
  heightOfAgar?: number
  volume?: number
  times?: number
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

  from: Well
  to: Well
  volume: number

  type = StepType.TRANSFER;

  constructor({from, to, volume}: { from: Well, to: Well, volume: number }) {

    this.from = from;
    this.to = to;
    this.volume = volume;
  }

  getPythonString(prev: Step[], nextList: Step[]): string {
    const [last] = prev.slice(-1)
    const next = nextList?.[0]

    let mixString = ""

    if (last?.type === StepType.MIX && last?.from?.pythonString() === this.from.pythonString()) {
      mixString += `mix_before=(${last.times}, ${last.volume}), `
    }
    if (next?.type === StepType.MIX && next?.from?.pythonString() === this.to.pythonString()) {
      mixString += `mix_after=(${next.times}, ${next.volume}), `
    }

    return `

# ${this.type};${JSON.stringify(this)}

pipette.transfer(${this.volume}, ${this.from.pythonString()}, ${this.to.pythonString()}, ${mixString}touch_tip=True, new_tip='always')`;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {

    const [, json] = comment.split(";")
    const {from, to, volume} = JSON.parse(json) as { from: JSONWell, to: JSONWell, volume: number }
    return new Transfer({from: fromJSONWelltoWell(from), to: fromJSONWelltoWell(to), volume})
  }

}

export class Laser implements Step {
  [k: string]: any;

  location: Well;
  type = StepType.LASER;

  constructor({location, duration}: { location: Well, duration: number }) {

    this.duration = duration;
    this.location = location;
  }

  getPythonString(stepsBefore: Step[]): string {
    this.location.heightOfLiquidInWellFromBottomOfWell(stepsBefore)
    return `
# ${this.type};${JSON.stringify(this)}
laserController.move_to_well(well=${this.location.pythonString()}, height_of_liquid=${this.location.heightOfLiquidInWellFromBottomOfWell(stepsBefore)})
laserController.turn_on_laser(seconds_to_off=${this.duration})
    `;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {
    const [, json] = comment.split(";")
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

  getPythonString(prev: Step[]): string {
    const [last] = prev.slice(-1)
    return `
# ${this.type};${JSON.stringify(this)}
${last?.type !== StepType.MIX ? "pipette.pick_up_tip()" : ""}
pipette.aspirate(${this.volume}, ${this.from.pythonString()})`;
  }

  static fromImportComment(comment: string): Step {
    const [, json] = comment.split(";")
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
# ${this.type}; ${JSON.stringify(this)}
pipette.dispense(${this.volume}, ${this.to.pythonString()})
pipette.drop_tip()`;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {
    const [, json] = comment.split(";")
    const {to, volume} = JSON.parse(json) as { to: JSONWell, volume: number }
    return new Dispense({to: fromJSONWelltoWell(to), volume})
  }


}

export class Mix implements Step {
  [k: string]: any;

  type = StepType.MIX;
  from: Well;

  constructor({from, volume, times}: { from: Well, volume: number, times: number }) {
    this.from = from;
    this.times = times;
    this.volume = volume;
  }

  getPythonString(prev: Step[], next: Step[]): string {
    if (
      (
        (next?.[0]?.type === StepType.TRANSFER || next?.[0]?.type === StepType.PLATE)
        &&
        next?.[0]?.from?.pythonString() === this.from.pythonString()
      )
      ||
      (
        (prev?.[0]?.type === StepType.TRANSFER || prev?.[0]?.type === StepType.PLATE)
        &&
        prev?.[0]?.to?.pythonString() === this.from.pythonString()
      )
    ) return `# ${this.type}; ${JSON.stringify(this)}`
    return `
# ${this.type}; ${JSON.stringify(this)}
pipette.pick_up_tip()
pipette.mix(${this.times}, ${this.volume}, ${this.from.pythonString()})`;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {
    const [, json] = comment.split(";")
    const {from, volume, times} = JSON.parse(json) as { from: JSONWell, volume: number, times: number }
    return new Mix({from: fromJSONWelltoWell(from), volume, times})
  }


}

export class Plate implements Step {
  [k: string]: any;

  heightOfAgar: number
  volume: number
  from: Well
  to: Well
  type = StepType.PLATE;

  constructor({from, volume, to, heightOfAgar}: { from: Well, to: Well, volume: number, heightOfAgar: number }) {
    this.heightOfAgar = heightOfAgar;
    this.from = from;
    this.to = to;
    this.volume = volume;
  }

  getPythonString(prev: Step[], nextList: Step[]): string {
    const [last] = prev.slice(-1)
    const next = nextList?.[0]

    let mixString = ""

    if (last?.type === StepType.MIX && last?.from?.pythonString() === this.from.pythonString()) {
      mixString += `mix_before=(${last.times}, ${last.volume}), `
    }
    if (next?.type === StepType.MIX && next?.from?.pythonString() === this.to.pythonString()) {
      mixString += `mix_after=(${next.times}, ${next.volume}), `
    }


    return `

# ${this.type};${JSON.stringify(this)}
pipette.transfer(${this.volume}, ${this.from.pythonString()}, ${this.to.pythonString()}.bottom(${this.heightOfAgar}), ${mixString} new_tip='always')`;
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`

  static fromImportComment(comment: string): Step {
    const [, json] = comment.split(";")
    const {from, volume, heightOfAgar, to} = JSON.parse(json) as { to: JSONWell, from: JSONWell, volume: number, heightOfAgar: number }
    return new Plate({from: fromJSONWelltoWell(from), to: fromJSONWelltoWell(to), volume, heightOfAgar})
  }


}

export enum LabwareType {
  WellPlate96 = "WellPlate96",
  OpentronsTipRack = "OpentronsTipRack",
  WellPlate6 = "WellPlate6",
  WellPlate12 = "WellPlate12",
  WellPlate24 = "WellPlate24",
  WellPlate48 = "WellPlate48",
  Reservoir12 = "Reservoir12",
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
    const [, json] = comment.split(";")
    const {slot} = JSON.parse(json) as { slot: number }
    return new OpentronsTipRack(slot)
  }
}

export interface WellPlate extends Labware {
  readonly wells: Well[];
  numOfNumberWells: number;
  numOfLetterWells: number;
  isWellPlate: true;
  readonly wellHeight: number //from opentrons labware definitions
  readonly wellDiameter: number //from opentrons labware definitions
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

const fromJSONWelltoWell: (jw: JSONWell) => Well = (jw): Well => {
  switch (jw.wellPlateType) {
    case LabwareType.WellPlate6:
      const wp1 = new WellPlate6(jw.slot)
      return wp1.wells.find(v => v.locationString === jw.locationString) as Well
    case LabwareType.WellPlate12:
      const wp2 = new WellPlate12(jw.slot)
      return wp2.wells.find(v => v.locationString === jw.locationString) as Well
    case LabwareType.WellPlate24:
      const wp3 = new WellPlate24(jw.slot)
      return wp3.wells.find(v => v.locationString === jw.locationString) as Well
    case LabwareType.WellPlate48:
      const wp4 = new WellPlate48(jw.slot)
      return wp4.wells.find(v => v.locationString === jw.locationString) as Well
    case LabwareType.Reservoir12:
      const wp5 = new Reservoir12(jw.slot)
      return wp5.wells.find(v => v.locationString === jw.locationString) as Well
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

  heightOfLiquidInWellFromBottomOfWell(steps: Step[]): number {
    // returns the height of the liquid in a well for calculating the distance offset for the laser
    // returns the height of the total well if there is no liquid
    let currentVolume = 0;
    for (let step of steps) {
      if (
        step?.to?.wellPlate.name === this.wellPlate.name &&
        step?.to?.locationString === this.locationString
      ) {
        currentVolume += step?.volume ?? 0;
      } else if (step?.from?.wellPlate.name === this.wellPlate.name &&
        step?.from?.locationString === this.locationString) {
        currentVolume -= step?.volume ?? 0;
      }
    }
    if (currentVolume === 0) return this.wellPlate.wellHeight
    const height = currentVolume / (Math.PI * (this.wellPlate.wellDiameter / 2) * (this.wellPlate.wellDiameter / 2))
    return Math.round(height * 1e2) / 1e2 // round to 2 decimal places
  }

}

export class WellPlateN implements WellPlate {
  readonly wellHeight: number //from opentrons labware definitions
  readonly wellDiameter: number //from opentrons labware definitions
  readonly type: LabwareType
  readonly name: string; // an unique name
  readonly wells: Well[]; // the wells in this plate
  readonly slot: number;
  readonly numOfLetterWells: number; // number of wells on letter side
  readonly numOfNumberWells: number; // number of wells on number side
  private readonly loadLabwareString: string;
  readonly isWellPlate: true = true;

  constructor({
                wellDiameter, wellHeight,
                numberOfWells, type, slot, numOfLetterWells, numOfNumberWells, loadLabwareString
              }: {
    wellHeight: number, wellDiameter: number, numOfNumberWells: number, numOfLetterWells: number,
    numberOfWells: number, type: LabwareType, slot: number, loadLabwareString: string
  }) {
    this.type = type
    this.wells = []
    this.wellHeight = wellHeight;
    this.wellDiameter = wellDiameter
    this.numOfLetterWells = numOfLetterWells;
    this.numOfNumberWells = numOfNumberWells
    this.loadLabwareString = loadLabwareString
    this.slot = slot
    this.name = "the_" + numberOfWells + "_well_plate_in_" + slot
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    const usedLetters = letters.slice(0, numOfLetterWells)
    usedLetters.forEach(val => {
      for (let i = 0; i < numOfNumberWells; i++) {
        this.wells.push(new Well(this, val + (i + 1)))
      }
    })
  }

  getPythonInit(): string {
    return `
# ${this.type};${JSON.stringify({slot: this.slot})}
${this.name} = protocol.load_labware('${this.loadLabwareString}', ${this.slot})`;
  }
}

export class WellPlate6 extends WellPlateN {
  constructor(slot: number) {
    super({
      wellHeight: 17.40,
      wellDiameter: 35.43,
      numberOfWells: 6,
      type: LabwareType.WellPlate6,
      numOfLetterWells: 2,
      numOfNumberWells: 3,
      loadLabwareString: "corning_6_wellplate_16.8ml_flat",
      slot
    });
  }

  static fromImportComment(comment: string): Labware {
    const [, json] = comment.split(";")
    const {slot} = JSON.parse(json) as { slot: number }
    return new WellPlate6(slot)
  }
}

export class WellPlate12 extends WellPlateN {
  constructor(slot: number) {
    super({
      wellHeight: 17.53,
      wellDiameter: 22.73,
      numberOfWells: 12,
      type: LabwareType.WellPlate12,
      numOfLetterWells: 3,
      numOfNumberWells: 4,
      loadLabwareString: "corning_12_wellplate_6.9ml_flat",
      slot
    });
  }

  static fromImportComment(comment: string): Labware {
    const [, json] = comment.split(";")
    const {slot} = JSON.parse(json) as { slot: number }
    return new WellPlate12(slot)
  }
}

export class WellPlate24 extends WellPlateN {
  constructor(slot: number) {
    super({
      wellHeight: 17.40,
      wellDiameter: 16.26,
      numberOfWells: 24,
      type: LabwareType.WellPlate24,
      numOfLetterWells: 4,
      numOfNumberWells: 6,
      loadLabwareString: "corning_24_wellplate_3.4ml_flat",
      slot
    });
  }

  static fromImportComment(comment: string): Labware {
    const [, json] = comment.split(";")
    const {slot} = JSON.parse(json) as { slot: number }
    return new WellPlate24(slot)
  }
}

export class WellPlate48 extends WellPlateN {
  constructor(slot: number) {
    super({
      wellHeight: 17.40,
      wellDiameter: 11.56,
      numberOfWells: 48,
      type: LabwareType.WellPlate48,
      numOfLetterWells: 6,
      numOfNumberWells: 8,
      loadLabwareString: "corning_48_wellplate_1.6ml_flat",
      slot
    });
  }

  static fromImportComment(comment: string): Labware {
    const [, json] = comment.split(";")
    const {slot} = JSON.parse(json) as { slot: number }
    return new WellPlate48(slot)
  }
}

export class WellPlate96 extends WellPlateN {
  constructor(slot: number) {
    super({
      wellHeight: 10.67,
      wellDiameter: 6.86,
      numberOfWells: 96,
      type: LabwareType.WellPlate96,
      numOfLetterWells: 8,
      numOfNumberWells: 12,
      loadLabwareString: "corning_96_wellplate_360ul_flat",
      slot
    });
  }

  static fromImportComment(comment: string): Labware {
    const [, json] = comment.split(";")
    const {slot} = JSON.parse(json) as { slot: number }
    return new WellPlate96(slot)
  }
}

export class Reservoir12 implements WellPlate {
  isWellPlate: true = true;
  readonly name: string;
  numOfLetterWells = 1;
  numOfNumberWells = 12;
  readonly slot: number;
  readonly type = LabwareType.Reservoir12;
  readonly wells: Well[];

  getPythonInit(): string {
    return `
# ${this.type};${JSON.stringify({slot: this.slot})}
${this.name} = protocol.load_labware('usascientific_12_reservoir_22ml', ${this.slot})`;
  }

  constructor(slot: number) {
    this.name = "the_12_well_reservoir_in_slot_" + slot
    this.slot = slot;
    this.wells = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(v => new Well(this, "A" + v))
  }

  static fromImportComment(comment: string): Labware {
    const [, json] = comment.split(";")
    const {slot} = JSON.parse(json) as { slot: number }
    return new Reservoir12(slot)
  }

  get wellDiameter(): number {
    throw new Error("Accessing Reservoir12 well size!!!")
  }

  get wellHeight(): number {
    throw new Error("Accessing Reservoir12 well size!!!")
  }

}

