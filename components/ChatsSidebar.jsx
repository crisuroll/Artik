import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase/supabaseClient';
import { loadUser } from '../services/usersService';

export default function DesktopDmSidebar() {
  const [dmConversations, setDmConversations] = useState([]);
  const [commissionConversations, setCommissionConversations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const user = await loadUser();
      if (user) fetchConversations(user.userId);
    };
    init();
  }, []);

  const fetchConversations = async (currentUserId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id ( id, username, nickname, avatar_url ), receiver:receiver_id ( id, username, nickname, avatar_url )')
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
      <Text style={styles.header}>Comisiones</Text>
      <FlatList
        data={commissionConversations}
        keyExtractor={item => item.user?.id ?? Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openChat(item.user, true)} style={styles.item}>
            {item.user.avatar_url ? (
              <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <View>
              <Text style={styles.username}>{item.user.nickname}</Text>
              <Text style={{ color: '#007b7f', fontWeight: 'bold' }}>Comisión</Text>
              <Text numberOfLines={1}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay comisiones disponibles</Text>}
      />
      <Text style={styles.header}>Chats</Text>
      <FlatList
        data={dmConversations}
        keyExtractor={item => item.user?.id ?? Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openChat(item.user)} style={styles.item}>
            {item.user.avatar_url ? (
              <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <View>
              <Text style={styles.username}>{item.user.nickname}</Text>
              <Text numberOfLines={1}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay chats disponibles</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginHorizontal: 30 },
  header: { fontWeight: 'bold', fontSize: 17, marginVertical: 8, color: '#70c0b7', fontFamily: 'Nunito', },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ccc', marginRight: 10 },
  username: { fontWeight: 'bold', fontFamily: 'Nunito', },
  empty: { color: '#888', textAlign: 'center', marginVertical: 8, fontFamily: 'Nunito', },
});