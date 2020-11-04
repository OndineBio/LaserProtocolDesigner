import React, {FC, Fragment} from 'react';
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
  Dispense,
  Mix, Plate, Wait
} from "../../datatypes";
import {FormControl, InputLabel, MenuItem, Select, TextField, Checkbox, FormControlLabel, Tooltip, Grid } from "@material-ui/core";
import {DialogActions, DialogContent, DialogTitle} from "./shared/DialogStyledComponents";
import {WellSelect} from "./shared/WellSelect";
import {makeStyles, Theme, withStyles} from "@material-ui/core/styles";


const useSelectStepStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 120,
  },
}))

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

interface SelectStepProps {
  currentStepType: StepType | undefined,
  setCurrentStepType: (type: StepType) => void,
}

const SelectStep: FC<SelectStepProps> = ({currentStepType, setCurrentStepType}) => {
  const classes = useSelectStepStyles();
  const options = [StepType.TRANSFER, StepType.LASER, StepType.ASPIRATE, StepType.DISPENSE, StepType.MIX, StepType.PLATE, StepType.WAIT]
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
  availableLabware: Labware[],
  handleClose: () => void
  handleSave: (step: Step) => void
  open: boolean
}

export const StepNewDialog: FC<StepNewDialogProps> = ({handleClose, handleSave, open, availableLabware}) => {


  const [from, setFrom] = React.useState<Well | undefined>()
  const [to, setTo] = React.useState<Well | undefined>()
  const [duration, setDuration] = React.useState<number>(0)
  const [location, setLocation] = React.useState<Well | undefined>()
  const [volume, setVolume] = React.useState<number>(0)
  const [touchtip, setTouchTip] = React.useState<boolean>(true)
  const [airgap, setAirgap] = React.useState<number>(0)
  const [blowout, setBlowout] = React.useState<boolean>(false)
  const [blowoutLocation, setBlowoutLocation] = React.useState<string>("trash")
  const [times, setTimes] = React.useState<number>(0)
  const [heightOfAgar, setHeightOfAgar] = React.useState<number>(0)
  const [sterility, setSterility] = React.useState<string>("once")
  const [currentStepType, setCurrentStepType] = React.useState<StepType | undefined>()



  return (
    <Dialog maxWidth={"md"} onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        New Step
      </DialogTitle>
      <DialogContent dividers>
        <SelectStep setCurrentStepType={(s: StepType) => {
          setCurrentStepType(s)
        }} currentStepType={currentStepType}/>
        {
          currentStepType && (
            <Fragment>
              <WellSelect availableLabware={availableLabware}
                          setWell={(w) => {
                            setFrom(w)
                          }}
                          well={from}
                          hide={!stepTypeHas(currentStepType, "from")}
                          name={"From"}/>
              <WellSelect availableLabware={availableLabware}
                          setWell={(w) => {
                            setTo(w)
                          }}
                          well={to}
                          hide={!stepTypeHas(currentStepType, "to")} name={"Into"}/>
              <WellSelect name={"Location"}
                          availableLabware={availableLabware}
                          setWell={(w) => {
                            setLocation(w)
                          }}
                          well={location}
                          hide={!stepTypeHas(currentStepType, "location")}
              />
              {stepTypeHas(currentStepType, "volume") && <TextField required type="number" onChange={(e) => {
                e.persist();
                setVolume(Number(e.target.value))
              }} id="outlined-basic" label="Volume [µL]" variant="outlined" value={(volume === 0) ? "" : volume}/>}
              
              {stepTypeHas(currentStepType, "touchtip") && (<FormControlLabel control={<Checkbox onChange={(e) => {
                e.persist();
                setTouchTip(Boolean(e.target.checked))
              }} checked={touchtip}/>} label="Touch Tip"/>)}
              
              {stepTypeHas(currentStepType, "airgap") && <TextField type="number" onChange={(e) => {
                e.persist();
                setAirgap(Number(e.target.value))
              }} id="outlined-basic" label="Airgap after Aspirate" variant="outlined" value={(airgap === 0) ? "" : airgap}/>}

              <Grid container spacing={2}>
                <Grid item xs>
                  {stepTypeHas(currentStepType, "blowout") && (<FormControlLabel control={<Checkbox onChange={(e) => {
                    e.persist();
                    setBlowout(Boolean(e.target.checked))
                  }} checked={blowout}/>} label="Blowout after Dispense"/>)}
                </Grid>
                <Grid item md hidden={!blowout}>
                  {(stepTypeHas(currentStepType, "blowoutLocation") && blowout === true) && <FormControl>
                    <InputLabel id={"blowout-location-label"}>Blowout Location</InputLabel>
                    <LightTooltip title="Not yet supported" placement="left" arrow>
                      <Select disabled labelId={"blowout-location-label"} onChange={(e) => {
                        e.persist();
                        setBlowoutLocation(e.target.value as string)
                      }} id="select-blowoutlocation" value={blowoutLocation} >
                        <MenuItem value="destination well">Destination Well</MenuItem>
                        <MenuItem value="source well">Source Well</MenuItem>
                        <MenuItem value="trash">Trash</MenuItem>
                      </Select>
                    </LightTooltip>
                  </FormControl>}
                </Grid>
              </Grid>

              {stepTypeHas(currentStepType, "times") && <TextField required type="number" onChange={(e) => {
                e.persist();
                setTimes(Number(e.target.value))
              }} id="outlined-basic" label="Times to mix" variant="outlined" value={(times === 0) ? "" : times}/>}

              {stepTypeHas(currentStepType, "heightOfAgar") && <TextField required type="number" onChange={(e) => {
                e.persist();
                setHeightOfAgar(Number(e.target.value))
              }} id="outlined-basic" label="Height of Agar [mm]" variant="outlined"
                                                                          value={(heightOfAgar === 0) ? "" : heightOfAgar}/>}

              {stepTypeHas(currentStepType, "duration") && <TextField required type="number" onChange={(e) => {
                e.persist();
                setDuration(Number(e.target.value))
              }} id="outlined-basic" label="Duration [sec]" variant="outlined"
                                                                      value={(duration === 0) ? "" : duration}/>}
              {stepTypeHas(currentStepType, "sterility") && <FormControl>
                <InputLabel id={"sterility-label"}>Change Tip</InputLabel>
                <Select labelId={"sterility-label"} onChange={(e) => {
                  e.persist();
                  setSterility(e.target.value as string)
                }} id="select=sterility" value={sterility} >
                  <MenuItem value="once">Once at start of step</MenuItem>
                  <MenuItem value="always">Before every aspirate</MenuItem>
                  <MenuItem value="never">Never</MenuItem>
                </Select>
              </FormControl>}                                                        


            </Fragment>)}


      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>

        <Button autoFocus onClick={() => {
          let step: Step | undefined = undefined
          if (currentStepType === undefined) return
          switch (currentStepType) {
            case StepType.TRANSFER:
              if (from && to && volume) {
                step = new Transfer({from, to, volume, touchtip, airgap, blowout, blowoutLocation, sterility})
              }
              break;
            case StepType.LASER:
              if (location && duration) {
                step = new Laser({location, duration})
              }
              break;
            case StepType.ASPIRATE:
              if (from && volume) {
                step = new Aspirate({from, volume, touchtip})
              }
              break;
            case StepType.DISPENSE:
              if (to && volume) {
                step = new Dispense({to, volume, touchtip, blowout})
              }
              break;
            case StepType.MIX:
              if (from && volume && times) {
                step = new Mix({from, volume, times})
              }
              break;
            case StepType.PLATE:
              if (from && volume && heightOfAgar && to) {
                step = new Plate({from, to, volume, touchtip, airgap, heightOfAgar, blowout, blowoutLocation})
              }
              break;
            case StepType.WAIT:
              if (duration) {
                step = new Wait({duration})
              }
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





