from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
import openai
import os
import shutil
from pathlib import Path

app = FastAPI()

# Set OpenAI API Key (Make sure it's stored in environment variables)
openai.api_key = os.getenv("OPENAI_API_KEY")

# Create an "uploads" folder if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
def home():
    return {"message": "Hello, FastAPI is running!"}

# Image Upload & GPT-4 Vision Analysis
@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    # Save the uploaded image
    file_path = UPLOAD_DIR / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Call GPT-4 Vision for ingredient detection
    ingredients = get_ingredients_from_gpt(file_path)

    return {
        "message": "File received",
        "filename": file.filename,
        "ingredients": ingredients
    }

# Function to Call GPT-4 Vision
def get_ingredients_from_gpt(image_path):
    try:
        with open(image_path, "rb") as image_file:
            response = openai.chat.ChatCompletion.create(
                model="gpt-4-vision-preview",
                messages=[
                    {"role": "system", "content": "You are an AI that detects ingredients in fridge images."},
                    {"role": "user", "content": "What ingredients do you see in this image?"}
                ],
                files=[{"file": image_file.read(), "type": "image/png"}],  # Adjust file type if needed
            )

        # Extract detected ingredients
        ingredients = response["choices"][0]["message"]["content"].split("\n")
        return ingredients

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

# New: Recipe Recommendation Endpoint
class RecipeRequest(BaseModel):
    detected_ingredients: list[str]
    manual_ingredients: list[str]

@app.post("/get-recipes/")
async def get_recipes(request: RecipeRequest):
    # Combine detected and manually added ingredients
    all_ingredients = set(request.detected_ingredients + request.manual_ingredients)

    # Call GPT-4 for recipe suggestions
    prompt = f"Suggest 3 recipes based on these ingredients: {', '.join(all_ingredients)}"

    try:
        response = openai.chat.completions.create(  # Correct method for OpenAI 1.0+
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an AI that provides creative and easy-to-follow recipes."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        # Extract the recipe list from OpenAI response
        recipes = response.choices[0].message.content.strip().split("\n")
        return recipes

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recipes: {str(e)}")
