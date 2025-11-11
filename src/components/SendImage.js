import React, { useState, useEffect, useCallback, useRef } from "react";
import CreatableSelect from "react-select/creatable";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { message } from "antd";

const SendImage = () => {
  const channelName = useRef();
  const [imageFile, setImageFile] = useState([]);

  const [category, setCategory] = useState("");
  const [caption, setcaption] = useState("");
  const [resetKey, setResetKey] = useState(true);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [tags, setTags] = useState([]);

  const handleTags = (addedTags) => {
    const arr = addedTags.map((item) => item.value);
    setTags(arr);
  };

  const fetchedCategoryOptions = categoryOptions.map((key) => {
    return { value: key, label: key };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFile.length === 0) {
      message.warning("Please select an image");
      return;
    } else if (category === "") {
      message.warning("Please enter name");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("category", category);
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

  const handleRemove = (item) => {
    setImageFile((prevFiles) => prevFiles.filter((file) => file !== item));
  };

  useEffect(() => {
    axios.get(`/bot/all-documents/animes`).then((response) => {
      setCategoryOptions(response.data.waifus);
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
          {imageFile.length === 1 && (
            <img
              className=""
              src={URL.createObjectURL(imageFile[0])}
              alt="abc"
            />
          )}
        </div>

        <div className=" me-32 w-[28vw]">
          <div className="flex gap-4">
            <button
              onClick={() => setImageFile([])}
              className="rounded text-sm text-white px-3 py-2 my-4 bg-gray-800 hover:bg-gray-900"
            >
              Clear
            </button>
            <button className="rounded text-sm text-white px-3 py-2 my-4 bg-red-500 hover:bg-red-600">
              Clear All Fields
            </button>
            <button className="rounded text-sm px-3 py-2 my-4 bg-yellow-500 hover:bg-yellow-600">
              Download Images
            </button>
          </div>
          {/* buttons for clear, clear all fields, download images to local */}
          <h2 className="text-[1.8vw] font-semibold text-center mb-10">
            Image Details
          </h2>
          <div className="grid gap-10 grid-cols-2">
            <CreatableSelect
              key={`${resetKey}-category`}
              isClearable
              className="w-[12vw]"
              placeholder="Select Category"
              options={fetchedCategoryOptions}
              onChange={(e) => (e ? setCategory(e.value) : setCategory(null))}
            />

            <select
              ref={channelName}
              className="border-2 w-[12vw] p-2 rounded block bg-white text-gray-400 "
            >
              <option value="">Select Channel Name</option>
              <option value="waifus">Waifus</option>
              <option value="store">Image Store</option>
            </select>
          </div>

          <div className="grid gap-10 grid-cols-2 mt-6">
            <CreatableSelect
              key={`${resetKey}-tags`}
              isMulti
              onChange={handleTags}
              className="w-[12vw]"
              placeholder="Add Tags"
            />
            <input
              className="border-2 w-[12vw] p-2 rounded block"
              type="text"
              name="caption"
              placeholder="Enter Caption"
              value={caption}
              onChange={(e) => setcaption(e.target.value)}
            />
          </div>
          <button
            className="rounded text-sm text-white px-10 py-2 my-4 bg-blue-500 hover:bg-blue-600"
            onClick={(e) => handleSubmit(e)}
          >
            Send
          </button>
          <div className="grid grid-cols-4 gap-4 max-h-40 overflow-y-auto">
            {imageFile &&
              imageFile.length > 1 &&
              imageFile.map((item, index) => {
                return (
                  <img
                    className="w-20 h-fit hover:scale-105 cursor-pointer hover:border-black border-2 transition-all"
                    key={index}
                    src={URL.createObjectURL(item)}
                    onClick={() => handleRemove(item)}
                    alt="abc"
                  />
                );
              })}
          </div>
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
