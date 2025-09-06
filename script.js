const themeToggle = document.querySelector(".theme-toggle");
const promtForm = document.querySelector(".promt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const galleryGrid = document.querySelector(".gallery-grid");
 

const API_KEY = "YOUR-HUGGING-FACE-API-KEY"; // Replace with your actual API key


const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
];

// set theme based on saved theme or system preference
(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

   const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
   document.body.classList.toggle("dark-theme", isDarkTheme);
   themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
   localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    }
)();

// Theme toggle
themeToggle.addEventListener("click", () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
});

// fill prompt input with a random example prompt
promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
});

// get image size based on ratio
const getImageSize = (ratio, baseSize = 512) => {
    const [width, height] = ratio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    // ensure dimensions are multiples of 16 (AI model requires this)
    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

    return {width: calculatedWidth, height: calculatedHeight};
}

// replace the loading card with the generated image
const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`)

    if (!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = `  <img src="${imgUrl}" class="img-result">
                        <div class="img-overlay">
                            <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>`
}

// Send request to hugging face API
const generateImage = async (model, count, ratio, promptText) => {
    // Fallback models in case the selected one doesn't work
    const fallbackModels = [
        model, // Try the selected model first
        'stabilityai/stable-diffusion-xl-base-1.0', // Known working model
        'stabilityai/stable-diffusion-2-1-base', // Alternative working model
        'runwayml/stable-diffusion-v1-5' // Another alternative
    ];
    
    const {width, height} = getImageSize(ratio);

    console.log(`Generating image with model: ${model}`);
    console.log(`Request body:`, {
        inputs: promptText,
        parameters: { width, height, num_inference_steps: 20 }
    });

    // create an array of promises to generate images
    const imagePromises = Array.from({length: count}, async(_, i) => {
        try {
            // Try each model until one works
            let response;
            let lastError;
            
            for (const currentModel of fallbackModels) {
                const MODEL_API_URL = `https://api-inference.huggingface.co/models/${currentModel}`;
                
                try {
                    console.log(`Trying model: ${currentModel}`);
                    response = await fetch(MODEL_API_URL, {
                        headers: {
                            Authorization: `Bearer ${API_KEY}`,
                            "Content-Type": "application/json"
                        },
                        method: "POST",
                        body: JSON.stringify({
                            inputs: promptText,
                            parameters: {
                                width: width,
                                height: height,
                                num_inference_steps: 20
                            }
                        })
                    });
                    
                    if (response.ok) {
                        console.log(`Success with model: ${currentModel}`);
                        break;
                    } else {
                        console.log(`Failed with model: ${currentModel}, status: ${response.status}`);
                    }
                } catch (error) {
                    console.log(`Error with model: ${currentModel}`, error.message);
                    lastError = error;
                }
            }
            
            if (!response || !response.ok) {
                const triedModels = fallbackModels.join(', ');
                throw new Error(`All models failed. Tried: ${triedModels}. Last error: ${lastError?.message || 'Unknown error'}`);
            }
        
            //Convert response to an image URL and update the image card
            const result = await response.blob();
            updateImageCard(i, URL.createObjectURL(result));
        } catch (error) {
            console.error("Error generating image:", error);
        }
    });

    const images = await Promise.all(imagePromises);
    return images;
};


// create placeholder cards with loading spinners
const createImageCard = (model, count, ratio, promptText) => {
    galleryGrid.innerHTML = "";

    for (let i = 0; i < count; i++) {
        galleryGrid.innerHTML += `
    <div class="img-card loading" id="img-card-${i}">
        <div class="status-container">
            <div class="spinner"></div>
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p class="status-text">Generating...</p>
        </div>
    </div>`;
    }

    // Set aspect ratio using JavaScript after creating elements
    const cards = galleryGrid.querySelectorAll('.img-card');
    cards.forEach(card => {
        card.style.aspectRatio = ratio;
    });

    generateImage(model, count, ratio, promptText);
}

// handle form submission
promtForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get form data
    const model = modelSelect.value;
    const count = parseInt(countSelect.value) || 1;
    const ratio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();
    createImageCard(model, count, ratio, promptText);
});
