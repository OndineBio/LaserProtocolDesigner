import {Button} from "@material-ui/core";
import React, {FC} from "react";
import FileSaver from "file-saver";
import {buildPythonProtocolForExport, BuildPythonProtocolOptions} from "../pythonConversion";

interface DownloadButtonProps {
  fileOptions:BuildPythonProtocolOptions
}

export const DownloadButton: FC<DownloadButtonProps> = ({fileOptions, children}) => {
  const onDownload = () => {
    const file = buildPythonProtocolForExport(fileOptions)
    const blob = new Blob([file], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "protocol.py");
  }

  return <Button onClick={() => {
    onDownload()
  }} variant={"outlined"} size={"medium"} color="inherit">{children}</Button>
}