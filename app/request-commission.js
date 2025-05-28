import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackButton from "../components/BackButton";
import Dropdown from "../components/Dropdown";
import { useCommission } from "../hooks/useShop";
import { supabase } from '../supabase/supabaseClient';
import { loadUser } from '../services/usersService';

export default function RequestCommission() {
  const params = useLocalSearchParams();
  console.log("params:", params);
  const artistId = params.artistId;
  console.log("artistId:", artistId);
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

  console.log("artistId antes del useEffect:", artistId);

  useEffect(() => {
    console.log("Entrando en useEffect con artistId:", artistId);
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

  console.log("commissionTab", commissionTab);

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
        <TextInput
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