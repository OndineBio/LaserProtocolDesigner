import {Button} from "@material-ui/core";
import React, {FC} from "react";
import {importPythonProtocol} from "../pythonConversion";
import {Labware, Step} from "../datatypes";

interface UploadButtonProps {
  setLabware:(labware:Labware[])=> void
  setSteps:(steps:Step[])=> void
}


class BasicFile {
  name: string
  type: string
  content: string

  constructor({name, type, content}: { name: string, type: string, content: string }) {
    this.name = name;
    this.type = type;
    this.content = content;
  }
}

export const UploadButton: FC<UploadButtonProps> = ({setSteps,setLabware,  children}) => {
  const parseFile = (file:BasicFile)=>{
    let {name, description, author, steps, labware} = importPythonProtocol({pythonFile:file.content});
    console.log({name, description, author, steps, labware} )
    setSteps(steps)
    setLabware(labware)
  }

  const onUpload = async (event:React.ChangeEvent<HTMLInputElement>) => {
    //keep the event from becoming null
    event.persist();

    const inputElement = event.target;

    const filesRaw: FileList = inputElement!.files as FileList;

    /**
     *
     * @returns {BasicFile}
     */
    const readAFile = (file: undefined | File) => new Promise<BasicFile>((resolve, reject) => {
      const reader = new FileReader();
      // you have to set the callbacks before you call a read method
      reader.onerror = () => reject("Error Uploading");
      reader.onload = () => {
        resolve(new BasicFile({
            name: file?.name as string,
            type: file?.type as string,
            content: reader.result as string,
        }))
      };
      reader.readAsText(file as Blob)
    });

    const filesPromises = [];

    for (let i = 0; i < filesRaw?.length; i++) {
      filesPromises.push(readAFile(filesRaw?.[i]))
    }
    const files:BasicFile[] = await Promise.all(filesPromises)
    parseFile(files[0]);
    // reset inputs file list
    inputElement.value = null as unknown as string
  };
  // pretty much ripped from
  //https://stackoverflow.com/questions/40589302/how-to-enable-file-upload-on-reacts-material-ui-simple-input

  return (
    <React.Fragment>
      <input
        accept="text/x-python"
        style={{display: "none"}}
        id="raised-button-file"
        type="file"
        onChange={onUpload}
      />
      < label
        htmlFor="raised-button-file">
        <Button variant={"outlined"} size={"medium"} color="inherit" component="span">
          {children}
        </Button>
      </label>
    </React.Fragment>
  )
}
