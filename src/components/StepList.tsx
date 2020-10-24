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
import {Step} from "../datatypes";
import {makeStyles} from "@material-ui/core/styles";
import {ArrowDownward, ArrowUpward, Delete, FileCopy} from "@material-ui/icons";

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
    },
    highlight: {
      backgroundColor: "#cff0ff",
      border: "#a8c5d2 solid 2px"
    }
  }),
);

interface StepListProps {
  steps: Step[]
  onCopy: (id: string) => void
  onClickItem: (item: Step) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onDelete: (id: string) => void
  highlightItemId?: string
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
  if (step.heightOfAgar) {
    secondaryArray.push("with Agar height: " + step.heightOfAgar + "mm")
  }
  if (step.times) {
    secondaryArray.push(step.times + " times")
  }
  if (step.touchtip) {
    secondaryArray.push("Touch tip: " + step.touchtip)
  }
  if (step.blowout) {
    secondaryArray.push("Blowout: " + step.blowout)
  }
  if (step.blowout && step.blowoutLocation) {
    secondaryArray.push("Blowout Location: " + step.blowoutLocation)
  }
  if (step.sterility) {
    secondaryArray.push("New tip: " + step.sterility)
  }

  return <ListItemText
    primary={step.type}
    secondary={secondaryArray.map(v => <Typography variant="body2">{v}</Typography>)}
  />
}

export const StepList: FC<StepListProps> = ({steps, onCopy, onClickItem, onMoveUp, onMoveDown, onDelete, highlightItemId}) => {
  const classes = useStyles()
  return (
    <Paper className={classes.demo}>
      <List>
        {steps.length === 0 && <div className={classes.noStepsDiv}><Typography variant="h5">
          No Steps Added
        </Typography></div>}
        {steps.map((step, i) => (
          <ListItem
            className={(step.id === highlightItemId) ? classes.highlight : ""}
            onClick={() => {
              onClickItem(step)
            }} button key={step.id}
          >
            <ListItemIcon>
              {i + 1}.
            </ListItemIcon>
            {getListItemText(step)}
            <ListItemSecondaryAction>
              <IconButton onClick={() => {
                onCopy(step.id)
              }} edge="end" aria-label="move down">
                <FileCopy/>
              </IconButton>
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