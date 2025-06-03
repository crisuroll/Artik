import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackButton from "../components/BackButton";
import Dropdown from "../components/Dropdown";
import CustomTextInput from "../components/CustomTextInput";
import { useCommission } from "../hooks/useShop";
import { supabase } from '../supabase/supabaseClient';
import { loadUser } from '../services/usersService';

export default function RequestCommission() {
  const params = useLocalSearchParams();
  const artistId = params.artistId;
  const [userId, setUserId] = useState(params.userId);
  const router = useRouter();

  const [type, setType] = useState("");
  const [numCharacters, setNumCharacters] = useState("");
  const [size, setSize] = useState("");
  const [userDescription, setUserDescription] = useState("");

  const { commissionTab, loadCommissionTab, handleSendOffer } = useCommission(artistId, userId, router);

  useEffect(() => {
    if (artistId) {
      loadCommissionTab();
    }
  }, [artistId, loadCommissionTab]);

  useEffect(() => {
    if (artistId) {
      supabase
        .from("commissions_tab")
        .select("*")
        .eq("user_id", artistId)
        .then(({ data, error }) => {
          console.log("Consulta directa:", data, error);
        });
    }
  }, [artistId]);

  useEffect(() => {
    if (!userId) {
      loadUser().then(user => {
        if (user) setUserId(user.userId);
      });
    }
  }, [userId]);

  function parseOptions(opt) {
    if (Array.isArray(opt)) return opt;
    if (typeof opt === "string") {
      try {
        let parsed = JSON.parse(opt);
        if (typeof parsed === "string") parsed = JSON.parse(parsed);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  const typeOptions = parseOptions(commissionTab?.type_options).map(opt => ({ label: opt, value: opt }));
  const numCharactersOptions = parseOptions(commissionTab?.num_characters_options).map(opt => ({ label: opt, value: opt }));
  const sizeOptions = parseOptions(commissionTab?.size_options).map(opt => ({ label: opt, value: opt }));

  const noOptions = !typeOptions.length || !numCharactersOptions.length || !sizeOptions.length;


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
        {noOptions ? (
          <Text style={{ color: 'red', marginBottom: 16 }}>
            El artista aún no ha configurado las opciones de comisión.
          </Text>
        ) : (
          <>
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
          </>
        )}
        <CustomTextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Descripción de tu pedido"
          value={userDescription}
          onChangeText={setUserDescription}
          multiline
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() =>
            handleSendOffer({ type, numCharacters, size, userDescription })
          }
          disabled={noOptions}
        >
          <Text style={styles.sendBtnText}>Enviar oferta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 14,
    color: "#70c0b7",
  },
  tablilla: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#eee",
  },
  sendBtn: {
    height: 45,
    width: 160,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: "#70c0b7",
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {

  },
});