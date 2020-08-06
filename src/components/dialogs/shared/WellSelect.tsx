import {instanceOfWellPlate, Labware, OpentronsTipRack, Well, WellPlate} from "../../../datatypes";
import React, {FC, Fragment, useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {FormControl, InputLabel, MenuItem, Select, Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";


const useWellPlateButtonsStyles = (wellPlate: WellPlate | undefined) => makeStyles(theme => {

  let obj: any = {}

  if (wellPlate) {
    obj = {
      labwareGrid: {
        gap: "8px",
        display: "grid",
        gridTemplateColumns: `repeat(${wellPlate.numOfNumberWells}, 1fr)`,
        gridTemplateRows: `repeat(${wellPlate.numOfLetterWells}, 1fr)`
      }
    }
    for (let row = 0; row < wellPlate?.numOfNumberWells; row++) {
      for (let col = 0; col < wellPlate?.numOfLetterWells; col++) {

        try {
          obj[wellPlate?.wells[col * wellPlate?.numOfNumberWells + row].locationString] = {
            gridColumn: `${row + 1} / span 1`,
            gridRow: `${col + 1} / span 1`
          }
        } catch (e) {
          console.error("Error in well style", {
            row,
            col,
            wellPlate,
            wells: wellPlate?.wells,
            num: col * wellPlate?.numOfNumberWells + row
          })
        }
      }
    }
  }


  return {
    ...obj,
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
  }
})

const WellPlateButtons: FC<{ wellPlate: WellPlate | undefined, currentWell: Well | undefined, setWell: (w: Well) => void }> = ({wellPlate, setWell, currentWell}) => {
  const classes: any = useWellPlateButtonsStyles(wellPlate)()

  if (wellPlate === undefined) return null


  const currentWellIndex = wellPlate.wells.findIndex(w => currentWell?.locationString === w.locationString)
  const getClassForButton = (index: number) => {
    if (index === currentWellIndex) {
      return classes?.['buttonSelected'] + " " + classes?.['button']
    } else {
      return classes?.['button']
    }
  }
  return (
    <Fragment>
      <div className={classes?.["labwareGrid"]}>
        {
          wellPlate.wells.map(
            (w, index) =>
              // <Grid className={classes.gridItem} key={index} item
              //       xs={(12 / wellPlate?.numOfNumberWells) as boolean | 12 | 8 | "auto" | 1 | 2 | 10 | 4 | 3 | 5 | 6 | 7 | 9 | 11 | undefined}>

                <Button onClick={() => {
                  setWell(w)
                }} disabled={index === currentWellIndex} size={"small"} variant={"outlined"}
                        className={getClassForButton(index) + " " + classes?.[w.locationString]}>{w.locationString}</Button>

            // </Grid>
          )
        }
      </div>
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
  if (wellPlates.length === 0) return null
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
  name: string,
  availableLabware: Labware[],
  initialWell?: Well,
  well?: Well,
  setWell: (w: Well) => void
  hide?: boolean
}

export const WellSelect: FC<WellSelectProps> = ({name, hide, availableLabware, initialWell, well, setWell}) => {

  const classes = useWellSelectStyles()
  const [wellPlate, setWellPlate] = React.useState<WellPlate | undefined>(initialWell?.wellPlate)
  useEffect(() => {
    setWellPlate(initialWell?.wellPlate)
  }, [initialWell])
  if (hide) return null
  const wellPlates = availableLabware
    .filter((labware) => instanceOfWellPlate(labware))
    .map(val => (val as WellPlate))
  const tipRacks = availableLabware
    .filter((labware) => OpentronsTipRack)
    .map(val => (val as OpentronsTipRack))

  return <Fragment>
    {(tipRacks.length === 0 ) &&
    <Typography className={classes.errorMessage} variant="h4">No Tip Racks Available!</Typography>
    }
    {(wellPlates.length === 0) &&
    <Typography className={classes.errorMessage} variant="h4">No Well Plates Available!</Typography>
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
