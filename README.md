# AI Image Generator

A modern web application for generating AI images using Hugging Face's Inference API.

## Features

- 🎨 Generate images from text prompts
- 🔄 Multiple AI models with automatic fallback
- 📐 Customizable aspect ratios (1:1, 16:9, 9:16)
- 🎯 Generate 1-4 images at once
- 🌙 Dark/Light theme toggle
- 📱 Responsive design
- ⚡ Real-time loading indicators

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd js
   ```

2. **Get a Hugging Face API Key**
   - Go to [Hugging Face](https://huggingface.co/)
   - Create an account or sign in
   - Go to Settings → Access Tokens
   - Create a new token with "Read" permissions

3. **Configure the API Key**
   - Open `script.js`
   - Replace `YOUR_HUGGING_FACE_API_KEY_HERE` with your actual API key:
   ```javascript
   const API_KEY = "hf_your_actual_api_key_here";
   ```

4. **Open the application**
   - Open `index.html` in your web browser
   - Or serve it using a local server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

## Usage

1. **Enter a prompt** describing the image you want to generate
2. **Select a model** from the dropdown (Stable Diffusion XL is recommended)
3. **Choose image count** (1-4 images)
4. **Select aspect ratio** (Square, Landscape, or Portrait)
5. **Click Generate** and wait for your images!

## Available Models

- **Stable Diffusion XL** (Recommended) - High quality, latest model
- **Stable Diffusion 2.1 Base** - Good quality, reliable
- **Stable Diffusion v1.5** - Classic model
- **OpenJourney v4** - Artistic style
- **Dreamlike Diffusion** - Creative variations

## Troubleshooting

- **404 Errors**: The app automatically tries fallback models if the selected one isn't available
- **API Key Issues**: Make sure your Hugging Face API key is valid and has read permissions
- **Slow Generation**: Some models take longer than others. The app shows loading indicators

## Security Note

Never commit your actual API key to version control. The repository includes a placeholder that you should replace with your own key.

## License

This project is open source and available under the MIT License.
