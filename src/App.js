import React from "react";
import "./App.css";
import SendImage from "./components/SendImage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
function App() {
  // const fetchData = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:4000/bot/mongo-fetch");

  //     const imagePromises = response.data.a.map(async (item) => {
  //       const imageResponse = await axios.post(
  //         `https://api.telegram.org/bot${process.env.BOT_ID}/getFile`,
  //         { file_id: item }
  //       );
  //       return imageResponse.data.result.file_path;
  //     });

  //     const imagePaths = await Promise.all(imagePromises);

  //     seta((prev) => [...prev, ...imagePaths]);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SendImage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
