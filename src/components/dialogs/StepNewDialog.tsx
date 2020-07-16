import React, {FC, Fragment, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import {
  Step,
  Labware,
  Well,
  StepType,
  stepTypeHas,
  Transfer,
  Laser,
  Aspirate,
  DisposeTip,
  PickUpTip, Dispense
} from "../../datatypes";
import {FormControl, InputLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {DialogActions, DialogContent, DialogTitle} from "./shared/DialogStyledComponents";
import {WellSelect} from "./shared/WellSelect";
import {makeStyles} from "@material-ui/core/styles";


const useSelectStepStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 120,
  },
}))

interface SelectStepProps {
  currentStepType:StepType|undefined,
  setCurrentStepType: (type: StepType) => void,
}

const SelectStep: FC<SelectStepProps> = ({currentStepType, setCurrentStepType}) => {
  const classes = useSelectStepStyles();
  const options = [StepType.TRANSFER, StepType.LASER, StepType.ASPIRATE, StepType.DISPENSE, StepType.DISPOSE_TIP,
    StepType.PICK_UP_TIP,
    StepType.PLACEHOLDER]
  return (
    <FormControl className={classes.formControl}>
      <InputLabel id={"select-step-label"}>Select Step Type</InputLabel>
      <Select
        // displayEmpty
        labelId={"select-step-label"}
        value={currentStepType ?? ""}
        onChange={e => {
          setCurrentStepType(e.target.value as StepType)
        }}
      >
        {options.map((value, pIndex,) =>
          <MenuItem value={value} key={value}>{value}</MenuItem>,
        )}
      </Select>
    </FormControl>
  )

}


interface StepNewDialogProps {
  availibleLabware: Labware[],
  handleClose: () => void
  handleSave: (step: Step) => void
  open: boolean
}

export const StepNewDialog: FC<StepNewDialogProps> = ({handleClose, handleSave, open, availibleLabware}) => {


  const [from, setFrom] = React.useState<Well | undefined>()
  const [to, setTo] = React.useState<Well | undefined>()
  const [duration, setDuration] = React.useState<number>(0)
  const [location, setLocation] = React.useState<Well | undefined>()
  const [volume, setVolume] = React.useState<number>(0)

  const [currentStepType, setCurrentStepType] = React.useState<StepType | undefined>()


  return (
    <Dialog maxWidth={"md"} onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        New Step
      </DialogTitle>
      <DialogContent dividers>
        <SelectStep setCurrentStepType={(s:StepType)=>{
          setCurrentStepType(s)
        }} currentStepType={currentStepType}/>
        {
          currentStepType && (
            <Fragment>
              <WellSelect availibleLabware={availibleLabware}
                          setWell={(w) => {
                            setFrom(w)
                          }}
                          well={from}
                          hide={!stepTypeHas(currentStepType, "from")}
               name={"From"}/>
              <WellSelect availibleLabware={availibleLabware}
                          setWell={(w) => {
                            setTo(w)
                          }}
                          well={to}
              hide={!stepTypeHas(currentStepType, "to")} name={"Into"}/>
              <WellSelect name={"Location"}
                          availibleLabware={availibleLabware}
                          setWell={(w) => {
                            setLocation(w)
                          }}
                          well={location}
                          hide={!stepTypeHas(currentStepType, "location")}
              />
              {stepTypeHas(currentStepType, "volume") && <TextField type="number" onChange={(e) => {
                e.persist();
                setVolume(Number(e.target.value))
              }} id="outlined-basic" label="Volume [µL]" variant="outlined" value={(volume === 0)?"":volume}/>}
              {stepTypeHas(currentStepType, "duration") && <TextField type="number" onChange={(e) => {
                e.persist();
                setDuration(Number(e.target.value))
              }} id="outlined-basic" label="Duration [sec]" variant="outlined" value={(duration === 0)?"":duration}/>}


            </Fragment>)}


      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>

        <Button autoFocus onClick={() => {
          let step:Step |undefined = undefined
          if(currentStepType === undefined) return
          switch (currentStepType) {
            case StepType.TRANSFER:
              if(from && to && volume) {
                step = new Transfer({from, to, volume})
              }
              break;
            case StepType.LASER:
              if(location && duration) {
                step = new Laser({location, duration})
              }
              break;
            case StepType.ASPIRATE:
              if(from && volume) {
                step = new Aspirate({from,volume})
              }
              break;
            case StepType.DISPENSE:
              if(to && volume) {
                step = new Dispense({to, volume})
              }
              break;
            case StepType.DISPOSE_TIP:
              step = new DisposeTip()
              break;
            case StepType.PICK_UP_TIP:
              step = new PickUpTip()
              break;
            case StepType.PLACEHOLDER:
              break;

          }
          step && handleSave(step);
          step && handleClose()
        }} color="primary">
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}





