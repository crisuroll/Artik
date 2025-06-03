import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../supabase/supabaseClient';
import { loadUser } from '../../../services/usersService';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../../components/BackButton';
import CustomTextInput from '../../../components/CustomTextInput';

export default function ChatWithUser() {
  const { username, commission } = useLocalSearchParams();
  const router = useRouter();
  const isCommissionChat = commission === "1";
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const [lastCommission, setLastCommission] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const user = await loadUser();
      if (user) {
        setCurrentUserId(user.userId);
        const { data, error } = await supabase
          .from('users')
          .select('id, username, avatar_url')
          .eq('username', username)
          .single();
        if (!error && data) {
          setOtherUserId(data.id);
          setOtherUserInfo(data);

          const { data: commissionData } = await supabase
            .from('commissions')
            .select('*')
            .or(
              `and(user_id.eq.${user.userId},artist_id.eq.${data.id}),and(user_id.eq.${data.id},artist_id.eq.${user.userId})`
            )
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          setLastCommission(commissionData);
        }
      }
    };
    init();
  }, [username]);

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        if (
          (payload.new.sender_id == currentUserId && payload.new.receiver_id == otherUserId) ||
          (payload.new.sender_id == otherUserId && payload.new.receiver_id == currentUserId)
        ) {
          fetchMessages(currentUserId, otherUserId);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUserId, otherUserId]);

  const fetchMessages = async (currentUserIdParam, otherUserIdParam) => {
    let query = supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserIdParam},receiver_id.eq.${otherUserIdParam}),and(sender_id.eq.${otherUserIdParam},receiver_id.eq.${currentUserIdParam})`)
      .order('created_at', { ascending: true });

    if (isCommissionChat) {
      query = query.eq('is_commission_related', true);
    } else {
      query = query.or('is_commission_related.is.false,is_commission_related.is.null');
    }

    const { data, error } = await query;
    if (!error) setMessages(data);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (input.trim() === '' || !currentUserId || !otherUserId) return;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: input,
        is_commission_related: isCommissionChat,
      },
    ]);

    if (!error) {
      setInput('');
      fetchMessages(currentUserId, otherUserId);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === currentUserId;
    return (
      <View style={[
        styles.bubble,
        isMe ? styles.bubbleRight : styles.bubbleLeft
      ]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    if (currentUserId && otherUserId) {
      fetchMessages(currentUserId, otherUserId);
    }
  }, [currentUserId, otherUserId, isCommissionChat]);

  const isVendedor = currentUserId === lastCommission?.artist_id;
  const isComprador = currentUserId === lastCommission?.user_id;

  const [showModal, setShowModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");

  const handleSendOffer = async () => {
    if (!offerPrice || isNaN(offerPrice)) {
      alert("Introduce un precio válido");
      return;
    }
    const { error } = await supabase
      .from("commissions")
      .update({ price: parseFloat(offerPrice) })
      .eq("id", lastCommission.id);
    if (!error) {
      setShowModal(false);
      setOfferPrice("");
      const { data: updated } = await supabase
        .from("commissions")
        .select("*")
        .eq("id", lastCommission.id)
        .single();
      setLastCommission(updated);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <BackButton />
        {otherUserInfo && (
          <>
            {otherUserInfo.avatar_url ? (
              <Image
                source={{ uri: otherUserInfo.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color="#70c0b7" />
              </View>
            )}
            <Text style={styles.headerUsername}>{otherUserInfo.username}</Text>
          </>
        )}
      </View>

      {isCommissionChat && lastCommission && (
        <View style={{
          margin: 16,
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 16,
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 4,
        }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>Tu última comisión solicitada</Text>
          <Text><Text style={{ fontWeight: "bold" }}>Tipo:</Text> {lastCommission.type}</Text>
          <Text><Text style={{ fontWeight: "bold" }}>Nº personajes:</Text> {lastCommission.num_characters}</Text>
          <Text><Text style={{ fontWeight: "bold" }}>Tamaño:</Text> {lastCommission.size}</Text>
          <Text><Text style={{ fontWeight: "bold" }}>Descripción:</Text> {lastCommission.description}</Text>
          <Text><Text style={{ fontWeight: "bold" }}>Estado:</Text> {lastCommission.status}</Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Precio:</Text>{" "}
            {lastCommission.price === null ? "Sin oferta" : `${lastCommission.price} €`}
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isCommissionChat && lastCommission && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 12, borderTopWidth: 1, borderColor: '#eee' }}>
          {isVendedor && (
            <>
              <TouchableOpacity
                style={{ backgroundColor: '#70c0b7', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 22 }}
                onPress={() => setShowModal(true)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Enviar oferta</Text>
              </TouchableOpacity>
            </>
          )}
          {isComprador && (
            <TouchableOpacity
              style={{ backgroundColor: '#70c0b7', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 22 }}
              onPress={() => {
                if (lastCommission.price === null) {
                  Alert.alert(
                    "Sin Precio",
                    "El vendedor aún no ha establecido un precio para esta comisión. ¿Deseas contactarle?"
                  );
                  return; 
                }
                router.push({ pathname: '/payment', params: { commissionId: lastCommission.id } });
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Comprar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showModal && (
        <View style={{
          position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, width: 280 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Introduce el precio (€)</Text>
            <TextInput
              value={offerPrice}
              onChangeText={setOfferPrice}
              keyboardType="numeric"
              placeholder="Precio"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 12 }}>
                <Text style={{ color: '#888' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendOffer}>
                <Text style={{ color: '#007b7f', fontWeight: 'bold' }}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.inputBar}>
        <CustomTextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
          style={styles.input}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 8,
    marginRight: 4,
    backgroundColor: '#e3e3e3',
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 8,
    marginRight: 4,
    backgroundColor: '#e3e3e3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 4,
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3e3e3',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#70c0b7',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#222',
  },
  timeText: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginTop: 15,
    backgroundColor: '#f2f2f2',
    fontSize: 16,
    marginRight: 8,
    minHeight: 40,
    maxHeight: 90,
  },
  sendButton: {
    backgroundColor: '#70c0b7',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
