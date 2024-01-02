import React, { useState, useEffect, useCallback } from "react";
import CreatableSelect from "react-select/creatable";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { message } from "antd";

const SendImage = () => {
  const [imageFile, setImageFile] = useState([]);

  const [folder, setFolder] = useState("animes");
  const [category, setCategory] = useState("");
  const [caption, setcaption] = useState("");

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [folderOptions, setFolderOptions] = useState([]);
  const [tags, setTags] = useState([]);

  const handleTags = (addedTags) => {
    addedTags.map((item) => setTags([...tags, item.value]));
  };

  const fetchedFolderOptions = folderOptions.map((key) => {
    return { value: key, label: key };
  });
  const fetchedCategoryOptions = categoryOptions.map((key) => {
    return { value: key, label: key };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      message.warning("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("category", category);
    formData.append("folder", folder);
    imageFile.forEach((file) => {
      formData.append(`image`, file);
    });
    tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });

    try {
      const response = await axios.post(
        `/bot/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        setFolder('')
        setcaption('')
        setCategory('')
        setImageFile([])
        setTags([])
        message.success("Image Saved Successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setImageFile(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  useEffect(() => {
    axios
      .get(`/bot/all-documents/animes`)
      .then((response) => {
        setCategoryOptions(response.data.waifus);
      });
  }, []);

  useEffect(() => {
    axios.get("/bot/all-folders").then((response) => {
      setFolderOptions(response.data);
    });
  }, []);

  return (
    <div>
      <h2 className="text-[2vw] bg-green-100 font-medium text-center p-2 py-4 text-blue-500">
        Telegram Image Saver to MongoDB
      </h2>
      <div className="p-20 bg-slate-50 flex justify-between">
        <div className="flex items-center">
          <div
            className="drop-zone shadow-xl p-5 m-5 bg-blue-200"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <div className="text-[2vw]">Drag and drop your images here.</div>
          </div>
          {imageFile.length === 1 && (
            <img className="" src={URL.createObjectURL(imageFile[0])} alt="abc" />
          )}
        </div>

        <div className=" me-32 w-[20vw]">
          <h2 className="text-[1.8vw] font-semibold text-center mb-10">
            Image Details
          </h2>
          <CreatableSelect
            isClearable
            className=""
            placeholder="Select Folder"
            options={fetchedFolderOptions}
            onChange={(e) => setFolder(e.value)}
          />
          <CreatableSelect
            isClearable
            className="my-5"
            placeholder="Select Category"
            options={fetchedCategoryOptions}
            onChange={(e) => setCategory(e.value)}
          />

          <input
            className="border-2 w-[20vw] my-5 p-2 rounded block"
            type="text"
            name="caption"
            placeholder="Enter Caption"
            value={caption}
            onChange={(e) => setcaption(e.target.value)}
          />

          <CreatableSelect
            isMulti
            onChange={handleTags}
            placeholder="Add Tags"
          />
          <button
            className="rounded-[10px] w-[12vw] text-lg text-white px-3 py-2 my-4 bg-gray-500 hover:bg-gray-600"
            onClick={(e) => handleSubmit(e)}
          >
            Send
          </button>
        </div>
      </div>
      <div className="flex justify-center flex-wrap">
        {imageFile && imageFile.length > 1 &&
          imageFile.map((item, index) => {
            return (
              <img
                className=""
                key={index}
                src={URL.createObjectURL(item)}
                alt="abc"
              />
            );
          })}
      </div>
    </div>
  );
};

export default SendImage;
