import React from "react";
import { Button, Container } from "@mui/material";
import { useEffect, useState } from "react";

const imageTypeRegex = /text.*/;
export default function TestFile() {
  const [imageFiles, setImageFiles] = useState([]);
  const [images, setImages] = useState([]);

  const changeHandler = (e) => {
    const { files } = e.target;
    const validImageFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.match(imageTypeRegex)) {
        validImageFiles.push(file);
      }
    }
    if (validImageFiles.length) {
      setImageFiles(validImageFiles);
      console.log(validImageFiles)
      return;
    }
    alert("Selected images are not of valid type!");
  };

  useEffect(() => {
    const images = [], fileReaders = [];
    let isCancel = false;
    if (imageFiles.length) {
      imageFiles.forEach((file) => {
        const fileReader = new FileReader();
        fileReaders.push(fileReader);
        fileReader.onload = (e) => {
          const { result } = e.target;
          if (result) {
            images.push(result)
          }
          if (images.length === imageFiles.length && !isCancel) {
            setImages(images);
            console.log(images)
          }
        }
        fileReader.readAsText(file);
      })
    };
    return () => {
      isCancel = true;
      fileReaders.forEach(fileReader => {
        if (fileReader.readyState === 1) {
          fileReader.abort()
        }
      })
    }
  }, [imageFiles]);

  return (
    <Container fixed className="testfilepage">
      <form>
        <p>
          <label htmlFor="file">Upload images</label>
          <input
            type="file"
            id="file"
            onChange={changeHandler}
            accept="*/txt"
            multiple
          />
        </p>
      </form>
      {images.length > 0 ? (
        <div>
          {images.map((image, idx) => {
            return (
              <p key={idx}>
                {" "}
                <h4>fichier Numero :{idx+1}</h4>
                <p>{image}</p>
              </p>
            );
          })}
        </div>
      ) : null}
    </Container>
  );
}
