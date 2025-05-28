import { useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../supabase/supabaseClient";
import { loadUser } from "../services/usersService";
import {
  fetchCommissionTab,
  createCommission,
  fetchArtistUsername,
  sendCommissionMessage,
  fetchUserCommission,
  saveUserCommission,
} from "../services/shopService";
import { getCart } from "../services/cart";

export function useCommission(artistId, userId, router) {
  const [commissionTab, setCommissionTab] = useState(null);

  const loadCommissionTab = useCallback(async () => {
    if (!artistId) return setCommissionTab(null);
    const data = await fetchCommissionTab(artistId);
    console.log("fetchCommissionTab result", data);
    setCommissionTab(data);
  }, [artistId]);

  const handleSendOffer = useCallback(
    async ({ type, numCharacters, size, userDescription }) => {
      if (!userDescription.trim()) {
        Alert.alert("Agrega una descripción");
        return;
      }
      try {
        const newCommission = await createCommission({
          userId,
          artistId,
          type,
          numCharacters,
          size,
          description: userDescription,
        });

        const artistUsername = await fetchArtistUsername(artistId);

        await sendCommissionMessage({
          userId,
          artistId,
          content: userDescription,
        });

        router.push(`/dm/${artistUsername}?commission=1`);
      } catch (e) {
        Alert.alert("No se pudo crear la comisión o enviar el mensaje.");
      }
    },
    [artistId, userId, router]
  );

  return { commissionTab, loadCommissionTab, handleSendOffer };
}

export function useEditCommission() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [commissionId, setCommissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [typeOptions, setTypeOptions] = useState([]);
  const [numCharactersOptions, setNumCharactersOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);

  const fetchCommission = useCallback(async () => {
    setLoading(true);
    const user = await loadUser();
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const commission = await fetchUserCommission(user.userId);
      if (commission) {
        setTitle(commission.title || "");
        setDescription(commission.description || "");
        setImageUrl(commission.comm_url || null);
        setCommissionId(commission.id);
        setTypeOptions(commission.type_options || []);
        setNumCharactersOptions(commission.num_characters_options || []);
        setSizeOptions(commission.size_options || []);
      } else {
        setTitle("");
        setDescription("");
        setImageUrl(null);
        setCommissionId(null);
        setTypeOptions([]);
        setNumCharactersOptions([]);
        setSizeOptions([]);
      }
    } catch (e) {
      // Silenciar error
    }
    setLoading(false);
  }, []);

  const handleSave = useCallback(
    async (router) => {
      setUploading(true);
      const user = await loadUser();
      try {
        await saveUserCommission({
          userId: user.userId,
          title,
          description,
          imageUrl,
          type_options: typeOptions,
          num_characters_options: numCharactersOptions,
          size_options: sizeOptions,
        });
        router.back();
      } catch (e) {
        // Silenciar error
      }
      setUploading(false);
    },
    [title, description, imageUrl, typeOptions, numCharactersOptions, sizeOptions]
  );

  return {
    title,
    setTitle,
    description,
    setDescription,
    imageUrl,
    setImageUrl,
    commissionId,
    loading,
    uploading,
    setUploading,
    fetchCommission,
    handleSave,
    typeOptions,
    setTypeOptions,
    numCharactersOptions,
    setNumCharactersOptions,
    sizeOptions,
    setSizeOptions,
  };
}

