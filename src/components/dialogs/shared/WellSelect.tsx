import {instanceOfWellPlate, Labware, Well, WellPlate} from "../../../datatypes";
import React, {FC, Fragment, useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {FormControl, Grid, InputLabel, MenuItem, Select, Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";


const useWellPlateButtonsStyles = makeStyles(theme => ({

  button: {
    borderRadius: "5em",
    // padding:0,
    // numOfNumberWells:"100%"
  },
  buttonSelected: {
    backgroundColor: "lightBlue",
    color: "#222222 !important"
  },
  wellPlateButtonsGrid: {
    border: "1px solid lightGrey",
    margin: "16px auto",
    padding: "8px"
  },
  gridItem: {
    display: "flex",
    justifyContent: "center",
  }
}))
const WellPlateButtons: FC<{ wellPlate: WellPlate | undefined, currentWell: Well | undefined, setWell: (w: Well) => void }> = ({wellPlate, setWell, currentWell}) => {
  const classes = useWellPlateButtonsStyles()

  if (wellPlate === undefined) return null


  const currentWellIndex = wellPlate.wells.findIndex(w => currentWell?.locationString === w.locationString)
  const getClassForButton = (index: number) => {
    if (index === currentWellIndex) {
      return classes.buttonSelected + " " + classes.button
    } else {
      return classes.button
    }
  }
  return (
    <Fragment>
      <Grid className={classes.wellPlateButtonsGrid} container spacing={1}>
        {
          wellPlate.wells.map(
            (w, index) =>
              <Grid className={classes.gridItem} key={index} item
                    xs={(12 / wellPlate?.numOfNumberWells) as boolean | 12 | 8 | "auto" | 1 | 2 | 10 | 4 | 3 | 5 | 6 | 7 | 9 | 11 | undefined}>
                <Button onClick={() => {
                  setWell(w)
                }} disabled={index === currentWellIndex} size={"small"} variant={"outlined"}
                        className={getClassForButton(index)}>{w.locationString}</Button>
              </Grid>
          )
        }
      </Grid>
    </Fragment>
  )

}


const useWellPlatesSelectStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 120,
  },
}))

interface WellPlatesSelectProps {
  wellPlates: WellPlate[],
  name: string,
  currentWellPlate: WellPlate | undefined,
  setWellPlate: (wellPlate: WellPlate) => void
}

const WellPlatesSelect: FC<WellPlatesSelectProps> = ({wellPlates, name, currentWellPlate, setWellPlate}) => {
  const classes = useWellPlatesSelectStyles()
  if(wellPlates.length === 0) return null
  const indexOfCurrent = wellPlates.findIndex((plate => plate.name === currentWellPlate?.name))
  const currentValue = (indexOfCurrent !== -1) ? indexOfCurrent : ""


  return (
    <FormControl className={classes.formControl}>
      <InputLabel id={"select-label-" + name}>{name}</InputLabel>
      <Select
        // displayEmpty
        value={currentValue}
        labelId={"select-label-" + name}
        onChange={e => {
          const index = e.target.value as number
          setWellPlate(wellPlates[index])
        }}
      >
        {wellPlates.map((plate, pIndex,) =>
          <MenuItem value={pIndex} key={plate.name}>{plate.name}</MenuItem>,
        )}
      </Select>
    </FormControl>
  )


}

const useWellSelectStyles = makeStyles(theme => ({
  errorMessage: {
    color: "crimson"
  }
}))

interface WellSelectProps {
  name:string,
  availibleLabware: Labware[],
  initialWell?: Well,
  well?: Well,
  setWell: (w: Well) => void
  hide?: boolean
}

export const WellSelect: FC<WellSelectProps> = ({name, hide, availibleLabware, initialWell, well, setWell}) => {

  const classes = useWellSelectStyles()
  const [wellPlate, setWellPlate] = React.useState<WellPlate | undefined>(initialWell?.wellPlate)
  useEffect(() => {
    setWellPlate(initialWell?.wellPlate)
  }, [initialWell])
  if (hide) return null
  const wellPlates = availibleLabware
    .filter((labware) => instanceOfWellPlate(labware))
    .map(val => (val as WellPlate))

  return <Fragment>
    {(wellPlates.length === 0) &&
    <Typography className={classes.errorMessage} variant="h4">No Well Plates Selected!</Typography>
    }
    <WellPlatesSelect wellPlates={wellPlates}
                      currentWellPlate={wellPlate}
                      setWellPlate={(wellPlate: WellPlate) => {
                        setWellPlate(wellPlate)
                      }}
                      name={name}/>
    <WellPlateButtons currentWell={well?.wellPlate?.name === wellPlate?.name ? well : undefined}
                      setWell={setWell}
                      wellPlate={wellPlate}/>
  </Fragment>
}
