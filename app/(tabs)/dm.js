import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabase/supabaseClient';
import { loadUser } from '../../services/usersService';

export default function DM() {
  const [dmConversations, setDmConversations] = useState([]);
  const [commissionConversations, setCommissionConversations] = useState([]);
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const user = await loadUser();
      if (user) {
        setCurrentUserId(user.userId);
        fetchConversations(user.userId);
      }
    };
    init();
  }, []);

  const fetchConversations = async (currentUserId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id ( id, username, avatar_url ), receiver:receiver_id ( id, username, avatar_url )')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    if (!error) {
      const dm = {};
      const commissions = {};

      data.forEach(msg => {
        const otherUser = msg.sender_id === currentUserId ? msg.receiver : msg.sender;
        if (!otherUser || !otherUser.id) return;

        const key = `${otherUser.id}_${msg.is_commission_related ? 'commission' : 'dm'}`;

        if (msg.is_commission_related) {
          if (!commissions[key]) {
            commissions[key] = {
              user: otherUser,
              lastMessage: msg.content,
              // Puedes añadir más datos de comisión aquí si quieres
            };
          }
        } else {
          if (!dm[key]) {
            dm[key] = {
              user: otherUser,
              lastMessage: msg.content,
            };
          }
        }
      });

      setDmConversations(Object.values(dm));
      setCommissionConversations(Object.values(commissions));
    }
  };

  const openChat = (user, isCommission = false) => {
    if (isCommission) {
      router.push(`/dm/${user.username}?commission=1`);
    } else {
      router.push(`/dm/${user.username}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats de Comisión</Text>
      <FlatList
        data={commissionConversations}
        keyExtractor={(item) => item.user?.id ?? Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openChat(item.user, true)} style={styles.item}>
            {item.user.avatar_url ? (
              <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <View>
              <Text style={styles.username}>{item.user.username}</Text>
              {/* Aquí puedes mostrar datos de la comisión */}
              <Text style={{ color: '#007b7f', fontWeight: 'bold' }}>Comisión</Text>
              <Text>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center' }}>No tienes chats de comisión</Text>}
      />

      <Text style={styles.header}>Chats Normales</Text>
      <FlatList
        data={dmConversations}
        keyExtractor={(item) => item.user?.id ?? Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openChat(item.user)} style={styles.item}>
            {item.user.avatar_url ? (
              <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <View>
              <Text style={styles.username}>{item.user.username}</Text>
              <Text>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center' }}>No tienes chats normales</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', marginRight: 10 },
  username: { fontWeight: 'bold' },
  offerBtn: { backgroundColor: '#007b7f', borderRadius: 10, padding: 6, marginRight: 8 },
  buyBtn: { backgroundColor: '#2ecc71', borderRadius: 10, padding: 6 },
});
