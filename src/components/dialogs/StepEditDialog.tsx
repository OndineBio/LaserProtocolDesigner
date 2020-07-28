import React, {FC, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import {Step, Labware, Well} from "../../datatypes";
import {TextField} from "@material-ui/core";
import {DialogActions, DialogContent, DialogTitle} from "./shared/DialogStyledComponents";
import {WellSelect} from "./shared/WellSelect";


interface StepDialogProps {
  availibleLabware: Labware[],
  initialStep: Step
  handleClose: () => void
  handleSave: (step: Step) => void
  open: boolean
}


export const StepEditDialog: FC<StepDialogProps> = ({initialStep, handleClose, handleSave, open, availibleLabware}) => {

  useEffect(() => {
    setFrom(initialStep?.from)
    setTo(initialStep?.to)
    setDuration(initialStep?.duration ?? 0)
    setLocation(initialStep?.location)
    setVolume(initialStep?.volume ?? 0)
    setTimes(initialStep?.times ?? 0)
    setHeightOfAgar(initialStep?.heightOfAgar ??0)

  }, [initialStep]);


  const [from, setFrom] = React.useState<Well | undefined>(initialStep?.from)
  const [to, setTo] = React.useState<Well | undefined>(initialStep?.to)
  const [duration, setDuration] = React.useState<number>(initialStep?.duration ?? 0)
  const [location, setLocation] = React.useState<Well | undefined>(initialStep?.location)
  const [volume, setVolume] = React.useState<number>(initialStep?.volume ?? 0)
  const [times, setTimes] = React.useState<number>(initialStep?.times ?? 0)
  const [heightOfAgar, setHeightOfAgar] = React.useState<number>(initialStep?.heightOfAgar ?? 0)

  return (
    <Dialog maxWidth={"md"} onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        {initialStep.type}
      </DialogTitle>
      <DialogContent dividers>
        <WellSelect availibleLabware={availibleLabware}
                    initialWell={initialStep?.from}
                    setWell={(w) => {
                      setFrom(w)
                    }}
                    well={from}
                    hide={initialStep?.from === undefined}
                    name={"From"}/>
        <WellSelect availibleLabware={availibleLabware}
                    initialWell={initialStep?.to}
                    setWell={(w) => {
                      setTo(w)
                    }}
                    well={to}
                    hide={initialStep?.to === undefined}
                    name={"Into"}/>

        <WellSelect availibleLabware={availibleLabware}
                    initialWell={initialStep?.location}
                    setWell={(w) => {
                      setLocation(w)
                    }}
                    well={location}
                    hide={initialStep?.location === undefined}
                    name={"Over"}/>

        {initialStep?.volume && <TextField type="number" onChange={(e) => {
          e.persist();
          setVolume(Number(e.target.value))
        }} id="outlined-basic" label="Volume [µL]" variant="outlined" value={(volume === 0) ? "" : volume}/>}

        {initialStep?.times && <TextField type="number" onChange={(e) => {
          e.persist();
          setTimes(Number(e.target.value))
        }} id="outlined-basic" label="Times to mix" variant="outlined" value={(times === 0) ? "" : times}/>}

        {initialStep?.heightOfAgar && <TextField type="number" onChange={(e) => {
          e.persist();
          setHeightOfAgar(Number(e.target.value))
        }} id="outlined-basic" label="Height of Agar [mm]" variant="outlined"
                                                                    value={(heightOfAgar === 0) ? "" : heightOfAgar}/>}

        {initialStep?.duration && <TextField type="number" onChange={(e) => {
          e.persist();
          setDuration(Number(e.target.value))
        }} id="outlined-basic" label="Duration [sec]" variant="outlined" value={(duration === 0) ? "" : duration}/>}


      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button autoFocus onClick={() => {
          if (initialStep?.to) {
            initialStep.to = to
          }
          if (initialStep?.from) {
            initialStep.from = from
          }
          if (initialStep?.volume) {
            initialStep.volume = volume
          }
          if (initialStep?.location) {
            initialStep.location = location
          }
          if (initialStep?.duration) {
            initialStep.duration = duration
          }
          if (initialStep?.times) {
            initialStep.times = times
          }
          if (initialStep)
            handleSave(initialStep);
          handleClose()
        }} color="primary">
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}





