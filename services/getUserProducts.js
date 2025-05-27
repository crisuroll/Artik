import { supabase } from "../supabase/supabaseClient";

export const loadUserProducts = async (userId) => {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        stock,
        product_url,
        created_at
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return products || [];
  } catch (err) {
    console.error("Error al cargar los productos del usuario:", err.message);
    return [];
  }
};