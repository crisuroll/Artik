import { supabase } from '../supabase/supabaseClient';

export async function addToCart({ userId, productId, quantity = 1 }) {
  const { data: existingItem, error: fetchError } = await supabase
    .from('cart')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching cart item:', fetchError);
    throw fetchError;
  }

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity: newQuantity })
      .eq('id', existingItem.id)
      .select();

    if (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from('cart')
      .insert([{ user_id: userId, product_id: productId, quantity }])
      .select();

    if (error) {
      console.error('Error inserting new cart item:', error);
      throw error;
    }
    return data;
  }
}

export async function getCart(userId) {
  const { data, error } = await supabase
    .from('cart')
    .select('id, product_id, quantity, product:product_id(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function removeFromCart(cartItemId) {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', cartItemId);
  if (error) throw error;
}