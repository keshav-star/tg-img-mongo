import React, { useState, useEffect, useCallback, useRef } from "react";
import CreatableSelect from "react-select/creatable";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { message } from "antd";

const SendImage = () => {
  const channelName = useRef();
  const [imageFile, setImageFile] = useState([]);

  const [folder, setFolder] = useState("");
  const [category, setCategory] = useState("");
  const [caption, setcaption] = useState("");
  const [resetKey, setResetKey] = useState(true);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [folderOptions, setFolderOptions] = useState([]);
  const [tags, setTags] = useState([]);

  const handleTags = (addedTags) => {
    const arr = addedTags.map((item) => item.value);
    setTags(arr);
  };

  const fetchedFolderOptions = folderOptions.map((key) => {
    return { value: key, label: key };
  });
  const fetchedCategoryOptions = categoryOptions.map((key) => {
    return { value: key, label: key };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFile.length === 0) {
      message.warning("Please select an image");
      return;
    } else if (folder === "") {
      message.warning("Please enter folder");
      return;
    } else if (category === "") {
      message.warning("Please enter name");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("category", category);
    formData.append("folder", folder);
    formData.append("channelName", channelName.current.value);
    imageFile.forEach((file) => {
      formData.append(`image`, file);
    });
    tags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });
    try {
      const response = await axios.post(`/bot/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        // setFolder("");
        // setcaption("");
        // setCategory("");
        // setImageFile([]);
        // setTags([]);
        setResetKey((prevResetKey) => !prevResetKey);
        message.success("Image Saved Successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setImageFile((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  useEffect(() => {
    axios.get(`/bot/all-documents/animes`).then((response) => {
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
            <div
              className={`text-[2vw] ${
                isDragActive
                  ? "absolute w-[100vw] h-[100vh] bg-blue-400 bg-opacity-50 top-0 left-0"
                  : "hidden"
              }`}
            >
              Drag and drop your images here.
            </div>
          </div>
          <button onClick={() => setImageFile([])}>Clear</button>
          {imageFile.length === 1 && (
            <img
              className=""
              src={URL.createObjectURL(imageFile[0])}
              alt="abc"
            />
          )}
        </div>

        <div className=" me-32 w-[20vw]">
          <h2 className="text-[1.8vw] font-semibold text-center mb-10">
            Image Details
          </h2>
          <CreatableSelect
            key={`${resetKey}-folder`}
            isClearable
            className=""
            placeholder="Select Folder"
            options={fetchedFolderOptions}
            onChange={(e) => (e ? setFolder(e.value) : setFolder(null))}
          />
          <CreatableSelect
            key={`${resetKey}-category`}
            isClearable
            className="my-5"
            placeholder="Select Category"
            options={fetchedCategoryOptions}
            onChange={(e) => (e ? setCategory(e.value) : setCategory(null))}
          />

          <input
            className="border-2 w-[20vw] my-5 p-2 rounded block"
            type="text"
            name="caption"
            placeholder="Enter Caption"
            value={caption}
            onChange={(e) => setcaption(e.target.value)}
          />

          <select
            ref={channelName}
            className="border-2 w-[20vw] my-5 p-2 rounded block bg-white text-gray-400 "
          >
            <option value="">Select Channel Name</option>
            <option value="mitsuri">Mitsuri</option>
            <option value="ecchi">Ecchi</option>
            <option value="waifus">Waifus</option>
            <option value="store">Image Store</option>
          </select>

          <CreatableSelect
            key={`${resetKey}-tags`}
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
        {imageFile &&
          imageFile.length > 1 &&
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
