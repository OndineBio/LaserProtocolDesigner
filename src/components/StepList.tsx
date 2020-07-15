import React, {FC} from "react";
import {
  createStyles, IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Theme
} from "@material-ui/core";
import {Step} from "../datatypes";
import {makeStyles} from "@material-ui/core/styles";
import {ArrowDownward, ArrowUpward} from "@material-ui/icons";

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
  }),
);
interface StepListProps {
  steps: Step[]
  onClickItem: (item:Step) => void
  onMoveUp:(id:string)=>void
  onMoveDown:(id:string)=>void
}
export const StepList: FC<StepListProps> = ({steps, onClickItem, onMoveUp, onMoveDown}) => {
  const classes = useStyles()
  console.log("2",steps)
  return (
    <Paper className={classes.demo}>
      <List>
        {steps.map((step, i) => (
          <ListItem onClick={()=>{
            onClickItem(step)
          }} button key={step.id}>
            <ListItemIcon>
              {i+1}.
            </ListItemIcon>
            <ListItemText
              primary={step.type}
              secondary={step.id}
            />
            <ListItemSecondaryAction>
              <IconButton onClick={()=>{onMoveUp(step.id)}} edge="end" aria-label="move up">
                <ArrowUpward/>
              </IconButton>
              <IconButton onClick={()=>{onMoveDown(step.id)}} edge="end" aria-label="move down">
                <ArrowDownward/>
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}