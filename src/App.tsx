import React, {useState} from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import {
  Labware,
  LabwareType,
  OpentronsTipRack,
  PlaceHolderStep,
  Step,
  StepType,
  WellPlate96,
} from "./datatypes";
import {StepList} from "./components/StepList";
import {AppBar, createStyles, Fab, Theme, Toolbar, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {StepEditDialog} from "./components/dialogs/StepEditDialog";
import {BasePlateSelect} from "./components/BasePlateSelect";
import {StepNewDialog} from "./components/dialogs/StepNewDialog";
import {DownloadButton} from "./components/DownloadButton";
import {BuildPythonProtocolOptions} from "./pythonConversion";
import {UploadButton} from "./components/UploadButton";

export interface onUpdateSelectedOptions {
  type: LabwareType,
  slot: number
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      flexGrow: 1,
    },
    center: {
      display: "flex",
      justifyContent: "center"
    }
  }),
);

const swapArrayElements = (a: any[], x: number, y: number) => {
  if (a.length === 1) return a;
  a.splice(y, 1, a.splice(x, 1, a[y])[0]);
  return a;
};
export default function App() {
  const classes = useStyles();
  const [selectedStep, setSelectedStep] = React.useState<Step>(new PlaceHolderStep())
  const [steps, setSteps] = React.useState<Step[]>([])//([] as Step[])
  const moveUp = (id: string) => {
    const index = steps.findIndex((val) => val.id === id)
    if (index !== 0) {
      setSteps(prev => {
        return [...swapArrayElements(prev, index, index - 1)];
      })
    }
  }
  const moveDown = (id: string) => {
    const index = steps.findIndex((val) => val.id === id)
    if (index !== steps.length - 1) {
      setSteps(prev => {
        return [...swapArrayElements(prev, index, index + 1)]
      })
    }
  }
  const deleteItem = (id: string) => {
    const index = steps.findIndex((val) => val.id === id)
    setSteps(prev => {
      prev.splice(index, 1)
      return [...prev]
    })
  }
  const saveItem = (step: Step) => {
    const index = steps.findIndex((val) => val.id === step.id)
    setSteps(prev => {
      prev[index] = step
      return [...prev]
    })
  }
  const addNewItem = (step: Step) => {
    setSteps(prev => {
      return [...prev, step]
    })
  }
  const [newDialogIsOpen, setNewDialogIsOpen] = React.useState<boolean>(false)

  const labwareTypes = [LabwareType.OpentronsTipRack, LabwareType.WellPlate96]

  const [selectedLabware, setSelectedLabware] = useState<Labware[]>([] as Labware[])
  const onUpdateSelectedLabware = (selected: onUpdateSelectedOptions[]) => {
    const labwareArray =
      selected.map(({slot, type}) => {
        switch (type) {
          case LabwareType.OpentronsTipRack:
            return new OpentronsTipRack(slot)
          case LabwareType.WellPlate96:
            return new WellPlate96(slot)
          default:
            console.error(selected)
            throw new Error("Invalid Labware Type")
        }

      })
    setSelectedLabware(labwareArray)
  }
  const fileOptions: BuildPythonProtocolOptions = {
    name: "",
    author: "",
    description: "",
    labware: selectedLabware,
    steps: steps
  }
  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Laser Protocol Designer
          </Typography>
          <UploadButton setLabware={labware => {
            setSelectedLabware(labware)
          }} setSteps={steps => {
            steps.map(addNewItem)
          }}>Upload Protocol</UploadButton>
          <DownloadButton fileOptions={fileOptions}>Save as Protocol</DownloadButton>

        </Toolbar>
      </AppBar>
      <BasePlateSelect labware={labwareTypes} currentSelected={selectedLabware} onUpdateSelected={onUpdateSelectedLabware}/>
      <Container maxWidth="sm">
        <Box my={4}>
          <StepList
            onClickItem={step => {
              setSelectedStep(step)
            }}
            onDelete={deleteItem}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            steps={steps}
          />
        </Box>
        <div className={classes.center}>
          <Fab onClick={() => {
            setNewDialogIsOpen(true)
          }} color={"primary"} variant={"extended"}>Add Step</Fab>
        </div>
      </Container>
      <StepNewDialog
        handleClose={() => {
          setNewDialogIsOpen(false)
        }}
        handleSave={addNewItem}
        open={newDialogIsOpen}
        availibleLabware={selectedLabware}/>
      <StepEditDialog
        availibleLabware={selectedLabware}
        initialStep={selectedStep} handleClose={() => {
        setSelectedStep(new PlaceHolderStep())
      }} handleSave={step => {

        saveItem(step)
      }} open={selectedStep.type !== StepType.PLACEHOLDER}/>
    </React.Fragment>
  );
}
