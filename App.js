import React, { useState } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null); // 업로드된 이미지
  const [ingredients, setIngredients] = useState([]); // 감지된 재료
  const [manualIngredient, setManualIngredient] = useState(""); // 직접 입력한 재료
  const [recipes, setRecipes] = useState([]); // 추천된 레시피

  // 📌 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    setImage(event.target.files[0]);
  };

  // 📌 이미지 서버로 전송 & 재료 감지 요청
  const detectIngredients = async () => {
    if (!image) {
      alert("이미지를 업로드하세요!");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload-image/", formData);
      setIngredients(response.data.ingredients);
    } catch (error) {
      console.error("재료 감지 실패", error);
    }
  };

  // 📌 직접 입력한 재료 추가
  const addManualIngredient = () => {
    if (manualIngredient.trim()) {
      setIngredients([...ingredients, manualIngredient]);
      setManualIngredient("");
    }
  };

  // 📌 레시피 추천 요청
  const getRecipes = async () => {
    if (ingredients.length === 0) {
      alert("재료를 입력해주세요!");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/get-recipes/", {
        detected_ingredients: ingredients,
        manual_ingredients: [],
      });

      setRecipes(response.data.recipes);
    } catch (error) {
      console.error("레시피 추천 실패", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      {/* 헤더 */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">🍽 AI 레시피 추천</h1>

      {/* 이미지 업로드 섹션 */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
        <input type="file" onChange={handleImageUpload} accept="image/*" className="mb-4 w-full" />
        <button
          onClick={detectIngredients}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full transition-all"
        >
          📷 재료 분석하기
        </button>
      </div>

      {/* 감지된 재료 리스트 */}
      {ingredients.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-96 mt-6">
          <h2 className="text-xl font-bold mb-3 text-gray-800">🥦 감지된 재료</h2>
          <ul className="space-y-2">
            {ingredients.map((item, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded">{item}</li>
            ))}
          </ul>

          {/* 직접 추가 */}
          <div className="mt-4 flex">
            <input
              type="text"
              placeholder="재료 추가..."
              value={manualIngredient}
              onChange={(e) => setManualIngredient(e.target.value)}
              className="border p-2 flex-grow rounded-l"
            />
            <button onClick={addManualIngredient} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r">
              추가
            </button>
          </div>
        </div>
      )}

      {/* 레시피 추천 버튼 */}
      <button
        onClick={getRecipes}
        className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-all shadow-lg"
      >
        🍳 레시피 추천 받기
      </button>

      {/* 추천된 레시피 출력 */}
      {recipes.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-96 mt-6">
          <h2 className="text-xl font-bold mb-3 text-gray-800">📖 추천된 레시피</h2>
          <ul className="space-y-2">
            {recipes.map((recipe, index) => (
              <li key={index} className="bg-yellow-100 p-2 rounded">{recipe}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
