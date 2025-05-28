import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { usePayment, useHandlePay, useCommissionById } from "../hooks/useShop";

export default function PaymentPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const commissionId = params.commissionId;

  const {
    cart, loading,
    address, setAddress,
    phone, setPhone,
    payment, setPayment,
    addressModal, setAddressModal,
    phoneModal, setPhoneModal,
    paymentModal, setPaymentModal,
    tempAddress, setTempAddress,
    tempPhone, setTempPhone,
    tempPayment, setTempPayment,
    cardNumber, setCardNumber,
    cardHolder, setCardHolder,
    cardExpiry, setCardExpiry,
    cardCVV, setCardCVV,
    PROTECTION_FEE,
    SHIPPING,
    SHIPPING_DISCOUNT,
    orderTotal,
    totalToPay,
    saveAddress,
    savePhone,
    savePayment,
  } = usePayment();

  const { commission, loadingCommission } = useCommissionById(commissionId);

  const handlePay = useHandlePay({
    cart,
    address,
    phone,
    payment,
    totalToPay,
    commissionId,
    commission,
  });

  if (loadingCommission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007b7f" />
      </View>
    );
  }

  if (commissionId && commission) {
    const commissionPrice = commission.price || 0;
    const PROTECTION_FEE = 0.99;
    const SHIPPING = 3.99;
    const SHIPPING_DISCOUNT = commissionPrice > 30 ? SHIPPING : 0;
    const orderTotal = commissionPrice;
    const totalToPay = orderTotal + PROTECTION_FEE + SHIPPING - SHIPPING_DISCOUNT;

    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Resumen de tu pedido</Text>
        <View style={styles.summaryCard}>
          <SummaryRow label="Pedido" value={`${orderTotal.toFixed(2)} €`} />
          <SummaryRow label="Tasa de protección" value={`${PROTECTION_FEE.toFixed(2)} €`} />
          <SummaryRow label="Envío" value={`${SHIPPING.toFixed(2)} €`} />
          <SummaryRow label="Envío (Gratis)" value={`-${SHIPPING_DISCOUNT.toFixed(2)} €`} green />
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total a pagar</Text>
            <Text style={styles.summaryTotalValue}>{totalToPay.toFixed(2)} €</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Comisión</Text>
        <View style={styles.productCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>Tipo: {commission.type}</Text>
            <Text style={styles.productDesc}>Nº personajes: {commission.num_characters}</Text>
            <Text style={styles.productDesc}>Tamaño: {commission.size}</Text>
            <Text style={styles.productDesc}>Descripción: {commission.description}</Text>
            <Text style={styles.productDesc}>Estado: {commission.status}</Text>
          </View>
          <Text style={styles.productPrice}>{commissionPrice.toFixed(2)} €</Text>
        </View>

        <Text style={styles.sectionTitle}>Dirección</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoBold}>{address.name}</Text>
          <Text>{address.street}</Text>
          <Text>{address.postal}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => {
            setTempAddress(address);
            setAddressModal(true);
          }}>
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Tipo de entrega</Text>
        <View style={styles.infoCard}>
          <Text>📍 En punto de recogida (Gratis)</Text>
          <Text style={{ color: "#888" }}>En el punto de recogida en 2 - 5 días laborables</Text>
        </View>

        <Text style={styles.sectionTitle}>Datos de contacto</Text>
        <View style={styles.infoCard}>
          <Text>{phone}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => {
            setTempPhone(phone);
            setPhoneModal(true);
          }}>
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Método de pago</Text>
        <View style={styles.infoCard}>
          {/* Selector de métodos */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              payment.type === "card" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPayment({ type: "card", label: payment.label || "💳 Tarjeta de crédito" })}
          >
            <Text style={styles.paymentOptionText}>💳 Tarjeta de crédito</Text>
            {payment.type === "card" && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setCardNumber("");
                  setCardHolder("");
                  setCardExpiry("");
                  setCardCVV("");
                  setPaymentModal(true);
                }}
              >
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              payment.type === "paypal" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPayment({ type: "paypal", label: "🟦 PayPal" })}
          >
            <Text style={styles.paymentOptionText}>🟦 PayPal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              payment.type === "apple" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPayment({ type: "apple", label: " Apple Pay" })}
          >
            <Text style={styles.paymentOptionText}> Apple Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              payment.type === "kofi" && styles.paymentOptionSelected,
            ]}
            onPress={() => setPayment({ type: "kofi", label: "☕ Ko-Fi" })}
          >
            <Text style={styles.paymentOptionText}>☕ Ko-Fi</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 10, color: "#007b7f", fontWeight: "bold" }}>
            {payment.label}
          </Text>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
          <Text style={styles.payBtnText}>Pagar {totalToPay.toFixed(2)} €</Text>
        </TouchableOpacity>

        {/* MODALS (puedes dejar los mismos que ya tienes abajo) */}
        <Modal visible={addressModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar dirección</Text>
              <TextInput
                style={styles.input}
                value={tempAddress.name}
                onChangeText={text => setTempAddress({ ...tempAddress, name: text })}
                placeholder="Nombre"
              />
              <TextInput
                style={styles.input}
                value={tempAddress.street}
                onChangeText={text => setTempAddress({ ...tempAddress, street: text })}
                placeholder="Calle"
              />
              <TextInput
                style={styles.input}
                value={tempAddress.postal}
                onChangeText={text => setTempAddress({ ...tempAddress, postal: text })}
                placeholder="Código postal y ciudad"
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity onPress={() => setAddressModal(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveAddress} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={phoneModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar teléfono</Text>
              <TextInput
                style={styles.input}
                value={tempPhone}
                onChangeText={setTempPhone}
                placeholder="Teléfono"
                keyboardType="phone-pad"
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity onPress={() => setPhoneModal(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={savePhone} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={paymentModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar tarjeta</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="Número de tarjeta"
                keyboardType="number-pad"
                maxLength={19}
              />
              <TextInput
                style={styles.input}
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="Titular"
                autoCapitalize="words"
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  placeholder="MM/AA"
                  maxLength={5}
                  keyboardType="number-pad"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={cardCVV}
                  onChangeText={setCardCVV}
                  placeholder="CVV"
                  maxLength={4}
                  keyboardType="number-pad"
                  secureTextEntry
                />
              </View>
              <View style={styles.modalBtnRow}>
                <TouchableOpacity onPress={() => setPaymentModal(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (!cardNumber || !cardHolder || !cardExpiry || !cardCVV) {
                      Alert.alert("Completa todos los campos de la tarjeta");
                      return;
                    }
                    setPayment({
                      type: "card",
                      label: `💳 ${cardNumber.startsWith("4") ? "Visa" : "Tarjeta"} terminada en ${cardNumber.slice(-4)}`
                    });
                    setPaymentModal(false);
                  }}
                  style={styles.saveBtn}
                >
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007b7f" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Resumen de tu pedido</Text>
      <View style={styles.summaryCard}>
        <SummaryRow label="Pedido" value={`${orderTotal.toFixed(2)} €`} />
        <SummaryRow label="Tasa de protección" value={`${PROTECTION_FEE.toFixed(2)} €`} />
        <SummaryRow label="Envío" value={`${SHIPPING.toFixed(2)} €`} />
        <SummaryRow label="Envío (Gratis)" value={`-${SHIPPING_DISCOUNT.toFixed(2)} €`} green />
        <View style={styles.summaryTotalRow}>
          <Text style={styles.summaryTotalLabel}>Total a pagar</Text>
          <Text style={styles.summaryTotalValue}>{totalToPay.toFixed(2)} €</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Productos</Text>
      {cart.length === 0 ? (
        <Text style={styles.empty}>No hay productos en el carrito.</Text>
      ) : (
        cart.map(item => (
          <View style={styles.productCard} key={item.id}>
            <Image
              source={{ uri: item.product?.product_url || "https://via.placeholder.com/100" }}
              style={styles.productImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.product?.name}</Text>
              <Text style={styles.productDesc} numberOfLines={2}>{item.product?.description}</Text>
              <Text style={styles.productQty}>Cantidad: {item.quantity}</Text>
            </View>
            <Text style={styles.productPrice}>{(item.product?.price || 0).toFixed(2)} €</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Dirección</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoBold}>{address.name}</Text>
        <Text>{address.street}</Text>
        <Text>{address.postal}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => {
          setTempAddress(address);
          setAddressModal(true);
        }}>
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Tipo de entrega</Text>
      <View style={styles.infoCard}>
        <Text>📍 En punto de recogida (Gratis)</Text>
        <Text style={{ color: "#888" }}>En el punto de recogida en 2 - 5 días laborables</Text>
      </View>

      <Text style={styles.sectionTitle}>Datos de contacto</Text>
      <View style={styles.infoCard}>
        <Text>{phone}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => {
          setTempPhone(phone);
          setPhoneModal(true);
        }}>
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Método de pago</Text>
      <View style={styles.infoCard}>
        {/* Selector de métodos */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            payment.type === "card" && styles.paymentOptionSelected,
          ]}
          onPress={() => setPayment({ type: "card", label: payment.label || "💳 Tarjeta de crédito" })}
        >
          <Text style={styles.paymentOptionText}>💳 Tarjeta de crédito</Text>
          {payment.type === "card" && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                setCardNumber("");
                setCardHolder("");
                setCardExpiry("");
                setCardCVV("");
                setPaymentModal(true);
              }}
            >
              <Text style={styles.editBtnText}>Editar</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            payment.type === "paypal" && styles.paymentOptionSelected,
          ]}
          onPress={() => setPayment({ type: "paypal", label: "🟦 PayPal" })}
        >
          <Text style={styles.paymentOptionText}>🟦 PayPal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            payment.type === "apple" && styles.paymentOptionSelected,
          ]}
          onPress={() => setPayment({ type: "apple", label: " Apple Pay" })}
        >
          <Text style={styles.paymentOptionText}> Apple Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            payment.type === "kofi" && styles.paymentOptionSelected,
          ]}
          onPress={() => setPayment({ type: "kofi", label: "☕ Ko-Fi" })}
        >
          <Text style={styles.paymentOptionText}>☕ Ko-Fi</Text>
        </TouchableOpacity>
        <Text style={{ marginTop: 10, color: "#007b7f", fontWeight: "bold" }}>
          {payment.label}
        </Text>
      </View>

      <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
        <Text style={styles.payBtnText}>Pagar {totalToPay.toFixed(2)} €</Text>
      </TouchableOpacity>

      {/* MODALS */}
      <Modal visible={addressModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar dirección</Text>
            <TextInput
              style={styles.input}
              value={tempAddress.name}
              onChangeText={text => setTempAddress({ ...tempAddress, name: text })}
              placeholder="Nombre"
            />
            <TextInput
              style={styles.input}
              value={tempAddress.street}
              onChangeText={text => setTempAddress({ ...tempAddress, street: text })}
              placeholder="Calle"
            />
            <TextInput
              style={styles.input}
              value={tempAddress.postal}
              onChangeText={text => setTempAddress({ ...tempAddress, postal: text })}
              placeholder="Código postal y ciudad"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setAddressModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveAddress} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={phoneModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar teléfono</Text>
            <TextInput
              style={styles.input}
              value={tempPhone}
              onChangeText={setTempPhone}
              placeholder="Teléfono"
              keyboardType="phone-pad"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setPhoneModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={savePhone} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={paymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar tarjeta</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="Número de tarjeta"
              keyboardType="number-pad"
              maxLength={19}
            />
            <TextInput
              style={styles.input}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="Titular"
              autoCapitalize="words"
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={cardExpiry}
                onChangeText={setCardExpiry}
                placeholder="MM/AA"
                maxLength={5}
                keyboardType="number-pad"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={cardCVV}
                onChangeText={setCardCVV}
                placeholder="CVV"
                maxLength={4}
                keyboardType="number-pad"
                secureTextEntry
              />
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setPaymentModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!cardNumber || !cardHolder || !cardExpiry || !cardCVV) {
                    Alert.alert("Completa todos los campos de la tarjeta");
                    return;
                  }
                  setPayment({
                    type: "card",
                    label: `💳 ${cardNumber.startsWith("4") ? "Visa" : "Tarjeta"} terminada en ${cardNumber.slice(-4)}`
                  });
                  setPaymentModal(false);
                }}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function SummaryRow({ label, value, green }) {
  return (
    <View style={[styles.summaryRow, green && { color: "#2ecc71" }]}>
      <Text style={[styles.summaryLabel, green && { color: "#2ecc71" }]}>{label}</Text>
      <Text style={[styles.summaryValue, green && { color: "#2ecc71" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafd",
    padding: 18,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 18,
    alignSelf: "center",
    color: "#222",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#444",
  },
  summaryValue: {
    fontSize: 16,
    color: "#444",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007b7f",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 18,
    marginBottom: 8,
    color: "#222",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  productDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  productQty: {
    fontSize: 14,
    color: "#888",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007b7f",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  infoBold: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
    color: "#222",
  },
  payBtn: {
    backgroundColor: "#007b7f",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 30,
    elevation: 2,
  },
  payBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  empty: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  editBtn: {
    marginTop: 8,
    alignSelf: "flex-end",
    backgroundColor: "#e0f7fa",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    color: "#007b7f",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 18,
    color: "#222",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  cancelBtn: {
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  cancelBtnText: {
    color: "#888",
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#007b7f",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  paymentOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7f9fc",
    marginBottom: 10,
  },
  paymentOptionSelected: {
    backgroundColor: "#e0f7fa",
    borderWidth: 1,
    borderColor: "#007b7f",
  },
  paymentOptionText: {
    fontSize: 16,
    color: "#007b7f",
    fontWeight: "500",
  },
});