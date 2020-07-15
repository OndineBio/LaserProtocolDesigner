import React, {Component, FC, useEffect} from 'react';
import {createStyles, Theme, withStyles, WithStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import {AnyStep, PickUpTip, Aspirate, Dispense, DisposeTip, Laser, Step, StepType, Transfer} from "../datatypes";
import {TextField} from "@material-ui/core";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const {children, classes, onClose, ...other} = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon/>
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    display: "grid",
    rowGap: "16px",
    gridRow: "auto",
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);


//Transfer | Laser | Aspirate | Dispense | DisposeTip


type stepUpdate = (func: (prev: Step) => Step) => void;


interface StepDialogProps {
  initialStep: Step
  handleClose: () => void
  handleSave: (step: Step) => void
  handleDelete: (step: Step) => void
  open: boolean
}

export const StepEditDialog: FC<StepDialogProps> = ({initialStep, handleClose, handleSave, open, handleDelete}) => {
  useEffect(() => {
    setFrom(initialStep?.from ?? "")
    setTo(initialStep?.to ?? "")
    setDuration(initialStep?.duration ?? 0)
    setLocation(initialStep?.location ?? "")
    setVolume(initialStep?.volume ?? 0)

  }, [initialStep]);
  const [from, setFrom] = React.useState<string>(initialStep?.from ?? "")
  const [to, setTo] = React.useState<string>(initialStep?.to ?? "")
  const [duration, setDuration] = React.useState<number>(initialStep?.duration ?? 0)
  const [location, setLocation] = React.useState<string>(initialStep?.location ?? "")
  const [volume, setVolume] = React.useState<number>(initialStep?.volume ?? 0)


  const getLaserContent = () => {
    return <React.Fragment>
      <TextField type="number" onChange={(e) => {
        e.persist();
        setDuration(Number(e.target.value))
      }} id="outlined-basic" label="Duration [sec]" variant="outlined" value={duration}/>
      <TextField onChange={(e) => {
        e.persist();
        setLocation(e.target.value)
      }} id="outlined-basic" label="Location" variant="outlined" value={location}/>
    </React.Fragment>
  }
  const getAspirateContent = () => {
    return <React.Fragment>
      <TextField onChange={(e) => {
        e.persist();
        setFrom(e.target.value)
      }} id="outlined-basic" label="From" variant="outlined" value={from}/>
      <TextField type="number" onChange={(e) => {
        e.persist();
        setVolume(Number(e.target.value))
      }} id="outlined-basic" label="Volume" variant="outlined" value={volume}/>
    </React.Fragment>
  }
  const getDispenseContent = () => {
    return <React.Fragment>
      <TextField onChange={(e) => {
        e.persist();
        setTo(e.target.value)
      }} id="outlined-basic" label="To" variant="outlined" value={to}/>
      <TextField type="number" onChange={(e) => {
        e.persist();
        setVolume(Number(e.target.value))
      }} id="outlined-basic" label="Volume" variant="outlined" value={volume}/> </React.Fragment>
  }
  const getDisposeTipContent = () => {
    return null
  }
  const getPickUpTipContent = () => {
    return null
  }
  /* const getContent = () => {
     console.log(initialStep.type)
     switch (initialStep.type) {
       case StepType.TRANSFER:
         return getTransferContent()
       case StepType.LASER:
         return getLaserContent()
       case StepType.DISPENSE:
         return getDispenseContent()
       case StepType.DISPOSE_TIP:
         return getDisposeTipContent()
       case StepType.PICK_UP_TIP:
         return getPickUpTipContent()
       case StepType.ASPIRATE:
         return getAspirateContent()
       case StepType.PLACEHOLDER:
         return null
     }
   }
   const onInternalSave = () => {
     initialStep.duration = duration
     initialStep.location = location
     initialStep.from = from
     initialStep.to = to
     initialStep.volume = volume
     handleSave(initialStep)
   }*/

  return (
    <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        {initialStep.type}
      </DialogTitle>
      <DialogContent dividers>
        {initialStep?.from && <TextField onChange={(e) => {
          e.persist();
          setFrom(e.target.value)
        }} id="outlined-basic" label="From" variant="outlined" value={from}/>}
        {initialStep?.to && <TextField onChange={(e) => {
          e.persist();
          setTo(e.target.value)
        }} id="outlined-basic" label="To" variant="outlined" value={to}/>}
        {initialStep?.volume && <TextField type="number" onChange={(e) => {
          e.persist();
          setVolume(Number(e.target.value))
        }} id="outlined-basic" label="Volume [µL]" variant="outlined" value={volume}/>}
        {initialStep?.duration && <TextField type="number" onChange={(e) => {
          e.persist();
          setDuration(Number(e.target.value))
        }} id="outlined-basic" label="Duration [sec]" variant="outlined" value={duration}/>}
        {initialStep?.location && <TextField onChange={(e) => {
          e.persist();
          setLocation(e.target.value)
        }} id="outlined-basic" label="Location" variant="outlined" value={location}/>}


      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={()=>{
          handleDelete(initialStep)
          handleClose()
        }} color="primary">
          Delete
        </Button>
        <Button autoFocus onClick={()=>{
          if(initialStep?.to){
            initialStep.to = to
          }
          if(initialStep?.from){
            initialStep.from = from
          }
          if(initialStep?.volume){
            initialStep.volume = volume
          }
          if(initialStep?.location){
            initialStep.location = location
          }
          if(initialStep?.duration){
            initialStep.duration = duration
          }
          handleSave(initialStep);
          handleClose()
        }} color="primary">
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}




