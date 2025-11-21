const BASE_URL = "https://world.openfoodfacts.org";

export interface Product {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  image_front_url?: string;
  nutrition_grades?: string;
  ingredients_text?: string;
  ingredients_n?: number;
  ingredients_tags?: string[];
  additives_n?: number;
  additives_tags?: string[];
  nutriments?: {
    energy_100g?: number;
    fat_100g?: number;
    carbohydrates_100g?: number;
    sugars_100g?: number;
    proteins_100g?: number;
    salt_100g?: number;
    fiber_100g?: number;
    sodium_100g?: number;
    calcium_100g?: number;
    iron_100g?: number;
    vitamins?: string[];
  };
  labels?: string;
  allergens?: string;
  countries?: string;
  countries_tags?: string[];
  origins?: string;
  packaging?: string;
  packaging_tags?: string[];
  quantity?: string;
  serving_size?: string;
  data_quality_tags?: string[];
  completeness?: number;
  created_t?: number;
  // Additional fields for better product information
  brand_owner?: string;
  generic_name?: string;
  origins_tags?: string[];
  traces?: string;
  traces_tags?: string[];
  allergens_tags?: string[];
  ingredients_that_may_be_from_palm_oil_n?: number;
  ingredients_that_may_be_from_palm_oil_tags?: string[];
  ingredients_from_palm_oil_n?: number;
  ingredients_from_palm_oil_tags?: string[];
  nova_group?: number;
  ecoscore_grade?: string;
  ecoscore_score?: number;
}

export interface SearchResponse {
  products: Product[];
  count: number;
  page: number;
  page_size: number;
}

export const searchProducts = async (
  searchTerm: string,
  page: number = 1,
  pageSize: number = 24
): Promise<SearchResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&page=${page}&page_size=${pageSize}&json=true`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getProductByBarcode = async (barcode: string): Promise<{ product: Product }> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with barcode ${barcode}:`, error);
    throw error;
  }
};

export const getProductsByCategory = async (
  category: string,
  page: number = 1
): Promise<SearchResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/category/${encodeURIComponent(category)}/${page}.json`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching products by category ${category}:`, error);
    throw error;
  }
};

export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/categories.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // OpenFoodFacts returns categories under `tags`; map to their ids or names
    const tags = data.tags || [];
    // Prefer `id` (URL-friendly) values; fall back to `name` when needed
    const categories = tags
      .map((t: any) => (t.id ? String(t.id) : String(t.name || "")).toLowerCase())
      .filter(Boolean);
    // Provide a reasonable limit for the UI
    return categories.slice(0, 50);
  } catch (error) {
    // Fallback to popular categories on failure
    console.error("Failed to fetch categories, using fallback list", error);
    return [
      "beverages",
      "snacks",
      "dairy",
      "breakfast",
      "fruits",
      "vegetables",
      "meat",
      "seafood",
      "bakery",
      "desserts",
    ];
  }
};
