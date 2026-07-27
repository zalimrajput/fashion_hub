import google.generativeai as genai

genai.configure(api_key="YOUR_GEMINI_API_KEY")

for model in genai.list_models():
    print(model.name)