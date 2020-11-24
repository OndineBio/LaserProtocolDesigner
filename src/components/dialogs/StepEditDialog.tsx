import React, {FC, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import {Step, stepTypeHas, Labware, Well} from "../../datatypes";
import {TextField, Checkbox, FormControlLabel, FormControl, Select, InputLabel, MenuItem, Grid, withStyles, Theme, Tooltip} from "@material-ui/core";
import {DialogActions, DialogContent, DialogTitle} from "./shared/DialogStyledComponents";
import {WellSelect} from "./shared/WellSelect";


interface StepDialogProps {
  availableLabware: Labware[],
  initialStep: Step
  handleClose: () => void
  handleSave: (step: Step) => void
  open: boolean
}

const LightTooltip = withStyles((theme: Theme) => ({
  arrow: {
    color: theme.palette.warning.main,
  },
  tooltip: {
    backgroundColor: theme.palette.warning.main,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);


export const StepEditDialog: FC<StepDialogProps> = ({initialStep, handleClose, handleSave, open, availableLabware}) => {

  useEffect(() => {
    setFrom(initialStep?.from)
    setTo(initialStep?.to)
    setDuration(initialStep?.duration ?? 0)
    setLocation(initialStep?.location)
    setVolume(initialStep?.volume ?? 0)
    setTouchTip(initialStep?.touchtip ?? true)
    setAirgap(initialStep?.airgap ?? 0)
    setBlowout(initialStep?.blowout ?? false)
    setBlowoutLocation(initialStep?.blowoutLocation ?? "trash")
    setTimes(initialStep?.times ?? 0)
    setHeightOfAgar(initialStep?.heightOfAgar ?? 0)
    setSterility(initialStep?.sterility ?? "once")

  }, [initialStep]);


  const [from, setFrom] = React.useState<Well | undefined>(initialStep?.from)
  const [to, setTo] = React.useState<Well | undefined>(initialStep?.to)
  const [duration, setDuration] = React.useState<number>(initialStep?.duration ?? 0)
  const [location, setLocation] = React.useState<Well | undefined>(initialStep?.location)
  const [volume, setVolume] = React.useState<number>(initialStep?.volume ?? 0)
  const [touchtip, setTouchTip] = React.useState<boolean>(initialStep?.touchtip ?? true)
  const [airgap, setAirgap] = React.useState<number>(initialStep?.airgap ?? 0)
  const [blowout, setBlowout] = React.useState<boolean>(initialStep?.blowout ?? false)
  const [blowoutLocation, setBlowoutLocation] = React.useState<string>(initialStep?.blowoutLocation ?? "destination well")
  const [times, setTimes] = React.useState<number>(initialStep?.times ?? 0)
  const [heightOfAgar, setHeightOfAgar] = React.useState<number>(initialStep?.heightOfAgar ?? 0)
  const [sterility, setSterility] = React.useState<string>(initialStep?.sterility ?? "once")

  return (
    <Dialog maxWidth={"md"} onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        {initialStep.type}
      </DialogTitle>
      <DialogContent dividers>
        <WellSelect availableLabware={availableLabware}
                    initialWell={initialStep?.from}
                    setWell={(w) => {
                      setFrom(w)
                    }}
                    well={from}
                    hide={initialStep?.from === undefined}
                    name={"From"}/>
        <WellSelect availableLabware={availableLabware}
                    initialWell={initialStep?.to}
                    setWell={(w) => {
                      setTo(w)
                    }}
                    well={to}
                    hide={initialStep?.to === undefined}
                    name={"Into"}/>

        <WellSelect availableLabware={availableLabware}
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

        {(initialStep?.touchtip === false || initialStep?.touchtip === true) && (<FormControlLabel control={<Checkbox onChange={(e) => {
          e.persist();
          setTouchTip(Boolean(e.target.checked))
        }} checked={touchtip}/>} label="Touch Tip"/>)}

        {stepTypeHas(initialStep?.type, "airgap") ? <TextField type="number" onChange={(e) => {
          e.persist();
          setAirgap(Number(e.target.value))
        }} id="outlined-basic" label="Airgap after Aspirate" variant="outlined" value={(airgap === 0) ? "" : airgap}/> : ''}

        <Grid container spacing={2}>
          <Grid item xs>
            {(initialStep?.blowout === false || initialStep?.blowout === true) && (<FormControlLabel control={<Checkbox onChange={(e) => {
              e.persist();
              setBlowout(Boolean(e.target.checked))
            }} checked={blowout}/>} label="Blowout after Dispense"/>)}
          </Grid>
          <Grid item md hidden={!blowout}>
            {(initialStep?.blowoutLocation && blowout === true) && <FormControl>
              <InputLabel id={"blowout-location-label"}>Blowout Location</InputLabel>
              <Select labelId={"blowout-location-label"} onChange={(e) => {
                e.persist();
                setBlowoutLocation(e.target.value as string)
              }} id="select-blowoutlocation" value={blowoutLocation} >
                <MenuItem value="destination well">Destination Well</MenuItem>
                <MenuItem value="source well">Source Well</MenuItem>
                <MenuItem value="trash">Trash</MenuItem>
              </Select>
            </FormControl>}
          </Grid>
        </Grid>

        {initialStep?.times && <TextField type="number" onChange={(e) => {
          e.persist();
          setTimes(Number(e.target.value))
        }} id="outlined-basic" label="Times to mix" variant="outlined" value={(times === 0) ? "" : times}/>}

        {stepTypeHas(initialStep?.type, "heightOfAgar") ? <TextField type="number" onChange={(e) => {
          e.persist();
          setHeightOfAgar(Number(e.target.value))
        }} id="outlined-basic" label="Height of Agar [mm]" variant="outlined"
                                                                    value={(heightOfAgar === 0) ? "" : heightOfAgar}/> : ''}

        {initialStep?.duration && <TextField type="number" onChange={(e) => {
          e.persist();
          setDuration(Number(e.target.value))
        }} id="outlined-basic" label="Duration [sec]" variant="outlined" value={(duration === 0) ? "" : duration}/>}

        {initialStep?.sterility && <FormControl>
          <InputLabel id={"sterility-label"}>Change Tip</InputLabel>
          <Select labelId={"sterility-label"} onChange={(e) => {
            e.persist();
            setSterility(e.target.value as string)
          }} id="select" value={sterility} >
            <MenuItem value="once">Once at start of step</MenuItem>
            <MenuItem value="always">Before every aspirate</MenuItem>
            <MenuItem value="never">Never</MenuItem>
          </Select>
        </FormControl>}


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
          if (stepTypeHas(initialStep?.type, "volume")) {
            if (volume !== 0) {
              initialStep.volume = volume
            }
          }
          if (initialStep?.touchtip === false || initialStep?.touchtip === true) {
            initialStep.touchtip = touchtip
          }
          if (stepTypeHas(initialStep?.type, "airgap")) {
            initialStep.airgap = airgap
          }
          if (initialStep?.blowout === false || initialStep?.blowout === true) {
            initialStep.blowout = blowout
          }
          if (initialStep?.blowoutLocation) {
            initialStep.blowoutLocation = blowoutLocation
          }
          if (initialStep?.location) {
            initialStep.location = location
          }
          if (initialStep?.duration) {
            if (duration !== 0) {
              initialStep.duration = duration
            }
          }
          if (initialStep?.times) {
            initialStep.times = times
          }
          if (stepTypeHas(initialStep?.type, "heightOfAgar")) {
            if (heightOfAgar !== 0) {
              initialStep.heightOfAgar = heightOfAgar
            }
          }
          if (initialStep?.sterility) {
            initialStep.sterility = sterility
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





