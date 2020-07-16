import React, {FC} from "react";
import {
  createStyles,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Theme, Typography
} from "@material-ui/core";
import {Step, StepType} from "../datatypes";
import {makeStyles} from "@material-ui/core/styles";
import {ArrowDownward, ArrowUpward, Delete} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      maxWidth: 752,
    },
    demo: {
      backgroundColor: theme.palette.background.paper,
    },
    title: {
      margin: theme.spacing(4, 0, 2),
    },
    noStepsDiv: {
      padding: 16,
      display: "flex",
      justifyContent: "center"
    }
  }),
);

interface StepListProps {
  steps: Step[]
  onClickItem: (item: Step) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onDelete: (id: string) => void
}


function getListItemText(step: Step) {
  const secondaryArray: string[] = []
  if (step.volume) {
    secondaryArray.push("Vol: " + step.volume + "µL")
  }
  if (step.from) {
    secondaryArray.push("From: " + step.from)
  }
  if (step.to) {
    secondaryArray.push("To: " + step.to)
  }
  if (step.duration) {
    secondaryArray.push("Duration: " + step.duration + " sec")
  }
  if (step.location) {
    secondaryArray.push("Over: " + step.location)
  }

  return <ListItemText
    primary={step.type}
    secondary={secondaryArray.join(" ")}
  />
}

export const StepList: FC<StepListProps> = ({steps, onClickItem, onMoveUp, onMoveDown, onDelete}) => {
  const classes = useStyles()

  return (
    <Paper className={classes.demo}>
      <List>
        {steps.length === 0 && <div className={classes.noStepsDiv}><Typography variant="h5">
          No Steps Added
        </Typography></div>}
        {steps.map((step, i) => (
          <ListItem onClick={() => {
            if (step.type !== StepType.DISPOSE_TIP && step.type !== StepType.PICK_UP_TIP) onClickItem(step)
          }} button key={step.id}>
            <ListItemIcon>
              {i + 1}.
            </ListItemIcon>
            {getListItemText(step)}
            <ListItemSecondaryAction>
              <IconButton onClick={() => {
                onMoveUp(step.id)
              }} edge="end" aria-label="move up">
                <ArrowUpward/>
              </IconButton>
              <IconButton onClick={() => {
                onMoveDown(step.id)
              }} edge="end" aria-label="move down">
                <ArrowDownward/>
              </IconButton>
              <IconButton onClick={() => {
                onDelete(step.id)
              }} edge="end" aria-label="move down">
                <Delete/>
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}