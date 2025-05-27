import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../supabase/supabaseClient";
import BackButton from "../components/BackButton";
import Dropdown from "../components/Dropdown";

export default function RequestCommission() {
  const { userId, artistId } = useLocalSearchParams();
  const router = useRouter();

  const [commissionTab, setCommissionTab] = useState(null);

  const [type, setType] = useState("");
  const [numCharacters, setNumCharacters] = useState("");
  const [size, setSize] = useState("");
  const [userDescription, setUserDescription] = useState("");

  const typeOptions = [
    { label: "Selecciona tipo...", value: "" },
    { label: "Retrato", value: "retrato" },
    { label: "Medio cuerpo", value: "medio_cuerpo" },
    { label: "Cuerpo entero", value: "cuerpo_entero" },
  ];
  const numCharactersOptions = [
    { label: "Selecciona nº personajes...", value: "" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4+", value: "4+" },
  ];
  const sizeOptions = [
    { label: "Selecciona tamaño...", value: "" },
    { label: "A5", value: "A5" },
    { label: "A4", value: "A4" },
    { label: "A3", value: "A3" },
  ];

  useEffect(() => {
    console.log("artistId recibido:", artistId);
    const fetchCommissionTab = async () => {
      if (!artistId) return;
      const { data } = await supabase
        .from("commissions_tab")
        .select("*")
        .eq("user_id", artistId)
        .single();
      console.log("commissionTab data:", data);
      if (data) setCommissionTab(data);
    };
    fetchCommissionTab();
  }, [artistId]);

  const handleSendOffer = async () => {
    if (!userDescription.trim()) return alert("Agrega una descripción");

    const { data: newCommission, error: commissionError } = await supabase
      .from("commissions")
      .insert([{
        user_id: userId,      
        artist_id: artistId,
        type,
        num_characters: numCharacters,
        size,
        description: userDescription,
      }])
      .select()
      .single();

    if (commissionError || !newCommission) {
      alert("No se pudo crear la comisión.");
      return;
    }

    const { data: artistData, error: artistError } = await supabase
      .from("users")
      .select("username")
      .eq("id", artistId)
      .single();

    if (artistError || !artistData) {
      alert("No se pudo encontrar el usuario destino.");
      return;
    }

    const { error: messageError } = await supabase.from("messages").insert([{
      sender_id: userId,
      receiver_id: artistId,
      content: userDescription,
      is_commission_related: true,
    }]);

    if (messageError) {
      alert("Error al enviar el primer mensaje");
      return;
    }

    router.push(`/dm/${artistData.username}?commission=1`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <BackButton />
        <Text style={styles.title}>Comisión</Text>
        {commissionTab?.comm_url && (
          <Image source={{ uri: commissionTab.comm_url }} style={styles.tablilla} />
        )}
        <Dropdown
          data={typeOptions}
          value={type}
          onChange={setType}
          placeholder="Selecciona tipo..."
        />
        <Dropdown
          data={numCharactersOptions}
          value={numCharacters}
          onChange={setNumCharacters}
          placeholder="Selecciona nº personajes..."
        />
        <Dropdown
          data={sizeOptions}
          value={size}
          onChange={setSize}
          placeholder="Selecciona tamaño..."
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Descripción de tu pedido"
          value={userDescription}
          onChangeText={setUserDescription}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendOffer}>
          <Text style={styles.sendBtnText}>Enviar oferta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fafafd",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 14,
    color: "#222",
  },
  tablilla: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#eee",
  },
  sendBtn: {
    backgroundColor: "#007b7f",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignSelf: "flex-end",
    marginBottom: 18,
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chatBox: {
    width: "100%",
    minHeight: 220,
    backgroundColor: "#f4f4f4",
    borderRadius: 12,
    marginTop: 18,
    padding: 10,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
  },
  sendBtnSmall: {
    backgroundColor: "#007b7f",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  messageBubble: {
    marginVertical: 4,
    maxWidth: "80%",
    padding: 10,
    borderRadius: 14,
  },
  myMessage: {
    backgroundColor: "#c7f5f7",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 15,
    color: "#222",
  },
  messageTime: {
    fontSize: 11,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 2,
  },
});