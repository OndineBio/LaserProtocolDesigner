export enum StepType {
  TRANSFER = "TRANSFER", LASER = "LASER", ASPIRATE = "ASPIRATE", DISPENSE = "DISPENSE", DISPOSE_TIP = "DISPOSE_TIP",
  PICK_UP_TIP = "PICK_UP_TIP",
  PLACEHOLDER = "PLACEHOLDER"
}


export type AnyStep = Transfer | Laser | Aspirate | Dispense | DisposeTip

// @ts-ignore
export interface Step {
  [key: string]: any

  id: string,
  type: StepType
  getPythonString: () => string
  from?: string
  to?: string
  duration?: number,
  location?: string,
  volume?: number
}

export class PlaceHolderStep implements Step{
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
  from: string
  to: string
  volume: number

  constructor({from, to, volume}: { from: string, to: string, volume: number }) {
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
  duration: number
  location: string

  constructor({location, duration}: { location: string, duration: number }) {
    this.duration = duration;
    this.location = location;
  }

  getPythonString(): string {
    return "";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
}

export class Aspirate implements Step {
  [k: string]: any;

  type = StepType.ASPIRATE;
  from: string
  volume: number

  constructor({from, volume}: { from: string, volume: number }) {
    this.from = from;
    this.volume = volume;
  }

  getPythonString(): string {
    return "";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
}

export class Dispense implements Step {
  [k: string]: any;

  type = StepType.DISPENSE;
  to: string
  volume: number

  constructor({to, volume}: { to: string, volume: number }) {
    this.to = to;
    this.volume = volume;
  }

  getPythonString(): string {
    return "";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
}

export class DisposeTip implements Step {
  [k: string]: any;

  type = StepType.DISPOSE_TIP;

  getPythonString(): string {
    return "";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
}

export class PickUpTip implements Step {
  [k: string]: any;

  type = StepType.PICK_UP_TIP;

  getPythonString(): string {
    return "";
  }

  id: string = `${Math.floor(Math.random() * 1e6)}`
}