export function usePayment() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [address, setAddress] = useState({
    name: "",
    street: "",
    postal: "",
  });
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState({ type: "", label: "" });

  const [addressModal, setAddressModal] = useState(false);
  const [phoneModal, setPhoneModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  const [tempAddress, setTempAddress] = useState(address);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempPayment, setTempPayment] = useState(payment);

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  const PROTECTION_FEE = 2.45;
  const SHIPPING = 2.59;
  const SHIPPING_DISCOUNT = 2.59;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCart([]);
        setLoading(false);
        return;
      }
      const items = await getCart(user.id);
      setCart(items);

      const { data: userData, error } = await supabase
        .from("users")
        .select("username, nickname, address, phone")
        .eq("id", user.id)
        .single();

      if (userData) {
        setAddress({
          name: userData.nickname || userData.username || "",
          street: userData.address?.street || "",
          postal: userData.address?.postal || "",
        });
        setPhone(userData.phone || "");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const orderTotal = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const totalToPay = orderTotal + PROTECTION_FEE + SHIPPING - SHIPPING_DISCOUNT;

  const saveAddress = () => {
    setAddress(tempAddress);
    setAddressModal(false);
  };
  const savePhone = () => {
    setPhone(tempPhone);
    setPhoneModal(false);
  };
  const savePayment = () => {
    setPayment(tempPayment);
    setPaymentModal(false);
  };

  const removeFromCart = async (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    await supabase.from("cart").delete().eq("id", id);
  };

  return {
    cart,
    loading,
    address,
    setAddress,
    phone,
    setPhone,
    payment,
    setPayment,
    addressModal,
    setAddressModal,
    phoneModal,
    setPhoneModal,
    paymentModal,
    setPaymentModal,
    tempAddress,
    setTempAddress,
    tempPhone,
    setTempPhone,
    tempPayment,
    setTempPayment,
    cardNumber,
    setCardNumber,
    cardHolder,
    setCardHolder,
    cardExpiry,
    setCardExpiry,
    cardCVV,
    setCardCVV,
    PROTECTION_FEE,
    SHIPPING,
    SHIPPING_DISCOUNT,
    orderTotal,
    totalToPay,
    saveAddress,
    savePhone,
    savePayment,
    removeFromCart,
  };
}

// Hook para cargar comisión por ID
export function useCommissionById(commissionId) {
  const [commission, setCommission] = useState(null);
  const [loadingCommission, setLoadingCommission] = useState(!!commissionId);

  useEffect(() => {
    if (commissionId) {
      setLoadingCommission(true);
      supabase
        .from("commissions")
        .select("*")
        .eq("id", commissionId)
        .single()
        .then(({ data }) => {
          setCommission(data);
          setLoadingCommission(false);
        });
    }
  }, [commissionId]);

  return { commission, loadingCommission };
}

// Hook para manejar el pago
export function useHandlePay({
  cart,
  address,
  phone,
  payment,
  totalToPay,
  commissionId,
  commission,
}) {
  const router = useRouter();

  const handlePay = useCallback(async () => {
    const user = await loadUser();
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para comprar.");
      return;
    }

    // Pago de productos del carrito
    if (cart.length > 0) {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: user.userId,
          artist_id: cart[0]?.product?.user_id || null,
          is_commission_related: false,
          commission_id: null,
          total: totalToPay,
          address: `${address.name}, ${address.street}, ${address.postal}`,
          phone: phone,
          payment_method: payment.type,
          status: "pending"
        }])
        .select()
        .single();

      if (orderError) {
        Alert.alert("Error", "No se pudo guardar el pedido.");
        return;
      }

      const itemsToInsert = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        commission_id: null,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);

      if (itemsError) {
        Alert.alert("Error", "No se pudieron guardar los productos del pedido.");
        return;
      }

      Alert.alert("Pago realizado", "¡Gracias por tu compra!");
      router.replace("/");
      return;
    }

    // Pago de comisión
    if (commissionId && commission) {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: user.userId,
          artist_id: commission.artist_id,
          is_commission_related: true,
          commission_id: commission.id,
          total: totalToPay,
          address: `${address.name}, ${address.street}, ${address.postal}`,
          phone: phone,
          payment_method: payment.type,
          status: "pending"
        }])
        .select()
        .single();

      if (orderError) {
        Alert.alert("Error", "No se pudo guardar el pedido.");
        return;
      }

      const { error: itemError } = await supabase.from("order_items").insert([{
        order_id: orderData.id,
        product_id: null,
        commission_id: commission.id,
        quantity: 1,
        price: commission.price
      }]);

      if (itemError) {
        Alert.alert("Error", "No se pudo guardar la comisión en el pedido.");
        return;
      }

      Alert.alert("Pago realizado", "¡Gracias por tu compra!");
      router.replace("/");
      return;
    }
  }, [cart, address, phone, payment, totalToPay, commissionId, commission, router]);

  return handlePay;
}
