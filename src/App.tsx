import React from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import {Aspirate, DisposeTip, PlaceHolderStep, Step, StepType} from "./datatypes";
import {StepList} from "./components/StepList";
import {AppBar, Button, createStyles, Fab, Theme, Toolbar, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Add} from "@material-ui/icons"
import {StepEditDialog} from "./components/StepEditDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      position: () => "fixed",
      bottom: "10vw",
      right: "10vh"
    },
    title: {
      flexGrow: 1,
    },
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
  const [steps, setSteps] = React.useState<Step[]>([
    new DisposeTip(),
    new Aspirate({from: 'plate["A4"]', volume: 10}),
    new DisposeTip(),
    new DisposeTip(),
    new DisposeTip(),
  ])//([] as Step[])
  const moveUp = (id: string) => {
    console.log("hello")
    const index = steps.findIndex((val) => val.id === id)
    console.log(index)
    if (index !== 0) {
      setSteps(prev => {
        const ret = [...swapArrayElements(prev, index, index - 1)]
        console.log(prev, ret)
        return ret;
      })
    }
  }
  const moveDown = (id: string) => {
    const index = steps.findIndex((val) => val.id === id)
    if (index !== steps.length-1) {
      setSteps(prev => {
        return [...swapArrayElements(prev, index, index+1)]
      })
    }
  }
  const deleteItem = (id:string) => {
    const index = steps.findIndex((val) => val.id === id)
    setSteps(prev => {
      prev.splice(index, 1)
      return [...prev]
    })
  }
  const saveItem = (step:Step) => {
    const index = steps.findIndex((val) => val.id === step.id)
    setSteps(prev => {
      prev[index] = step
      return [...prev]
    })
  }

  console.log("1",steps)
  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Laser Protocol Designer
          </Typography>
          <Button variant={"outlined"} size={"medium"} color="inherit">add</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Box my={4}>
          <StepList
            onClickItem={step => {
              console.log("hello")
              setSelectedStep(step)
            }}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            steps={steps}
          />
        </Box>
      </Container>
      <StepEditDialog initialStep={selectedStep} handleClose={() => {
        setSelectedStep(new PlaceHolderStep())
      }} handleSave={step => {
        console.log("save", step)
        saveItem(step)
      }} handleDelete={step => {
        deleteItem(step.id)
      }} open={selectedStep.type !== StepType.PLACEHOLDER}/>
    </React.Fragment>
  );
}
