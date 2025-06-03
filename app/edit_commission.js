import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import UploadFile from '../components/UploadFile';
import BackButton from '../components/BackButton';
import { useEditCommission } from '../hooks/useShop';
import CustomTextInput from '../components/CustomTextInput';

function OptionListInput({ label, options, setOptions, placeholder }) {
  const [inputs, setInputs] = useState(['']);
  const safeOptions = Array.isArray(options) ? options : [];

  useEffect(() => {
    if (!safeOptions.includes("Otro")) {
      setOptions([...safeOptions, "Otro"]);
    }
  }, [safeOptions, setOptions]);

  const handleAddInput = () => {
    setInputs([...inputs, '']);
  };

  const handleConfirm = (idx) => {
    const value = inputs[idx].trim();
    if (value && !safeOptions.includes(value)) {
      setOptions([...safeOptions.filter(opt => opt !== "Otro"), value, "Otro"]);
    }
    setInputs(inputs.map((input, i) => (i === idx ? '' : input)));
  };

  const handleRemoveOption = (idx) => {
    const filtered = safeOptions.filter((_, i) => i !== idx && safeOptions[_] !== "Otro");
    setOptions([...filtered, "Otro"]);
  };

  const handleInputChange = (text, idx) => {
    setInputs(inputs.map((input, i) => (i === idx ? text : input)));
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      {inputs.map((input, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <CustomTextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={input}
            onChangeText={text => handleInputChange(text, idx)}
            placeholder={placeholder}
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity
            onPress={() => handleConfirm(idx)}
            style={{
              marginLeft: 8,
              backgroundColor: '#70c0b7',
              borderRadius: 20,
              padding: 8,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>✓</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {safeOptions.map((opt, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, margin: 2 }}>
            <Text>{opt}</Text>
            {opt !== "Otro" && (
              <TouchableOpacity onPress={() => handleRemoveOption(idx)} style={{ marginLeft: 6 }}>
                <Text style={{ color: '#d00', fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function EditCommissionScreen() {
  const router = useRouter();
  const {
    title, setTitle,
    description, setDescription,
    imageUrl, setImageUrl,
    loading, uploading, setUploading,
    fetchCommission,
    handleSave,
    typeOptions, setTypeOptions,
    numCharactersOptions, setNumCharactersOptions,
    sizeOptions, setSizeOptions,
  } = useEditCommission();

  useEffect(() => {
    fetchCommission();
  }, [fetchCommission]);

  const onSave = useCallback(async () => {
    setUploading(true);
    await handleSave(router);
    setUploading(false);
  }, [handleSave, router]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007b7f" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <BackButton />
      <Text style={styles.label}>Imagen</Text>
      <UploadFile
        imageUrl={imageUrl}
        onUploadSuccess={setImageUrl}
        setUploading={setUploading}
        bucketName="commissions"
        editable
        style={styles.imagePicker}
      />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Título</Text>
        <CustomTextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Título de la commission"
          placeholderTextColor="#bbb"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción</Text>
        <CustomTextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tu commission"
          placeholderTextColor="#bbb"
          multiline
        />
      </View>

      <OptionListInput
        label="Opciones de tipo"
        options={typeOptions}
        setOptions={setTypeOptions}
        placeholder="Añadir tipo..."
      />
      <OptionListInput
        label="Opciones de nº personajes"
        options={numCharactersOptions}
        setOptions={setNumCharactersOptions}
        placeholder="Añadir nº personajes..."
      />
      <OptionListInput
        label="Opciones de tamaño"
        options={sizeOptions}
        setOptions={setSizeOptions}
        placeholder="Añadir tamaño..."
      />

      <Pressable
        onPress={onSave}
        disabled={uploading}
        style={({ pressed }) => [
          styles.postButton,
          uploading && styles.postButtonDisabled,
          { backgroundColor: pressed ? '#5ea8a0' : '#70c0b7' }
        ]}
      >
        <Text style={styles.postButtonText}>
          {uploading ? 'Guardando...' : 'Guardar'}
        </Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    paddingBottom: 30
  },
  inputGroup: {
    marginBottom: 18,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
    fontSize: 16,
    color: '#70c0b7',
  },
  imagePicker: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  postButton: { 
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
    marginTop: 24,
  },
  postButtonText: { 
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});