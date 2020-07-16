import React, {FC, useState, useEffect} from "react";
import {Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import {Labware, LabwareType} from "../datatypes";
import {onUpdateSelectedOptions} from "../App";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(1),
  },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
}))


interface BasePlateSelectProps {
  labware: LabwareType[]
  onUpdateSelected: (selected: onUpdateSelectedOptions[]) => void
  currentSelected: Labware[]
}


export const BasePlateSelect: FC<BasePlateSelectProps> = ({currentSelected, labware, onUpdateSelected}) => {
  const classes = useStyles()
  useEffect(()=>{
    const blank = Array(12).fill(null).map(() => "")
    currentSelected.forEach(v => {
      blank[v.slot] = v.type
    });
    setSlotValues(blank)
  },[currentSelected])


  const [slotValues, setSlotValues] = useState<string[]>(Array(12).fill(null).map(() => ""))
  const realIndexToSlot = (realIndex: number): number => {
    const factor = (realIndex % 3 === 0) ? -2 : (realIndex % 3 === 1) ? 0 : 2
    return (12 - realIndex) + factor
  }
  const handleChange = (indexOfValue: number, newValue: string) => {
    setSlotValues(prev => {
      prev[indexOfValue] = newValue

      const filtered = prev.map((type, realIndex) => ({
        type,
        slot: realIndexToSlot(realIndex)
      })).filter(({type}) => type !== "")
        .map(({type, slot}): onUpdateSelectedOptions => ({
          type: type as LabwareType,
          slot
        }))

      onUpdateSelected(filtered)

      return [...prev]
    })
  }
  return (
    <Container className={""}>
      <Box my={4}>
        <Grid container spacing={3}>
          {
            slotValues.map((value, realIndex) => {
              const index = realIndexToSlot(realIndex)
              return <Grid key={index} item xs={4}>
                <Paper className={classes.paper}>
                  {(index === 12) ?
                    <Typography variant={"h4"}>Trash</Typography>
                    : <FormControl className={classes.formControl}>
                      <InputLabel id={"select-label-slot-" + index}>Slot {index}</InputLabel>
                      <Select
                        displayEmpty
                        labelId={"select-label-slot-" + index}
                        value={value}
                        onChange={(event) => {
                          handleChange(realIndex, event.target.value as string)
                        }}
                        renderValue={(value): string => value as string} // make sure None option is not rendered

                      >
                        {(labware as string[]).map((ware) =>
                          <MenuItem key={ware} value={ware}>{ware}</MenuItem>)
                        }
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>

                      </Select>
                    </FormControl>}
                </Paper>
              </Grid>
            })
          }
        </Grid>
      </Box>
    </Container>
  )
}

