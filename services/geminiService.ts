
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessProfile, TrendingKeyword, SEOSuggestions, SocialPost } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseKeywords = (text: string): TrendingKeyword[] => {
    const keywords: TrendingKeyword[] = [];
    const lines = text.split('\n').filter(line => line.trim() !== '');
    for (const line of lines) {
        try {
            const keywordMatch = line.match(/KEYWORD:\s*(.*?)\s*\|/);
            const explanationMatch = line.match(/EXPLANATION:\s*(.*?)\s*\|/);
            const scoreMatch = line.match(/SCORE:\s*(\d+)/);

            if (keywordMatch && explanationMatch && scoreMatch) {
                keywords.push({
                    keyword: keywordMatch[1].trim(),
                    explanation: explanationMatch[1].trim(),
                    score: parseInt(scoreMatch[1], 10),
                });
            }
        } catch (e) {
            console.error("Failed to parse line:", line, e);
        }
    }
    if (keywords.length === 0) {
      throw new Error("Could not parse any keywords from the AI response. The format may have changed.");
    }
    return keywords;
};


export const getTrendingKeywords = async (profile: BusinessProfile): Promise<TrendingKeyword[]> => {
    const prompt = `
    Analyze today's internet trends relevant to a business with the following profile:
    - Name: ${profile.name}
    - Description: ${profile.description}
    - Target Audience: ${profile.targetAudience}

    Identify the top 3 trending search keywords or topics. For each, provide a keyword, a brief explanation of its relevance, and a popularity score from 1-100.
    
    IMPORTANT: Format EACH keyword on a new line EXACTLY like this, without any other text, titles, or introductions:
    KEYWORD: [The Keyword] | EXPLANATION: [Brief explanation] | SCORE: [Score from 1-100]
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    return parseKeywords(response.text);
};

export const generateSEOSuggestions = async (profile: BusinessProfile, keywords: TrendingKeyword[]): Promise<SEOSuggestions> => {
    const prompt = `
    For a business named "${profile.name}" that ${profile.description}, targeting ${profile.targetAudience},
    and considering today's trending keywords: ${keywords.map(k => k.keyword).join(', ')}.
    
    Generate SEO content. I need exactly 2 meta descriptions (155-160 characters) and 5 meta keywords.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    metaDescriptions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "An array of 2 SEO-optimized meta descriptions."
                    },
                    metaKeywords: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "An array of 5 relevant meta keywords."
                    }
                },
                required: ["metaDescriptions", "metaKeywords"]
            }
        }
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as SEOSuggestions;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
        },
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
        throw new Error("Image generation failed, no images returned.");
    }

    const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;

    return imageUrl;
};

export const regenerateImagePrompt = async (profile: BusinessProfile, topic: string): Promise<string> => {
    const promptRequest = `
    You are an expert creative director. Your task is to generate a new, fresh, and creative prompt for an AI image generator.
    The image is for a social media post for a business with this profile:
    - Name: ${profile.name}
    - Description: ${profile.description}
    - Target Audience: ${profile.targetAudience}
    
    The topic of the post is "${topic}".
    
    Generate a single, highly detailed image prompt. The prompt should be unique and different from previous ones. It must specify:
    - A clear subject.
    - The setting or background.
    - A specific artistic style (e.g., photorealistic, minimalist, abstract, 3D render, vibrant illustration, cinematic).
    - The mood or atmosphere (e.g., energetic, serene, futuristic, nostalgic, professional).
    - Composition details (e.g., close-up, wide-angle shot, rule of thirds).
    - Lighting (e.g., golden hour, dramatic studio lighting, neon glow).
    
    The goal is to inspire an image that is captivating, artistic, and highly engaging for social media.
    
    Return ONLY the text for the image prompt, with no labels, titles, quotation marks, or any other surrounding text.
    `;

    const promptResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: promptRequest,
    });

    return promptResponse.text.trim();
};


export const createSocialPost = async (profile: BusinessProfile, topic: string): Promise<SocialPost> => {
    const contentPrompt = `
    Create content for a social media post for a business named "${profile.name}" (${profile.description}).
    The post is about this trending topic: "${topic}".
    
    Your response must be a JSON object with four fields: "imagePrompt", "postText", "interactiveQuestion", and "ctaSuggestion".
    
    1.  "imagePrompt": A highly detailed and creative prompt for an AI image generator to create a visually stunning, professional, and unique image. The prompt should specify a clear subject, the setting, the style (e.g., photorealistic, minimalist, abstract, 3D render), the mood (e.g., energetic, serene, futuristic), and composition details (e.g., close-up, wide-angle shot). The goal is to generate an image that is not just descriptive but truly captivating and artistic, suitable for a high-impact social media post.
    2.  "postText": A short, engaging social media post body (around 2-3 sentences). Include 3-5 relevant hashtags at the end.
    3.  "interactiveQuestion": A separate, highly engaging, open-ended question related to the topic that encourages user comments and shares.
    4.  "ctaSuggestion": A short, compelling text for a call-to-action button (e.g., 'Learn More', 'Shop Now', 'Join the Conversation').
    `;

    const contentResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: contentPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    imagePrompt: {
                        type: Type.STRING,
                        description: "A detailed prompt for an AI image generator."
                    },
                    postText: {
                        type: Type.STRING,
                        description: "The social media post text, including hashtags."
                    },
                    interactiveQuestion: {
                        type: Type.STRING,
                        description: "A highly engaging, open-ended question to encourage comments and shares."
                    },
                    ctaSuggestion: {
                        type: Type.STRING,
                        description: "A short, compelling call-to-action for a button, e.g., 'Learn More'."
                    }
                },
                required: ["imagePrompt", "postText", "interactiveQuestion", "ctaSuggestion"]
            }
        }
    });

    const contentJson = JSON.parse(contentResponse.text.trim());
    const { imagePrompt, postText, interactiveQuestion, ctaSuggestion } = contentJson;
    
    const imageUrl = await generateImage(imagePrompt);

    return {
        text: postText,
        interactiveQuestion,
        ctaSuggestion,
        imageUrl,
        imagePrompt,
    };
};
