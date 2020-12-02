import React, {useState} from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import {
  copyStep,
  TubeRack24Eppendorf15,
  TubeRack15Falcon15,
  Labware,
  LabwareType,
  OpentronsTipRack,
  PlaceHolderStep, Reservoir12,
  Step,
  StepType, WellPlate12, WellPlate24, WellPlate48, WellPlate6,
  WellPlate96,
} from "./datatypes";
import {StepList} from "./components/StepList";
import {AppBar, createStyles, Fab, TextField, Theme, Toolbar, Typography} from "@material-ui/core";
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
    },
    metaContainer: {
      marginTop: "75px",
      display: "grid",
      rowGap: "16px"
    },
    fab: {
      marginBottom: "16px"
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
  const [steps, setSteps] = React.useState<Step[]>([])
  const [highlightedItemId, setHighlightedItemId] = useState<string>()
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
    setHighlightedItemId(step.id)
    setTimeout(() => {
      setHighlightedItemId(undefined)
    }, 2000)
    setSteps(prev => {
      prev[index] = step
      return [...prev]
    })
  }
  const addItem = (step: Step, withColor?: boolean, index?: number,) => {
    if (withColor) {
      setHighlightedItemId(step.id)
      setTimeout(() => {
        setHighlightedItemId(undefined)
      }, 2000)
    }
    if (index === undefined || index >= steps.length) {
      setSteps(prev => {
        return [...prev, step]
      })
    } else {
      setSteps(prev => {
        const a = [...prev]
        a.splice(index, 0, step)
        return a
      })
    }
  }
  const copyItem = (id: string) => {
    const index = steps.findIndex((val) => val.id === id)
    if (index !== -1) {
      const item = steps[index]
      const step = copyStep(item)
      addItem(step, true, index + 1)
    }
  }
  const [newDialogIsOpen, setNewDialogIsOpen] = React.useState<boolean>(false)

  const [name, setName]                       = React.useState<string>("")
  const [description, setDescription]         = React.useState<string>("")
  const [author, setAuthor]                   = React.useState<string>("")


  const labwareTypes = [
    LabwareType.OpentronsTipRack,
    LabwareType.Reservoir12,
    LabwareType.WellPlate96,
    LabwareType.WellPlate48,
    LabwareType.WellPlate24,
    LabwareType.WellPlate12,
    LabwareType.WellPlate6,
    LabwareType.TubeRack15Falcon15,
    LabwareType.TubeRack24Eppendorf15,
  ]

  const [selectedLabware, setSelectedLabware] = useState<Labware[]>([] as Labware[])
  const onUpdateSelectedLabware = (selected: onUpdateSelectedOptions[]) => {
    const labwareArray =
      selected.map(({slot, type}) => {
        switch (type) {
          case LabwareType.WellPlate6:
            return new WellPlate6(slot)
          case LabwareType.WellPlate12:
            return new WellPlate12(slot)
          case LabwareType.WellPlate24:
            return new WellPlate24(slot)
          case LabwareType.WellPlate48:
            return new WellPlate48(slot)
          case LabwareType.WellPlate96:
            return new WellPlate96(slot)
          case LabwareType.Reservoir12:
            return new Reservoir12(slot)
          case LabwareType.OpentronsTipRack:
            return new OpentronsTipRack(slot)
          case LabwareType.TubeRack15Falcon15:
            return new TubeRack15Falcon15(slot)
          case LabwareType.TubeRack24Eppendorf15:
            return new TubeRack24Eppendorf15(slot)
          default:
            console.error(selected)
            throw new Error("Invalid Labware Type")
        }

      })
    setSelectedLabware(labwareArray)
  }
  const fileOptions: BuildPythonProtocolOptions = {
    name,
    author,
    description,
    labware: selectedLabware,
    steps: steps
  }
  return (
    <React.Fragment>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Laser Protocol Designer
          </Typography>
          <UploadButton setLabware={labware => {
            setSelectedLabware(labware)
          }} setSteps={steps => {
            setSteps([])
            steps.map(v => addItem(v))
          }} setMeta={({name, author, description}: { name: string, author: string, description: string }) => {
            setName(name)
            setAuthor(author)
            setDescription(description)
          }}>Upload Protocol</UploadButton>
          <DownloadButton fileOptions={fileOptions}>Save as Protocol</DownloadButton>

        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" className={classes.metaContainer}>

        <TextField
          onChange={(e) => {
            setName(e.target.value)
          }}
          label="Protocol Name"
          variant="outlined"
          value={name}
        />
        <TextField
          onChange={(e) => {
            setAuthor(e.target.value)
          }}
          label="Author"
          variant="outlined"
          value={author}
        />
        <TextField
          onChange={(e) => {
            setDescription(e.target.value)
          }}
          multiline
          rowsMax={4}
          label="Description"
          variant="outlined"
          value={description}
        />

      </Container>
      <BasePlateSelect labware={labwareTypes} currentSelected={selectedLabware}
                       onUpdateSelected={onUpdateSelectedLabware}/>
      <Container maxWidth="sm">
        <Box my={4}>
          <StepList
            onCopy={copyItem}
            onClickItem={step => {
              setSelectedStep(step)
            }}
            onDelete={deleteItem}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            steps={steps}
            highlightItemId={highlightedItemId}/>
        </Box>
        <div className={classes.center}>
          <Fab className={classes.fab} onClick={() => {
            setNewDialogIsOpen(true)
          }} color={"primary"} variant={"extended"}>Add Step</Fab>
        </div>
      </Container>
      <StepNewDialog
        handleClose={() => {
          setNewDialogIsOpen(false)
        }}
        handleSave={(s) => addItem(s, true)}
        open={newDialogIsOpen}
        availableLabware={selectedLabware}/>
      <StepEditDialog
        availableLabware={selectedLabware}
        initialStep={selectedStep} handleClose={() => {
        setSelectedStep(new PlaceHolderStep())
      }} handleSave={step => {
        saveItem(step)
      }} open={selectedStep.type !== StepType.PLACEHOLDER}/>
    </React.Fragment>
  );
}
